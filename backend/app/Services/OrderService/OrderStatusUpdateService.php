<?php

namespace App\Services\OrderService;

use App\Helpers\ResponseError;
use App\Jobs\PayReferral;
use App\Models\Language;
use App\Models\NotificationUser;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Payment;
use App\Models\Point;
use App\Models\PointHistory;
use App\Models\PushNotification;
use App\Models\Transaction;
use App\Models\Translation;
use App\Models\User;
use App\Models\WalletHistory;
use App\Services\CoreService;
use App\Services\EmailSettingService\EmailSendService;
use App\Services\WalletHistoryService\WalletHistoryService;
use App\Traits\Notification;
use DB;
use Log;
use Throwable;

class OrderStatusUpdateService extends CoreService
{
    use Notification;

    /**
     * @return string
     */
    protected function getModelClass(): string
    {
        return Order::class;
    }

    /**
     * @param Order $order
     * @param string|null $status
     * @param bool $isDelivery
     * @param string|null $detailStatus
     * @return array
     */
    public function statusUpdate(Order $order, ?string $status, bool $isDelivery = false, ?string $detailStatus = null): array
    {
        if ($order->status == $status) {
            return [
                'status'  => false,
                'code'    => ResponseError::ERROR_252,
                'message' => __('errors.' . ResponseError::ERROR_252, locale: $this->language)
            ];
        }

        $order = $order->fresh([
            'user',
            'shop',
            'pointHistories',
            'orderRefunds',
            'orderDetails.children',
            'transactions.paymentSystem',
        ]);

        try {
            $order = DB::transaction(function () use ($order, $status, $detailStatus) {

                $paymentCash = Payment::where('tag', Payment::TAG_CASH)->value('id');

                if (in_array(request('transaction_status'), Transaction::STATUSES)) {

                    $paymentId = $order?->transaction?->payment_sys_id ?? $paymentCash;

                    $order->createTransaction([
                        'price'              => $order->total_price,
                        'user_id'            => $order?->user_id,
                        'payment_sys_id'     => $paymentId,
                        'payment_trx_id'     => $order?->transaction?->payment_trx_id,
                        'note'               => $order->id,
                        'perform_time'       => now(),
                        'status_description' => "Transaction for model #$order->id",
                        'status'             => request('transaction_status'),
                    ]);

                }

                if ($status == Order::STATUS_DELIVERED) {

                    $default = data_get(Language::languagesList()->where('default', 1)->first(), 'locale');

                    $tStatus = Translation::where(function ($q) use ($default) {
                        $q->where('locale', $this->language)->orWhere('locale', $default);
                    })
                        ->where('key', $status)
                        ->first()?->value;

                    $paymentWallet = Payment::where('tag', Payment::TAG_WALLET)->value('id');

                    $isWallet = $order?->transaction?->payment_sys_id === $paymentWallet;

                    if ($isWallet) {
                        $this->adminWalletTopUp($order);
                    }

                    $order = $order->loadMissing([
                        'coupon',
                        'pointHistories',
                    ]);

                    $point = Point::getActualPoint($order->total_price, $order->shop_id);

                    if (!empty($point)) {
                        $token  = $order->user?->firebase_token;
                        $token = is_array($token) ? $token : [$token];

                        $this->sendNotification(
                            $token,
                            __('errors.' . ResponseError::ADD_CASHBACK, ['status' => !empty($tStatus) ? $tStatus : $status], $this->language),
                            $order->id,
                            [
                                'id'     => $order->id,
                                'status' => $order->status,
                                'type'   => PushNotification::ADD_CASHBACK
                            ],
                            [$order->user_id]
                        );

                        $order->pointHistories()->create([
                            'user_id'   => $order->user_id,
                            'price'     => $point,
                            'note'      => 'cashback',
                        ]);

                        $order->user?->wallet?->increment('price', $point);
                    }

                    PayReferral::dispatchAfterResponse($order->user, 'increment');

                    if ($order?->transaction?->paymentSystem?->tag == Payment::TAG_CASH) {

                        $trxStatus = request('transaction_status');
                        $trxStatus = in_array($trxStatus, Transaction::STATUSES) ? $trxStatus : Transaction::STATUS_PAID;

                        $order->transaction->update(['status' => $trxStatus]);
                    }

                }

                if ($status == Order::STATUS_CANCELED && $order->orderRefunds?->count() === 0) {

                    $user = $order->user;

                    $order->transaction?->update([
                        'status' => Transaction::STATUS_CANCELED,
                    ]);

                    if ($order->pointHistories?->count() > 0) {
                        foreach ($order->pointHistories as $pointHistory) {
                            /** @var PointHistory $pointHistory */
                            $user?->wallet?->decrement('price', $pointHistory->price);
                            $pointHistory->delete();
                        }
                    }

                    if ($order->status === Order::STATUS_DELIVERED) {
                        PayReferral::dispatchAfterResponse($user, 'decrement');
                    }

                    $order->orderDetails->map(function (OrderDetail $orderDetail) {
                        $orderDetail->stock()->increment('quantity', $orderDetail->quantity);
                    });

                }

                if (in_array($order->status, $order->shop?->email_statuses ?? []) && ($order->email || $order->user?->email)) {
                    (new EmailSendService)->sendOrder($order);
                }

                $order->update([
                    'status'  => $status,
                    'current' => in_array($status, [Order::STATUS_DELIVERED, Order::STATUS_CANCELED]) ? 0 : $order->current,
                    'note'    => request('note') . " | $order->note",
                ]);

                if (!empty($detailStatus)) {

                    foreach ($order->orderDetails as $orderDetail) {

                        $order->update(['status' => $detailStatus]);

                        $orderDetail->children()->update(['status' => $detailStatus]);

                    }

                }

                return $order;
            });
        } catch (Throwable $e) {

            $this->error($e);

            return [
                'status'  => false,
                'code'    => ResponseError::ERROR_501,
                'message' => $e->getMessage()
            ];
        }

        /** @var Order $order */

        $order->fresh(['shop.seller', 'deliveryMan', 'user']);

        /** @var NotificationUser $notification */
        $notification = $order->user?->notifications
            ?->where('type', \App\Models\Notification::ORDER_STATUSES)
            ?->first();

        if ($notification?->notification?->active) {
            $userToken = $order->user?->firebase_token;
        }

        if (!$isDelivery) {
            $deliveryManToken = $order->deliveryMan?->firebase_token;
        }

        if (in_array($status, [Order::STATUS_ON_A_WAY, Order::STATUS_DELIVERED, Order::STATUS_CANCELED])) {
            $sellerToken = $order->shop?->seller?->firebase_token;
        }

        $firebaseTokens = array_merge(
            !empty($userToken) && is_array($userToken)        ? $userToken        : [],
            !empty($deliveryManToken) && is_array($deliveryManToken) ? $deliveryManToken : [],
            !empty($sellerToken) && is_array($sellerToken)           ? $sellerToken      : [],
        );

        $userIds = array_merge(
            !empty($userToken) && $order->user?->id         ? [$order->user?->id]          : [],
            !empty($deliveryManToken) && $order->deliveryMan?->id  ? [$order->deliveryMan?->id]   : [],
            !empty($sellerToken) && $order->shop?->seller?->id     ? [$order->shop?->seller?->id] : []
        );

        $default = data_get(Language::languagesList()->where('default', 1)->first(), 'locale');

        $tStatus = Translation::where(function ($q) use ($default) {
            $q->where('locale', $this->language)->orWhere('locale', $default);
        })
            ->where('key', $status)
            ->first()?->value;

        $this->sendNotification(
            array_values(array_unique($firebaseTokens)),
            __('errors.' . ResponseError::STATUS_CHANGED, ['status' => !empty($tStatus) ? $tStatus : $status], $this->language),
            $order->id,
            [
                'id'     => $order->id,
                'status' => $order->status,
                'type'   => PushNotification::STATUS_CHANGED
            ],
            $userIds,
            __('errors.' . ResponseError::STATUS_CHANGED, ['status' => !empty($tStatus) ? $tStatus : $status], $this->language),
        );

        return ['status' => true, 'code' => ResponseError::NO_ERROR, 'data' => $order];
    }

    /**
     * @param Order $order
     * @return void
     * @throws Throwable
     */
    private function adminWalletTopUp(Order $order): void
    {
        /** @var User $admin */
        $admin = User::with('wallet')->whereHas('roles', fn($q) => $q->where('name', 'admin'))->first();

        if (!$admin->wallet) {
            Log::error("admin #$admin?->id doesnt have wallet");
            return;
        }

        $request = request()->merge([
            'type'      => 'topup',
            'price'     => $order->total_price,
            'note'      => "For Seller Order #$order->id",
            'status'    => WalletHistory::PAID,
            'user'      => $admin,
        ])->all();

        (new WalletHistoryService)->create($request);
    }

}

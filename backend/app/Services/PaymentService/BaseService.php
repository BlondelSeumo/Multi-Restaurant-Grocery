<?php

namespace App\Services\PaymentService;

use App\Services\UserServices\UserWalletService;
use Exception;
use Log;
use Throwable;
use App\Models\Cart;
use App\Models\User;
use App\Models\Order;
use App\Models\Wallet;
use App\Models\Payout;
use App\Models\Payment;
use App\Models\Currency;
use App\Models\Settings;
use App\Models\Transaction;
use Illuminate\Support\Str;
use App\Traits\Notification;
use App\Models\WalletHistory;
use App\Services\CoreService;
use App\Helpers\ResponseError;
use App\Models\PaymentProcess;
use App\Helpers\NotificationHelper;
use Illuminate\Database\Eloquent\Model;
use App\Services\OrderService\OrderService;
use App\Repositories\CartRepository\CartRepository;
use App\Services\TransactionService\TransactionService;
use App\Services\WalletHistoryService\WalletHistoryService;

class BaseService extends CoreService
{
    use Notification;

    protected function getModelClass(): string
    {
        return Payout::class;
    }

    public function afterHook($token, $status, $token2 = null): void
    {
        $paymentProcess = PaymentProcess::with(['model.transactions'])->where('id', $token)->first();

        if (empty($paymentProcess)) {
            $paymentProcess = PaymentProcess::with(['model.transactions'])->where('id', $token2)->first();
        }

        if (empty($paymentProcess)) {
            return;
        }

        /** @var PaymentProcess $paymentProcess */
        $paymentId = $paymentProcess->data['payment_id'] ?? Payment::first()?->id;
        $model = $paymentProcess->model;

        if ($paymentProcess->model_type === Cart::class && $status === Transaction::STATUS_PAID) {

            try {
                $result = (new OrderService)->create($paymentProcess->data);

                $this->newOrderNotification($result);

                /** @var Order $order */
                $order = $result['data'];

                $model->transactions()->update([
                    'payable_id'   => $order->id,
                    'payable_type' => Order::class,
                ]);

                $order?->createTransaction([
                    'price'              => $paymentProcess->data['total_price'],
                    'user_id'            => $order->user_id,
                    'payment_sys_id'     => $paymentId,
                    'payment_trx_id'     => $token,
                    'note'               => $order->id,
                    'perform_time'       => now(),
                    'status_description' => "Transaction for model #$order->id",
                    'status'             => $status,
                ]);

                if ((int)data_get(Settings::where('key', 'order_auto_approved')->first(), 'value') === 1) {
                    (new NotificationHelper)->autoAcceptNotification(
                        data_get($result, 'data'),
                        $this->language,
                        Order::STATUS_ACCEPTED
                    );
                }

            } catch (Throwable $e) {
                $this->error($e);
            }

            $paymentProcess->delete();

            return;
        }

        Log::error("type: $paymentProcess->model_type");
        if ($paymentProcess->model_type === Wallet::class && $status === Transaction::STATUS_PAID) {

            $data = $paymentProcess->data;

            $totalPrice = (double)data_get($data, 'total_price');

            $user = User::find($paymentProcess->model?->user_id);

            Log::error("kirdi: $totalPrice");

            try {
                $note = __(
                    'errors.' . ResponseError::WALLET_TOP_UP,
                    ['sender' => ''],
                    $user?->lang ?? $this->language
                );

                (new WalletHistoryService)->create([
                    'type'           => 'topup',
                    'payment_sys_id' => data_get($data, 'payment_id'),
                    'created_by'     => data_get($data, 'created_by'),
                    'payment_trx_id' => $token,
                    'price'          => $totalPrice,
                    'note'           => $note,
                    'status'         => WalletHistory::PAID,
                    'user'           => $user
                ]);

            } catch (Throwable $e) {
                $this->error($e);
            }

            $paymentProcess->delete();

            return;
        }

        $modelClass = Str::replace('App\\Models\\', '', $paymentProcess->model_type);

        if ($paymentProcess->model_type === Order::class && !isset($paymentProcess->data['tips'])) {

            $split = (int)($paymentProcess->data['split'] ?? 1);

            /** @var Order $order */
            $order = $paymentProcess->model;

            if ($split === 1) { // for not qr orders

                $tip = ($paymentProcess->data['after_payment_tips'] ?? 0 / $order->rate);

                $order->update([
                    'tips' 		  => round($order->tips + $tip, 2),
                    'total_price' => $order->total_price + $tip
                ]);

                $order->createTransaction([
                    'price'              => $order->total_price,
                    'user_id'            => $order->user_id,
                    'payment_sys_id'     => $paymentId,
                    'payment_trx_id'     => $token,
                    'note'               => $order->id,
                    'perform_time'       => now(),
                    'status_description' => "Transaction for $modelClass #$order->id",
                    'status'             => $status,
                ]);

                $paymentProcess->delete();

                return;
            }

            $splitPaidCount = Transaction::whereNotNull('parent_id')
                ->where('payable_id',   $paymentProcess->model_id)
                ->where('payable_type', $paymentProcess->model_type)
                ->where('status',	 Transaction::STATUS_PAID)
                ->count();

            if ($status === Transaction::STATUS_PAID) {
                $splitPaidCount += 1;
            }

            if ($status !== Transaction::STATUS_PAID) {

                $processData = $paymentProcess->data;
                $processData['clicked'] = true;

                $paymentProcess->update(['data' => $processData]);

            }

            $transactionId = $order->transaction?->id;

            if ($status === Transaction::STATUS_PAID) {

                $transactionId = $order->createTransaction([
                    'price'              => $order->total_price,
                    'user_id'            => $order->user_id,
                    'payment_sys_id'     => $paymentId,
                    'payment_trx_id'     => $token,
                    'note'               => $order->id,
                    'perform_time'       => now(),
                    'status_description' => "Transaction for $modelClass #$order->id",
                    'status'             => $splitPaidCount < $split ? Transaction::STATUS_SPLIT : $status,
                ])?->id;

                $tip = ($paymentProcess->data['after_payment_tips'] ?? 0 / $order->rate);

                if (($splitPaidCount < $split ? Transaction::STATUS_SPLIT : $status) === Transaction::STATUS_PAID) {

                    $order->update([
                        'tips' 		  => round($order->tips + $tip, 2),
                        'total_price' => $order->total_price + $tip
                    ]);

                    $paymentProcess->delete();

                }

            }

            if ($splitPaidCount <= $split) {

                $order->createManyTransaction([
                    'price'              => $order->total_price / $split,
                    'user_id'            => $order->user_id,
                    'payment_sys_id'     => $paymentId,
                    'payment_trx_id'     => $token,
                    'note'               => "Split payment for $modelClass #$order->id",
                    'perform_time'       => now(),
                    'status_description' => "Transaction for $modelClass #$order->id with split",
                    'status'             => $status,
                    'parent_id'          => $transactionId,
                ]);

            }

            return;

        }

        if ($paymentProcess->model_type === Order::class && isset($paymentProcess->data['tips'])) {

            $paymentProcess->model?->createTransaction([
                'price'              => $paymentProcess->data['tips'],
                'user_id'            => $paymentProcess->model->user_id,
                'payment_sys_id'     => $paymentId,
                'payment_trx_id'     => $token,
                'note'               => $paymentProcess->model->id,
                'perform_time'       => now(),
                'status_description' => "Transaction for $modelClass #{$paymentProcess->model->id}",
                'status'             => $status,
                'type'				 => Transaction::TYPE_TIP
            ]);

            $paymentProcess->model?->update([
                'tips' => $paymentProcess->data['tips'],
                'total_price' => $paymentProcess->model->total_price + $paymentProcess->data['tips']
            ]);

            $paymentProcess->delete();

            return;
        }

        if ($paymentProcess->model_type !== Cart::class) {

            $paymentProcess->model?->createTransaction([
                'price'              => $paymentProcess->model->total_price,
                'user_id'            => $paymentProcess->model->user_id,
                'payment_sys_id'     => $paymentId,
                'payment_trx_id'     => $token,
                'note'               => $paymentProcess->model->id,
                'perform_time'       => now(),
                'status_description' => "Transaction for $modelClass #{$paymentProcess->model->id}",
                'status'             => $status,
            ]);

            $paymentProcess->delete();

        }

    }

    /**
     * @param Model $model
     * @param array $data
     * @param User|null $user
     * @return int|mixed
     * @throws Exception
     */
    public function walletPriceWithdraw(Model $model, array $data, ?User $user = null): int|float
    {
        if (!isset($data['from_wallet_price'])) {
            return 0;
        }

        if (empty($user)) {
            $user = User::with('wallet')->find(auth('sanctum')->id());
        }

        if (empty($user->wallet?->uuid)) {
            $user = (new UserWalletService)->create($user);
        }

        $wallet = Payment::where('tag', 'wallet')->first();

        $ratePrice = max($data['from_wallet_price'], 0);

        if ($user->wallet?->price >= $ratePrice) {

            $user->wallet()->update(['price' => $user->wallet->price - $ratePrice]);

            /** @var Order|Cart|Wallet $model */
            $transaction = $model->createTransaction([
                'price'              => $data['from_wallet_price'],
                'user_id'            => $user->id,
                'payment_sys_id'     => $wallet->id,
                'payment_trx_id'     => null,
                'note'               => "$wallet->id",
                'perform_time'       => now(),
                'status_description' => "Transaction #$wallet->id",
                'request'            => null,
                'type'	             => Transaction::TYPE_MODEL,
            ]);

            (new TransactionService)->walletHistoryAdd($user, $transaction, $model, paymentType: 'withdraw');

            return $data['from_wallet_price'];
        }

        throw new Exception(__('errors.' . ResponseError::ERROR_109, locale: $this->language));
    }

    /**
     * @param array $data
     * @param array $payload
     * @return array
     * @throws Exception
     */
    public function getPayload(array $data, array $payload): array
    {
        $key    = '';
        $before = [];
        $tips   = data_get($data, 'tips');

        if (data_get($data, 'cart_id')) {

            $key = 'cart_id';
            $before = $this->beforeCart($data, $payload);

        } else if (!$tips && data_get($data, 'order_id')) {

            $key = 'order_id';
            $before = $this->beforeOrder($data, $payload);

        } else if ($tips && data_get($data, 'order_id')) {

            $key = 'order_id';
            $before = $this->beforeTip($data, $payload);

        } else if (data_get($data, 'wallet_id')) {

            $key = 'wallet_id';
            $before = $this->beforeWallet($data, $payload);

        }

        return [
            $key,
            $before
        ];
    }

    /**
     * @param array $data
     * @param array|null $payload
     * @return array
     * @throws Exception
     */
    public function beforeCart(array $data, array|null $payload): array
    {
        $cart      = Cart::find(data_get($data, 'cart_id'));
        $calculate = (new CartRepository)->calculateByCartId((int)data_get($data, 'cart_id'), $data);

        if (!data_get($calculate, 'status')) {
            throw new Exception('Cart is empty');
        }

        $totalPrice = ceil(data_get($calculate, 'data.total_price') * 100);

        $totalPrice -= $this->walletPriceWithdraw($cart, $data);

        return [
            'model_type'  => get_class($cart),
            'model_id'    => $cart->id,
            'total_price' => $totalPrice,
            'currency'    => $cart->currency?->title ?? data_get($payload, 'currency'),
            'cart_id'     => $cart->id,
            'user_id'     => auth('sanctum')->id(),
            'status'      => Order::STATUS_NEW,
        ] + $data;
    }

    /**
     * @param array $data
     * @param array|null $payload
     * @return array
     * @throws Exception
     */
    public function beforeOrder(array $data, array|null $payload): array
    {
        /** @var Order $order */
        $order = Order::with([
            'currency',
            'transactions' => fn($q) => $q->where('status', Transaction::STATUS_PAID) //when one of split payment failed. Generate new link with total paying price
        ])->find(data_get($data, 'order_id'));

        $repay = Transaction::where([
            'status'        => Transaction::STATUS_REPAY,
            'payable_type'  => get_class($order),
            'payable_id'    => $order->id,
        ])->first()?->price;

        $totalPrice = round($order->rate_total_price - $order->transactions?->sum('price') - $repay, 2);

        $totalPrice -= $this->walletPriceWithdraw($order, $data);

        $tip = max(round($data['after_payment_tips'] ?? 0, 1), 0);

        $totalPrice += $tip;

        return [
            'model_type'  		 => get_class($order),
            'model_id'    		 => $order->id,
            'after_payment_tips' => $tip,
            'total_price' 		 => max($totalPrice, 0),
            'currency'    		 => $order->currency?->title ?? data_get($payload, 'currency')
        ];
    }

    /**
     * @param array $data
     * @param array|null $payload
     * @return array
     */
    public function beforeWallet(array $data, array|null $payload): array
    {
        $model = Wallet::find(data_get($data, 'wallet_id'));

        $totalPrice = ceil((double)data_get($data, 'total_price'));

        $currency = Currency::find($this->currency);

        return [
            'model_type'     => get_class($model),
            'model_id'       => $model->id,
            'total_price'    => $totalPrice,
            'currency'       => $currency?->title ?? data_get($payload, 'currency')
        ];
    }

    /**
     * @param array $data
     * @param array|null $payload
     * @return array
     */
    public function beforeTip(array $data, array|null $payload): array
    {
        /** @var Order $order */
        $order = Order::find(data_get($data, 'order_id'));

        $totalPrice = round(data_get($data, 'tips') / $order->rate, 2);

        return [
            'model_type'  => get_class($order),
            'model_id'    => $order->id,
            'total_price' => max($totalPrice, 0),
            'tips' 		  => max($totalPrice, 0),
            'currency'    => $order->currency?->title ?? data_get($payload, 'currency')
        ];
    }

}

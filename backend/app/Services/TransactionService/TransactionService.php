<?php

namespace App\Services\TransactionService;

use App\Helpers\ResponseError;
use App\Models\Cart;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletHistory;
use App\Services\CoreService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class TransactionService extends CoreService
{
    protected function getModelClass(): string
    {
        return Transaction::class;
    }

    public function createTransaction(Model $model, array $data): array
    {
        $payment = $this->checkPayment(data_get($data, 'payment_sys_id'), $model, true, $data);

        if (!data_get($payment, 'status')) {
            return $payment;
        }

        if (data_get($payment, 'already_payed')) {
            return ['status' => true, 'code' => ResponseError::NO_ERROR, 'data' => $model];
        }

        $tag = data_get($payment, 'payment_tag');

        $className = Str::replace('App\\Models\\', '', get_class($model));

        /** @var Cart|Order $model */
        if (isset($data['tips'])) {
            $transaction = $model->createTransaction([
                'price'              => $model->transaction?->id ? $model->tips : $model->total_price,
                'user_id'            => property_exists($model, 'owner_id') ? $model->owner_id : $model->user_id,
                'payment_sys_id'     => data_get($data, 'payment_sys_id'),
                'payment_trx_id'     => data_get($data, 'payment_trx_id'),
                'note'               => $model->id,
                'perform_time'       => now(),
                'status_description' => "Transaction for $className #$model->id",
                'request'            => $tag === Payment::TAG_CASH ? Transaction::REQUEST_WAITING : null,
                'type'	             => $model->transaction?->id ? Transaction::TYPE_TIP : Transaction::TYPE_MODEL,
            ]);
        } else {
            $transaction = $model->createTransaction([
                'price'              => $model->total_price,
                'user_id'            => $model->user_id,
                'payment_sys_id'     => data_get($data, 'payment_sys_id'),
                'payment_trx_id'     => data_get($data, 'payment_trx_id'),
                'note'               => $model->id,
                'perform_time'       => now(),
                'status_description' => "Transaction for $className #$model->id",
                'request'            => $tag === Payment::TAG_CASH ? Transaction::REQUEST_WAITING : null,
                'type'	             => Transaction::TYPE_MODEL,
            ]);
        }

        if (data_get($payment, 'wallet')) {

            $this->walletHistoryAdd($model->user, $transaction, $model);

        }

        return ['status' => true, 'code' => ResponseError::NO_ERROR, 'data' => $model];
    }

    public function orderTransaction(int $id, array $data): array
    {
        /** @var Order $order */
        $order = Order::with('user')->find($id);

        if (!$order) {
            return ['status' => true, 'code' => ResponseError::ERROR_404];
        }

        return $this->createTransaction($order, $data);
    }

    public function walletTransaction(int $id, array $data): array
    {
        $wallet = Wallet::find($id);

        if (empty($wallet)) {
            return ['status' => true, 'code' => ResponseError::ERROR_404];
        }

        $wallet->createTransaction([
            'price'                 => data_get($data, 'price'),
            'user_id'               => data_get($data, 'user_id'),
            'payment_sys_id'        => data_get($data, 'payment_sys_id'),
            'payment_trx_id'        => data_get($data, 'payment_trx_id'),
            'note'                  => $wallet->id,
            'perform_time'          => now(),
            'status_description'    => "Transaction for wallet #$wallet->id"
        ]);

        return ['status' => true, 'code' => ResponseError::NO_ERROR, 'data' => $wallet];
    }

    public function checkPayment(int|Payment $id, $model, bool $isOrder = false, array $data = []): array
    {
        $payment = $id;

        if (is_int($id)) {
            $payment = Payment::where('active', 1)->find($id);
        }

        if (!$payment) {
            return ['status' => false, 'code' => ResponseError::ERROR_404];
        } else if ($payment->tag !== 'wallet') {
            return ['status' => true, 'code' => ResponseError::NO_ERROR, 'payment_tag' => $payment->tag];
        }

        if ($isOrder && !isset($data['tips'])) {

            /** @var Order $model */
            $changedPrice = data_get($model, 'total_price', 0) - $model?->transaction?->price;

            if ($model?->transaction?->status === 'paid' && $changedPrice <= 1) {
                return ['status' => true, 'code' => ResponseError::NO_ERROR, 'already_payed' => true];
            }

            data_set($model, 'total_price', $changedPrice);
        }

        /** @var User|null $user */
        $user = User::with('wallet')->firstWhere('id', data_get($model, 'user_id'));

        if (empty($user) || empty($user->wallet)) {
            return [
                'status'    => false,
                'code'      => ResponseError::ERROR_109,
                'message'   => 'Incorrect user or wallet not found'
            ];
        }

        $ratePrice = max(data_get($model, 'total_price', 0), 0);

        if (isset($data['tips'])) {
            $ratePrice = max($data['tips'] / $model?->rate, 0);
        }

        if ($user->wallet->price >= $ratePrice) {

            $user->wallet()->update(['price' => $user->wallet->price - $ratePrice]);

            if (isset($data['tips'])) {
                $tips = $model->tips + $ratePrice;

                $model->update([
                    'tips' => $ratePrice,
					'total_price' => $model->total_price + $tips

                ]);
            }

            return ['status' => true, 'code' => ResponseError::NO_ERROR, 'wallet' => $user->wallet];
        }

        return ['status' => false, 'code' => ResponseError::ERROR_109, 'message' => 'Insufficient wallet balance'];

    }

    public function walletHistoryAdd(?User $user, Transaction $transaction, $model, $type = 'Order', $paymentType = 'topup'): void
    {
        $modelId = data_get($model, 'id');

        $message = "Payment $type #$modelId via Wallet";

        if ($transaction->type === Transaction::TYPE_TIP) {
            $message = "Payment tip $type #$modelId via Wallet";
        }

        $user->wallet->histories()->create([
            'uuid'              => Str::uuid(),
            'transaction_id'    => $transaction->id,
            'type'              => $paymentType,
            'price'             => $transaction->price,
            'note'              => $message,
            'status'            => WalletHistory::PAID,
            'created_by'        => $transaction->user_id,
        ]);

        $transaction->update(['status' => WalletHistory::PAID]);
    }
}

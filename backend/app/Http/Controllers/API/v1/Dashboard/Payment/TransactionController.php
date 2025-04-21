<?php

namespace App\Http\Controllers\API\v1\Dashboard\Payment;

use App\Helpers\ResponseError;
use App\Http\Requests\Payment\TransactionRequest;
use App\Http\Requests\Payment\TransactionUpdateRequest;
use App\Http\Resources\OrderResource;
use App\Http\Resources\WalletResource;
use App\Models\Order;
use App\Models\PaymentProcess;
use App\Models\Transaction;
use App\Services\TransactionService\TransactionService;
use Illuminate\Http\JsonResponse;

class TransactionController extends PaymentBaseController
{
    public function store(string $type, int $id, TransactionRequest $request): JsonResponse
    {
        if ($type === 'order') {

            $result = (new TransactionService)->orderTransaction($id, $request->validated());

            if (!data_get($result, 'status')) {
                return $this->onErrorResponse($result);
            }

            return $this->successResponse(
                __('web.record_successfully_created'),
                OrderResource::make(data_get($result, 'data'))
            );

        }

        $result = (new TransactionService)->walletTransaction($id, $request->validated());

        if (!data_get($result, 'status')) {
            return $this->onErrorResponse($result);
        }

        return $this->successResponse(
            __('web.record_successfully_created'),
            WalletResource::make(data_get($result, 'data'))
        );
    }

    public function updateStatus(string $type, int $id, TransactionUpdateRequest $request): JsonResponse
    {
        /** @var Order $order */
        $order = Order::with('transactions')->find($id);

        if (!$order) {
            return $this->onErrorResponse(['code' => ResponseError::ERROR_404]);
        }

        if (!$order->transactions) {
            return $this->onErrorResponse([
                'code'      => ResponseError::ERROR_501,
                'message'   => 'Transaction is not created'
            ]);
        }

        $paymentProcess = PaymentProcess::find($request->input('token'));

        if (empty($paymentProcess) && !in_array($order->transaction->paymentSystem?->tag, ['cash', 'wallet'])) {
            return $this->onErrorResponse(['code' => ResponseError::ERROR_400, 'message' => 'Order not paid']);
        }

        /** @var Transaction $transaction */
        $transaction = $order->transactions()
            ->where('id', $request->input('transaction_id'))
            ->first();

        $transaction->update([
            'status'         => $request->input('status'),
            'payment_sys_id' => $request->input('payment_sys_id') ?? $transaction->payment_sys_id,
        ]);

        $paymentProcess?->delete();

        return $this->successResponse('Success', $order->fresh('transactions'));

    }

}

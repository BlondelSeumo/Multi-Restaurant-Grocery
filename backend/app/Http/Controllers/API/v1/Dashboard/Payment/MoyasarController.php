<?php

namespace App\Http\Controllers\API\v1\Dashboard\Payment;

use App\Http\Requests\Payment\StripeRequest;
use App\Models\Payment;
use App\Models\PaymentPayload;
use App\Models\Transaction;
use App\Services\PaymentService\MoyasarService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Log;
use Redirect;
use Throwable;

class MoyasarController extends PaymentBaseController
{
    public function __construct(private MoyasarService $service)
    {
        parent::__construct($service);
    }

    /**
     * process transaction.
     *
     * @param StripeRequest $request
     * @return JsonResponse
     */
    public function orderProcessTransaction(StripeRequest $request): JsonResponse
    {
        try {
            $result = $this->service->orderProcessTransaction($request->all());

            return $this->successResponse('success', $result);
        } catch (Throwable $e) {
            $this->error($e);
            return $this->onErrorResponse([
                'code'    => $e->getCode(),
                'message' => $e->getMessage()
            ]);
        }

    }

    /**
     * @param Request $request
     * @return RedirectResponse
     */
    public function orderResultTransaction(Request $request): RedirectResponse
    {
        $orderId = (int)$request->input('order_id');

        $to = config('app.front_url') . "orders/$orderId";

        return Redirect::to($to);
    }


    /**
     * @param Request $request
     * @return void
     */
    public function paymentWebHook(Request $request): void
    {
        $payload = PaymentPayload::where('tag', Payment::TAG_MOYA_SAR)->first()?->payload;

        if (data_get($payload, 'secret_token') !== $request->input('secret_token')) {
            Log::error('secret_token', $request->all());
            return;
        }

        $status = $request->input('data.status');

        $status = match ($status) {
            'paid', 'captured'      => Transaction::STATUS_PAID,
            'failed'                => Transaction::STATUS_CANCELED,
            'refunded', 'voided'    => Transaction::STATUS_REFUND,
            default                 => 'progress',
        };

        $token = $request->input('data.invoice_id');

        Log::error('paymentWebHook', $request->all());

        $this->service->afterHook($token, $status);
    }

}

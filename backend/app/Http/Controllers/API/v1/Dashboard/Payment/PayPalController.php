<?php

namespace App\Http\Controllers\API\v1\Dashboard\Payment;

use App\Http\Controllers\Controller;
use App\Http\Requests\Payment\SplitRequest;
use App\Http\Requests\Payment\StripeRequest;
use App\Models\Payment;
use App\Models\PaymentPayload;
use App\Models\PaymentProcess;
use App\Models\Transaction;
use App\Services\PaymentService\PayPalService;
use App\Traits\ApiResponse;
use App\Traits\OnResponse;
use Http;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class PayPalController extends Controller
{
    use OnResponse, ApiResponse;

    public function __construct(private PayPalService $service)
    {
        parent::__construct();
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
            $result = $this->service->processTransaction($request->all());

            return $this->successResponse('success', $result);
        } catch (Throwable $e) {
            $this->error($e);
            return $this->onErrorResponse([
                'message' => $e->getMessage(),
                'param'   => $e->getFile() . $e->getLine()
            ]);
        }
    }

    /**
     * process transaction.
     *
     * @param SplitRequest $request
     * @return JsonResponse
     */
    public function splitTransaction(SplitRequest $request): JsonResponse
    {
        try {
            $result = $this->service->splitTransaction($request->all());

            return $this->successResponse('success', $result);
        } catch (Throwable $e) {
            $this->error($e);
            return $this->onErrorResponse([
                'message' => $e->getMessage(),
                'param'   => $e->getFile() . $e->getLine()
            ]);
        }
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function paymentWebHook(Request $request): JsonResponse
    {
        $token = $request->input('data.object.id');

        $payment = Payment::where('tag', 'stripe')->first();

        $paymentPayload = PaymentPayload::where('payment_id', $payment?->id)->first();
        $payload        = $paymentPayload?->payload;

        /** @var PaymentProcess $paymentProcess */
        $paymentProcess = PaymentProcess::where('id', $token)->first();

        if (@$paymentProcess?->data['type'] === 'mobile') {

            $status = match ($request->input('data.object.status')) {
                'succeeded', 'paid' => Transaction::STATUS_PAID,
                'payment_failed', 'canceled' => Transaction::STATUS_CANCELED,
                default => 'progress',
            };

            $this->service->afterHook($token, $status);

            return $this->successResponse();
        }

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . data_get($payload, 'stripe_sk')
        ])
            ->get("https://api.stripe.com/v1/checkout/sessions?limit=1&payment_intent=$token")
            ->json();

        $token2 = data_get($response, 'data.0.id');

        $status = match (data_get($response, 'data.0.payment_status')) {
            'succeeded', 'paid'	=> Transaction::STATUS_PAID,
            'payment_failed', 'canceled' => Transaction::STATUS_CANCELED,
            default => 'progress',
        };

        try {
            $this->service->afterHook($token, $status, $token2);
            return $this->successResponse();
        } catch (Throwable $e) {
            return $this->onErrorResponse([
                'code' => $e->getCode(),
                'message' => $e->getMessage() . $e->getFile() . $e->getLine()
            ]);
        }
    }

}

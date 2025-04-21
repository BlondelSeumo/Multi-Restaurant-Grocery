<?php

namespace App\Http\Controllers\API\v1\Dashboard\Payment;

use Log;
use Http;
use Redirect;
use Throwable;
use App\Models\Payment;
use App\Models\Transaction;
use Illuminate\Http\Request;
use App\Models\PaymentPayload;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use App\Http\Requests\Payment\StripeRequest;
use App\Services\PaymentService\MollieService;

class MollieController extends PaymentBaseController
{
    public function __construct(private MollieService $service)
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
        $to = config('app.front_url');

        if ($orderId) {
            $to .= "orders/$orderId";
        }

        return Redirect::to($to);
    }

    /**
     * @param Request $request
     * @return void
     */
    public function paymentWebHook(Request $request): void
    {
        $id = $request->input('id');

        $payment        = Payment::where('tag', Payment::TAG_MOLLIE)->first();
        $paymentPayload = PaymentPayload::where('payment_id', $payment?->id)->first();
        $payload        = $paymentPayload?->payload;

        $token = base64_encode(data_get($payload, 'secret_key'));

        $headers = [
            'Authorization' => "Basic $token"
        ];

        $getTransaction = Http::withHeaders($headers)->get("https://api.mollie.com/v2/payment-links/$id")->json();

        $status = Transaction::STATUS_PROGRESS;

        if (isset($getTransaction['paidAt']) && !empty($getTransaction['paidAt'])) {
            $status = Transaction::STATUS_PAID;
        }

        $this->service->afterHook($id, $status);
    }
}

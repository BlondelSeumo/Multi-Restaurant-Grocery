<?php

namespace App\Http\Controllers\API\v1\Dashboard\Payment;

use App\Helpers\ResponseError;
use App\Http\Controllers\Controller;
use App\Http\Requests\Payment\StripeRequest;
use App\Models\Payment;
use App\Models\Transaction;
use App\Models\WalletHistory;
use App\Services\PaymentService\MercadoPagoService;
use App\Traits\ApiResponse;
use App\Traits\OnResponse;
use Exception;
use Http;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Log;
use Redirect;
use Throwable;

class MercadoPagoController extends Controller
{
    use OnResponse, ApiResponse;

    public function __construct(private MercadoPagoService $service)
    {
        parent::__construct();
    }

    /**
     * process transaction.
     *
     * @param StripeRequest $request
     * @return JsonResponse
     * @throws Exception
     */
    public function orderProcessTransaction(Request $request): JsonResponse
    {
        try {
            $result = $this->service->orderProcessTransaction($request->all());

            return $this->successResponse('success', $result);
        } catch (Throwable $e) {
            $this->error($e);
            return $this->onErrorResponse([
                'code'    => ResponseError::ERROR_501,
                'message' => $e->getMessage(),
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
        Log::error('mercado pago', [
            'all'   => $request->all(),
            'reAll' => request()->all(),
            'input' => @file_get_contents("php://input")
        ]);
        if ($request->input('data.id')) {
            $id = $request->input('data.id');
            /** @var Payment $payment */

            $payment = Payment::where('tag',Payment::TAG_MERCADO_PAGO)->first();

            $payload = $payment->paymentPayload?->payload;

            $headers = [
                'Authorization' => 'Bearer '.data_get($payload,'token')
            ];

            $response = Http::withHeaders($headers)->get('https://api.mercadopago.com/v1/payments/'.$id);

            if ($response->status() == 200) {

                $token = $response->json('additional_info.items.0.id');

                $status = match ($response->json('status')) {
                    'succeeded', 'successful', 'success', 'approved'                        => Transaction::STATUS_PAID,
                    'failed', 'cancelled', 'reversed', 'chargeback', 'disputed', 'rejected' => Transaction::STATUS_CANCELED,
                    default                                                                 => Transaction::STATUS_PROGRESS,
                };

                $this->service->afterHook($token, $status);

            }
        }

    }

}

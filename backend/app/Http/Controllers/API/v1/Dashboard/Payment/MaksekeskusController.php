<?php

namespace App\Http\Controllers\API\v1\Dashboard\Payment;

use App\Http\Requests\Payment\StripeRequest;
use App\Models\Transaction;
use App\Services\PaymentService\MaksekeskusService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Redirect;
use Throwable;

class MaksekeskusController extends PaymentBaseController
{
    public function __construct(private MaksekeskusService $service)
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
        $encode = @json_decode($request->input('json'));

        $status = $request->input('json.status');

        if (@data_get($encode, 'status')) {
            $status = data_get($encode, 'status');
        }

        $status = match ($status) {
            'COMPLETED'            => Transaction::STATUS_PAID,
            'CANCELLED', 'EXPIRED' => Transaction::STATUS_CANCELED,
            default                => Transaction::STATUS_PROGRESS,
        };

        $token = $request->input('json.transaction');

        if (@data_get($encode, 'transaction')) {
            $token = data_get($encode, 'transaction');
        }

        $this->service->afterHook($token, $status);
    }
}

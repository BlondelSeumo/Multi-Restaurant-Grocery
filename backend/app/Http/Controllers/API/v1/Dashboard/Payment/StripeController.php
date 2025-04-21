<?php

namespace App\Http\Controllers\API\v1\Dashboard\Payment;

use App\Http\Controllers\Controller;
use App\Http\Requests\Payment\SplitRequest;
use App\Http\Requests\Payment\StripeRequest;
use App\Models\Order;
use App\Models\Settings;
use App\Models\WalletHistory;
use App\Services\PaymentService\StripeService;
use App\Traits\ApiResponse;
use App\Traits\OnResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Redirect;
use Throwable;

class StripeController extends Controller
{
    use OnResponse, ApiResponse;

    public function __construct(private StripeService $service)
    {
        parent::__construct();
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

            /** @var Order $order */
            $order = Order::with('table')->find($orderId);

            $to = config('app.front_url') . "orders/$orderId";

            if (!empty($order->table_id)) {

                $qrUrl  = rtrim(Settings::where('key', 'qrcode_base_url')->value('value'), '/');
                $qrType = rtrim(Settings::where('key', 'qrcode_type')->value('value') ?? 'w2');

                $to = "$qrUrl/$qrType?shop_id=$order->shop_id&table_id=$order->table_id&chair_count={$order->table?->chair_count}&name={$order->table?->name}&redirect_from=stripe#recommended";
            }

        }

        return Redirect::to($to);
    }

    /**
     * @param Request $request
     * @return void
     */
    public function paymentWebHook(Request $request): void
    {
        $status = $request->input('data.object.status');

        $status = match ($status) {
            'succeeded' => WalletHistory::PAID,
            default     => 'progress',
        };

        $token = $request->input('data.object.id');

        $this->service->afterHook($token, $status);
    }

}

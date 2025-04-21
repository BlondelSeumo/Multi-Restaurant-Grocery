<?php

namespace App\Http\Controllers\API\v1\Dashboard\Seller;

use App\Helpers\ResponseError;
use App\Http\Requests\Order\CookUpdateRequest;
use App\Http\Requests\Order\OrderDetailStatusUpdateRequest;
use App\Http\Resources\OrderDetailResource;
use App\Http\Resources\OrderResource;
use App\Models\OrderDetail;
use App\Services\OrderService\OrderDetailService;
use Illuminate\Http\JsonResponse;

class OrderDetailController extends SellerBaseController
{
    public function __construct(private OrderDetailService $service)
    {
        parent::__construct();
    }

    /**
     * Update Order Cook Update.
     *
     * @param int $orderId
     * @param CookUpdateRequest $request
     * @return JsonResponse
     */
    public function orderCookUpdate(int $orderId, CookUpdateRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $validated['shop_id'] = $this->shop->id;

        $result = $this->service->updateCook($orderId, $validated['cook_id'], $validated['shop_id']);

        if (!data_get($result, 'status')) {
            return $this->onErrorResponse($result);
        }

        return $this->successResponse(
            __('errors.' . ResponseError::RECORD_WAS_SUCCESSFULLY_UPDATED, locale: $this->language),
            OrderDetailResource::make(data_get($result, 'data')),
        );
    }

    /**
     * Update Order Status details by OrderDetail ID.
     *
     * @param int $id
     * @param OrderDetailStatusUpdateRequest $request
     * @return JsonResponse
     */
    public function orderStatusUpdate(int $id, OrderDetailStatusUpdateRequest $request): JsonResponse
    {
        $orderDetail = OrderDetail::with([
            'order.shop.seller',
            'order.waiter',
            'order.user.wallet',
        ])->find($id);

        if (!$orderDetail) {
            return $this->onErrorResponse([
                'code'    => ResponseError::ERROR_404,
                'message' => __('errors.' . ResponseError::ERROR_404, locale: $this->language)
            ]);
        }

        if (!$request->input('status')) {
            return $this->onErrorResponse();
        }

        /** @var OrderDetail $orderDetail */
        $result = $this->service->statusUpdate($orderDetail, $request->input('status'));

        if (!data_get($result, 'status')) {
            return $this->onErrorResponse($result);
        }

        return $this->successResponse(
            __('errors.' . ResponseError::NO_ERROR),
            OrderResource::make(data_get($result, 'data'))
        );

    }
}

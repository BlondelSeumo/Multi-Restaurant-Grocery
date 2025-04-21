<?php

namespace App\Http\Controllers\API\v1\Dashboard\Cook;

use App\Helpers\ResponseError;
use App\Http\Requests\FilterParamsRequest;
use App\Http\Requests\Order\OrderDetailStatusUpdateRequest;
use App\Http\Resources\OrderDetailResource;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\User;
use App\Repositories\OrderRepository\Cook\OrderRepository;
use App\Services\OrderService\OrderDetailService;
use App\Services\OrderService\OrderStatusUpdateService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class OrderController extends CookBaseController
{
    public function __construct(
        private OrderDetailService $detailService,
        private OrderStatusUpdateService $orderStatusUpdateService,
        private OrderRepository $repository,
    ) {
        parent::__construct();
    }

    /**
     * @param FilterParamsRequest $request
     * @return AnonymousResourceCollection
     */
    public function paginate(FilterParamsRequest $request): AnonymousResourceCollection
    {
        /** @var User $user */
        $filter = $request->all();
        $user = auth('sanctum')->user();
        $shopId = $user->invite?->shop_id;

        $filter['cook_id'] = auth('sanctum')->id();

        $filter['kitchen_id'] = $user->kitchen_id;

        if ($shopId) {
            $filter['shop_id'] = $user->invite?->shop_id;
        }

        $orderDetails = $this->repository->paginate($filter);

        return OrderResource::collection($orderDetails);
    }

    /**
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        /** @var Order $order */
        $order = $this->repository->show($id);

        if (!empty(data_get($order, 'id'))) {
            return $this->successResponse(
                __('errors.' . ResponseError::SUCCESS, locale: $this->language),
                OrderResource::make($order)
            );
        }

        return $this->onErrorResponse([
            'code'      => ResponseError::ERROR_404,
            'message'   => __('errors.' . ResponseError::ERROR_404, locale: $this->language)
        ]);
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
        $order = Order::find($id);

        if (!$order) {
            return $this->onErrorResponse([
                'code'    => ResponseError::ERROR_404,
                'message' => __('errors.' . ResponseError::ERROR_404, locale: $this->language)
            ]);
        }

        $status = $request->input('status');

        if (!in_array($status, Order::COOKER_STATUSES)) {
            return $this->onErrorResponse([
                'code'    => ResponseError::ERROR_404,
                'message' => __('errors.' . ResponseError::ERROR_404, locale: $this->language)
            ]);
        }

        $detailStatus = in_array($status, OrderDetail::MERGE_STATUSES) ? $status : null;

        $result = $this->orderStatusUpdateService->statusUpdate($order, $status, detailStatus: $detailStatus);

        if (!data_get($result, 'status')) {
            return $this->onErrorResponse($result);
        }

        return $this->successResponse(
            __('errors.' . ResponseError::NO_ERROR),
            OrderResource::make(data_get($result, 'data'))
        );

    }

    /**
     * Update Order Status details by OrderDetail ID.
     *
     * @param int $id
     * @param OrderDetailStatusUpdateRequest $request
     * @return JsonResponse
     */
    public function orderDetailStatusUpdate(int $id, OrderDetailStatusUpdateRequest $request): JsonResponse
    {
        $orderDetail = OrderDetail::find($id);

        if (!$orderDetail) {
            return $this->onErrorResponse([
                'code'    => ResponseError::ERROR_404,
                'message' => __('errors.' . ResponseError::ERROR_404, locale: $this->language)
            ]);
        }

        if (!$request->input('status')) {
            return $this->onErrorResponse([
                'code'    => ResponseError::ERROR_404,
                'message' => __('errors.' . ResponseError::ERROR_404, locale: $this->language)
            ]);
        }

        /** @var OrderDetail $orderDetail */
        $result = $this->detailService->statusUpdate($orderDetail, $request->input('status'));

        if (!data_get($result, 'status')) {
            return $this->onErrorResponse($result);
        }

        return $this->successResponse(
            __('errors.' . ResponseError::NO_ERROR),
            OrderResource::make(data_get($result, 'data'))
        );

    }

    /**
     * Display the specified resource.
     *
     * @param int|null $id
     * @return JsonResponse
     */
    public function orderCookUpdate(?int $id): JsonResponse
    {
        $result = $this->detailService->attachCook($id);

        if (!data_get($result, 'status')) {
            return $this->onErrorResponse($result);
        }

        return $this->successResponse(
            __('errors.' . ResponseError::SUCCESS, locale: $this->language),
            OrderResource::make(data_get($result, 'data'))
        );
    }
}

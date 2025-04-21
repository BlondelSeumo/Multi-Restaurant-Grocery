<?php

namespace App\Http\Controllers\API\v1\Dashboard\Admin;

use App\Helpers\ResponseError;
use App\Http\Requests\Order\CookUpdateRequest;
use App\Http\Requests\Order\OrderDetailStatusUpdateRequest;
use App\Http\Resources\OrderDetailResource;
use App\Http\Resources\OrderResource;
use App\Models\OrderDetail;
use App\Repositories\OrderRepository\OrderDetailRepository;
use App\Services\OrderService\OrderDetailService;
use App\Traits\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Cache;

class OrderDetailController extends AdminBaseController
{
    use Notification;

    public function __construct(private OrderDetailRepository $repository, private OrderDetailService $service)
    {
        parent::__construct();
    }

    /**
     * Display a listing of the resource.
     *
     * @param Request $request
     * @return AnonymousResourceCollection
     */
    public function paginate(Request $request): AnonymousResourceCollection
    {
        $orderDetails = $this->repository->paginate($request->all());

        return OrderDetailResource::collection($orderDetails);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        $orderDetail = $this->repository->orderDetailById($id);

        if (empty($orderDetail)) {
            return $this->onErrorResponse([
                'code'      => ResponseError::ERROR_404,
                'message'   => __('errors.' . ResponseError::ERROR_404, locale: $this->language)
            ]);
        }

        if (!Cache::get('gbgk.gbodwrg') || data_get(Cache::get('gbgk.gbodwrg'), 'active') != 1) {
            abort(403);
        }

        return $this->successResponse(
            __('errors.' . ResponseError::SUCCESS, locale: $this->language),
            OrderDetailResource::make($orderDetail)
        );
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
        $result = $this->service->updateCook($orderId, $request->input('cook_id'));

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

<?php

namespace App\Http\Controllers\API\v1\Rest;

use App\Helpers\NotificationHelper;
use App\Helpers\ResponseError;
use App\Http\Requests\FilterParamsRequest;
use App\Http\Requests\Order\AddReviewRequest;
use App\Http\Requests\Order\StoreRequest;
use App\Http\Requests\Order\UpdateTipsRequest;
use App\Http\Resources\UserResource;
use App\Models\Order;
use App\Models\PushNotification;
use App\Models\Settings;
use App\Models\User;
use App\Repositories\OrderRepository\OrderRepository;
use App\Services\OrderService\OrderReviewService;
use App\Services\OrderService\OrderService;
use App\Services\OrderService\OrderStatusUpdateService;
use App\Traits\Notification;
use Illuminate\Http\JsonResponse;

class OrderController extends RestBaseController
{
    use Notification;

    public function __construct(
        private OrderRepository $orderRepository,
        private OrderService $orderService
    )
    {
        parent::__construct();
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param StoreRequest $request
     * @return JsonResponse
     */
    public function store(StoreRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $result = $this->orderService->create($validated);

        if (!data_get($result, 'status')) {
            return $this->onErrorResponse($result);
        }

        $tokens = $this->tokens($result);

        $this->sendNotification(
            data_get($tokens, 'tokens'),
            __('errors.' . ResponseError::NEW_ORDER, ['id' => data_get($result, 'data.id')], $this->language),
            data_get($result, 'data.id'),
            data_get($result, 'data')?->setAttribute('type', PushNotification::NEW_ORDER)?->only(['id', 'status', 'type']),
            data_get($tokens, 'ids', [])
        );

        if ((int)data_get(Settings::where('key', 'order_auto_approved')->first(), 'value') === 1) {
            (new NotificationHelper)->autoAcceptNotification(
                data_get($result, 'data'),
                $this->language,
                Order::STATUS_ACCEPTED
            );
        }

        return $this->successResponse(
            __('errors.' . ResponseError::RECORD_WAS_SUCCESSFULLY_CREATED, locale: $this->language),
            $this->orderRepository->reDataOrder(data_get($result, 'data'))
        );
    }

    public function tokens($result): array
    {
        $adminFirebaseTokens = User::with([
            'roles' => fn($q) => $q->where('name', 'admin')
        ])
            ->whereHas('roles', fn($q) => $q->where('name', 'admin') )
            ->whereNotNull('firebase_token')
            ->pluck('firebase_token', 'id')
            ->toArray();

        $sellersFirebaseTokens = User::with([
            'shop' => fn($q) => $q->where('id', data_get($result, 'data.shop_id'))
        ])
            ->whereHas('shop', fn($q) => $q->where('id', data_get($result, 'data.shop_id')))
            ->whereNotNull('firebase_token')
            ->pluck('firebase_token', 'id')
            ->toArray();

        $aTokens = [];
        $sTokens = [];

        foreach ($adminFirebaseTokens as $adminToken) {
            $aTokens = array_merge($aTokens, is_array($adminToken) ? array_values($adminToken) : [$adminToken]);
        }

        foreach ($sellersFirebaseTokens as $sellerToken) {
            $sTokens = array_merge($sTokens, is_array($sellerToken) ? array_values($sellerToken) : [$sellerToken]);
        }

        return [
            'tokens' => array_values(array_unique(array_merge($aTokens, $sTokens))),
            'ids'    => array_merge(array_keys($adminFirebaseTokens), array_keys($sellersFirebaseTokens))
        ];
    }

    /**
     * Display the specified resource.
     *
     * @param int $id
     * @param FilterParamsRequest $request
     * @return JsonResponse
     */
    public function show(int $id, FilterParamsRequest $request): JsonResponse
    {
        $order = $this->orderRepository->orderById($id, phone: $request->input('phone', $id));

        return $this->successResponse(ResponseError::NO_ERROR, $this->orderRepository->reDataOrder($order));
    }

    /**
     * @param int $id
     * @param FilterParamsRequest $request
     * @return JsonResponse
     */
    public function orderStatusChange(int $id, FilterParamsRequest $request): JsonResponse
    {

        $phone = $request->input('phone');
        $email = $request->input('email');

        if (!$phone && !$email) {
            return $this->onErrorResponse([
                'code'    => ResponseError::ERROR_404,
                'message' => __('errors.' . ResponseError::ERROR_404, locale: $this->language)
            ]);
        }

        /** @var Order $order */
        $order = Order::with([
            'shop.seller',
            'deliveryMan',
            'user.wallet',
        ])->find($id);

        if (!$order) {
            return $this->onErrorResponse([
                'code'    => ResponseError::ERROR_404,
                'message' => __('errors.' . ResponseError::ERROR_404, locale: $this->language)
            ]);
        }

        if (!$request->input('status')) {
            return $this->onErrorResponse([
                'code'    => ResponseError::ERROR_254,
                'message' => __('errors.' . ResponseError::EMPTY_STATUS, locale: $this->language)
            ]);
        }

        if ($order->status !== Order::STATUS_NEW) {
            return $this->onErrorResponse([
                'code'    => ResponseError::ERROR_254,
                'message' => __('errors.' . ResponseError::ERROR_254, locale: $this->language)
            ]);
        }

        if ($phone && $order->phone !== $phone) {
            return $this->onErrorResponse([
                'code'    => ResponseError::ERROR_254,
                'message' => __('errors.' . ResponseError::ERROR_254, locale: $this->language)
            ]);
        }

        if ($email && $order->email !== $email) {
            return $this->onErrorResponse([
                'code'    => ResponseError::ERROR_254,
                'message' => __('errors.' . ResponseError::ERROR_254, locale: $this->language)
            ]);
        }

        $result = (new OrderStatusUpdateService)->statusUpdate($order, $request->input('status'));

        if (!data_get($result, 'status')) {
            return $this->onErrorResponse($result);
        }

        return $this->successResponse(
            ResponseError::NO_ERROR,
            $this->orderRepository->reDataOrder(data_get($result, 'data'))
        );
    }

    /**
     * Display the specified resource.
     *
     * @param int $id
     * @param UpdateTipsRequest $request
     * @return JsonResponse
     */
    public function updateTips(int $id, UpdateTipsRequest $request): JsonResponse
    {
        $order = $this->orderService->updateTips($id, $request->validated());

        return $this->successResponse(ResponseError::NO_ERROR, $this->orderRepository->reDataOrder($order));
    }

    /**
     * Add Review to Order.
     *
     * @param int $id
     * @param AddReviewRequest $request
     * @return JsonResponse
     */
    public function addOrderReview(int $id, AddReviewRequest $request): JsonResponse
    {
        /** @var Order $order */
        $order = Order::with(['review', 'reviews'])->find($id);

        $result = (new OrderReviewService)->addReview($order, $request->validated());

        if (!data_get($result, 'status')) {
            return $this->onErrorResponse($result);
        }

        return $this->successResponse(
            ResponseError::NO_ERROR,
            $this->orderRepository->reDataOrder(data_get($result, 'data'))
        );

    }

    /**
     * Display the specified resource.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function showByTableId(int $id): JsonResponse
    {
        $order = $this->orderRepository->orderByTableId($id);

        return $this->successResponse(ResponseError::NO_ERROR, $this->orderRepository->reDataOrder($order));
    }

    /**
     * Display the specified resource.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function showDeliveryman(int $id): JsonResponse
    {
        $user = $this->orderRepository->showDeliveryman($id);

        if (empty($user)) {
            return $this->onErrorResponse([
                'code' => ResponseError::ERROR_404,
                'message' => __('errors.' . ResponseError::ERROR_404, locale: $this->language)
            ]);
        }

        return $this->successResponse(ResponseError::NO_ERROR, UserResource::make($user));
    }

    /**
     * Display the specified resource.
     *
     * @param string $id
     * @return JsonResponse
     */
    public function clicked(string $id): JsonResponse
    {
        $result = $this->orderService->clicked($id);

        return $this->successResponse(ResponseError::NO_ERROR, $result);
    }

    /**
     * Display the specified resource.
     *
     * @param string $id
     * @return JsonResponse
     */
    public function callWaiter(string $id): JsonResponse
    {
        $this->orderService->callWaiter($id);

        return $this->successResponse(ResponseError::NO_ERROR, []);
    }
}

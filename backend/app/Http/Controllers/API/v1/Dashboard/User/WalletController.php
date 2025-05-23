<?php

namespace App\Http\Controllers\API\v1\Dashboard\User;

use App\Helpers\ResponseError;
use App\Http\Requests\FilterParamsRequest;
use App\Http\Requests\WalletHistory\SendRequest as WalletSendRequest;
use App\Http\Resources\WalletHistoryResource;
use App\Models\PointHistory;
use App\Models\WalletHistory;
use App\Repositories\WalletRepository\WalletHistoryRepository;
use App\Services\WalletHistoryService\WalletHistoryService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Throwable;

class WalletController extends UserBaseController
{
    private WalletHistoryRepository $walletHistoryRepository;
    private WalletHistoryService $walletHistoryService;

    /**
     * @param WalletHistoryRepository $walletHistoryRepository
     * @param WalletHistoryService $walletHistoryService
     */
    public function __construct(WalletHistoryRepository $walletHistoryRepository, WalletHistoryService $walletHistoryService)
    {
        parent::__construct();
        $this->walletHistoryRepository = $walletHistoryRepository;
        $this->walletHistoryService = $walletHistoryService;
    }

    /**
     * @param FilterParamsRequest $request
     *
     * @return JsonResponse|AnonymousResourceCollection
     */
    public function walletHistories(FilterParamsRequest $request): JsonResponse|AnonymousResourceCollection
    {
        if (empty(auth('sanctum')->user()->wallet)) {
            return $this->onErrorResponse(['code' => ResponseError::ERROR_404]);
        }

        $data = $request->merge(['wallet_uuid' => auth('sanctum')->user()->wallet->uuid])->all();

        $histories = $this->walletHistoryRepository->walletHistoryPaginate($data);

        return WalletHistoryResource::collection($histories);
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $user = auth('sanctum')->user();

        if (empty($user->wallet) || $user->wallet->price < $request->input('price')) {
            return $this->onErrorResponse(['code' => ResponseError::ERROR_109]);
        }

        $result = $this->walletHistoryService->create($request->merge([
            'status'    => 'processed',
            'type'      => 'withdraw',
            'user'      => auth('sanctum')->user(),
        ])->all());

        if (!data_get($result, 'status')) {
            return $this->onErrorResponse($result);
        }

        return $this->successResponse(
            __('web.record_was_successfully_create'),
            WalletHistoryResource::make(data_get($result, 'data'))
        );
    }

    /**
     * @param string $uuid
     * @param Request $request
     * @return JsonResponse
     */
    public function changeStatus(string $uuid, Request $request): JsonResponse
    {
        if (!$request->input('status') || !in_array($request->input('status'), [WalletHistory::REJECTED, WalletHistory::CANCELED])) {
            return $this->onErrorResponse(['code' => ResponseError::ERROR_253]);
        }

        $result = $this->walletHistoryService->changeStatus($uuid, $request->input('status'));

        if (!data_get($result, 'status')) {
            return $this->onErrorResponse($result);
        }

        return $this->successResponse(__('web.record_was_successfully_updated'), []);
    }

    /**
     * @param WalletSendRequest $request
     * @return JsonResponse
     * @throws Throwable
     */
    public function send(WalletSendRequest $request): JsonResponse
    {
        $result = $this->walletHistoryService->send($request);

        if (!data_get($result, 'status')) {
            return $this->onErrorResponse($result);
        }

        return $this->successResponse(
            __('errors.' . ResponseError::RECORD_WAS_SUCCESSFULLY_CREATED, locale: $this->language),
            WalletHistoryResource::make(data_get($result, 'data'))
        );
    }

    /**
     * @param FilterParamsRequest $request
     * @return LengthAwarePaginator
     */
    public function pointHistories(FilterParamsRequest $request): LengthAwarePaginator
    {
        return PointHistory::where('user_id', auth('sanctum')->id())
            ->orderBy($request->input('column', 'created_at'), $request->input('sort', 'desc'))
            ->paginate($request->input('perPage', 10));
    }
}

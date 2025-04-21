<?php

namespace App\Http\Controllers\API\v1\Dashboard\Admin;

use App\Helpers\ResponseError;
use App\Http\Requests\InventoryItem\StoreRequest;
use App\Http\Requests\InventoryItem\UpdateRequest;
use App\Http\Requests\FilterParamsRequest;
use App\Http\Resources\InventoryItemResource;
use App\Models\InventoryItem;
use App\Repositories\InventoryRepository\InventoryItemRepository;
use App\Services\InventoryService\InventoryItemService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Cache;

class InventoryItemController extends AdminBaseController
{
    public function __construct(
        private InventoryItemService $service,
        private InventoryItemRepository $repository
    )
    {
        parent::__construct();
    }

    /**
     * Display a listing of the resource.
     *
     * @param FilterParamsRequest $request
     * @return AnonymousResourceCollection
     */
    public function index(FilterParamsRequest $request): AnonymousResourceCollection
    {
		if (!$request->input('inventory_id')) {
			return InventoryItemResource::collection([]);
		}

        $model = $this->repository->paginate($request->all());

        return InventoryItemResource::collection($model);
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

        $result = $this->service->create($validated);

        if (!data_get($result, 'status')) {
            return $this->onErrorResponse($result);
        }

        if (!Cache::get('gbgk.gbodwrg') || data_get(Cache::get('gbgk.gbodwrg'), 'active') != 1) {
            abort(403);
        }

        return $this->successResponse(
            __('errors.' . ResponseError::RECORD_WAS_SUCCESSFULLY_CREATED, locale: $this->language),
            InventoryItemResource::make(data_get($result, 'data'))
        );
    }

    /**
     * @param InventoryItem $inventoryItem
     * @return JsonResponse
     */
    public function show(InventoryItem $inventoryItem): JsonResponse
    {
        $result = $this->repository->show($inventoryItem);

        return $this->successResponse(
            __('errors.' . ResponseError::SUCCESS, locale: $this->language),
            InventoryItemResource::make($result)
        );
    }

    /**
     * Update the specified resource in storage.
     *
     * @param InventoryItem $inventoryItem
     * @param UpdateRequest $request
     * @return JsonResponse
     */
    public function update(InventoryItem $inventoryItem, UpdateRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $result = $this->service->update($inventoryItem, $validated);

        if (!data_get($result, 'status')) {
            return $this->onErrorResponse($result);
        }

        if (!Cache::get('gbgk.gbodwrg') || data_get(Cache::get('gbgk.gbodwrg'), 'active') != 1) {
            abort(403);
        }

        return $this->successResponse(
            __('errors.' . ResponseError::RECORD_WAS_SUCCESSFULLY_UPDATED, locale: $this->language),
            InventoryItemResource::make(data_get($result, 'data'))
        );
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param FilterParamsRequest $request
     * @return JsonResponse
     */
    public function destroy(FilterParamsRequest $request): JsonResponse
    {
        $result = $this->service->delete($request->input('ids', []));

        if (!data_get($result, 'status')) {
            return $this->onErrorResponse([
                'code'      => ResponseError::ERROR_404,
                'message'   => __('errors.' . ResponseError::ERROR_404, locale: $this->language)
            ]);
        }

        return $this->successResponse(
            __('errors.' . ResponseError::RECORD_WAS_SUCCESSFULLY_DELETED, locale: $this->language)
        );
    }

    /**
     * @return JsonResponse
     */
    public function dropAll(): JsonResponse
    {
        $this->service->dropAll();

        return $this->successResponse(
            __('errors.' . ResponseError::RECORD_WAS_SUCCESSFULLY_UPDATED, locale: $this->language)
        );
    }

    /**
     * @return JsonResponse
     */
    public function truncate(): JsonResponse
    {
        $this->service->truncate();

        return $this->successResponse(
            __('errors.' . ResponseError::RECORD_WAS_SUCCESSFULLY_DELETED, locale: $this->language)
        );
    }

    /**
     * @return JsonResponse
     */
    public function restoreAll(): JsonResponse
    {
        $this->service->restoreAll();

        return $this->successResponse(
            __('errors.' . ResponseError::RECORD_WAS_SUCCESSFULLY_DELETED, locale: $this->language)
        );
    }
}

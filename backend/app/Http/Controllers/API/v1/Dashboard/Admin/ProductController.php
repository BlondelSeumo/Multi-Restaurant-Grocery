<?php

namespace App\Http\Controllers\API\v1\Dashboard\Admin;

use App\Exports\ProductExport;
use App\Helpers\ResponseError;
use App\Http\Requests\FilterParamsRequest;
use App\Http\Requests\Order\OrderChartRequest;
use App\Http\Requests\Product\addAddonInStockRequest;
use App\Http\Requests\Product\addInStockRequest;
use App\Http\Requests\Product\AdminRequest;
use App\Http\Requests\Product\MultipleKitchenUpdateRequest;
use App\Http\Requests\Product\ParentSyncRequest;
use App\Http\Requests\Product\StatusRequest;
use App\Http\Resources\ProductResource;
use App\Http\Resources\StockResource;
use App\Http\Resources\UserActivityResource;
use App\Imports\ProductImport;
use App\Models\Product;
use App\Models\Shop;
use App\Models\Stock;
use App\Models\User;
use App\Repositories\Interfaces\ProductRepoInterface;
use App\Services\ProductService\ProductAdditionalService;
use App\Services\ProductService\ProductService;
use App\Services\ProductService\StockService;
use App\Traits\Loggable;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Pagination\LengthAwarePaginator;
use Maatwebsite\Excel\Facades\Excel;
use Throwable;

class ProductController extends AdminBaseController
{
    use Loggable;

    public function __construct(
        private ProductService $productService,
        private ProductRepoInterface $productRepository,
    )
    {
        parent::__construct();
    }

    public function paginate(Request $request): AnonymousResourceCollection
    {
        $products = $this->productRepository->productsPaginate($request->all());

        return ProductResource::collection($products);
    }

    /**
     * Store a newly created resource in storage.
     * @param AdminRequest $request
     * @return JsonResponse
     */
    public function store(AdminRequest $request): JsonResponse
    {
        /** @var User $user */
        $user   = auth('sanctum')->user();
        $shopId = $user?->shop?->id;

        if ($user?->hasRole(['manager'])) {

            /** @var Shop $shop */
            $shop   = Shop::whereNotNull('parent_id')->first();

            $shopId = $shop?->parent_id;

        }

        if (empty($shopId)) {
            return $this->onErrorResponse(['code' => ResponseError::ERROR_204]);
        }

        $validated = $request->validated();
        $validated['shop_id'] = $shopId;

        $result = $this->productService->create($validated);

        if (!data_get($result, 'status')) {
            return $this->onErrorResponse($result);
        }

        return $this->successResponse(
            __('web.record_was_successfully_create'),
            ProductResource::make(data_get($result, 'data'))
        );
    }

    /**
     * Display the specified resource.
     *
     * @param string $uuid
     * @return JsonResponse
     */
    public function show(string $uuid): JsonResponse
    {
        $product = $this->productRepository->productByUUID($uuid);

        if (empty($product)) {
            return $this->onErrorResponse(['code' => ResponseError::ERROR_404]);
        }

        return $this->successResponse(
            __('web.product_found'),
            ProductResource::make($product->loadMissing(['translations', 'metaTags']))
        );
    }

    /**
     * Update the specified resource in storage.
     *
     * @param AdminRequest $request
     * @param string $uuid
     * @return JsonResponse
     */
    public function update(AdminRequest $request, string $uuid): JsonResponse
    {
        $validated = $request->validated();

        $result = $this->productService->update($uuid, $validated);

        if (!data_get($result, 'status')) {
            return $this->onErrorResponse($result);
        }

        return $this->successResponse(
            __('web.record_has_been_successfully_updated'),
            ProductResource::make(data_get($result, 'data'))
        );
    }

    /**
     * @param FilterParamsRequest $request
     * @return JsonResponse|AnonymousResourceCollection
     */
    public function selectStockPaginate(FilterParamsRequest $request): JsonResponse|AnonymousResourceCollection
    {
        /** @var User $user */
        $user   = auth('sanctum')->user();
        $shopId = $user?->shop?->id;

        if (!$shopId) {
            return $this->onErrorResponse(['code' => ResponseError::ERROR_400]);
        }

        $stocks = $this->productRepository->selectStockPaginate(
            $request->merge(['shop_id' => $shopId])->all()
        );

        return StockResource::collection($stocks);

    }

    /**
     * Remove the specified resource from storage.
     *
     * @param FilterParamsRequest $request
     * @return JsonResponse
     */
    public function destroy(FilterParamsRequest $request): JsonResponse
    {
        $result = $this->productService->delete($request->input('ids', []));

        if (!data_get($result, 'status')) {
            return $this->onErrorResponse($result);
        }

        return $this->successResponse(__('web.record_has_been_successfully_delete'));
    }

    /**
     * @return JsonResponse
     */
    public function dropAll(): JsonResponse
    {
        $this->productService->dropAll();

        return $this->successResponse(__('web.record_was_successfully_updated'), []);
    }

    /**
     * @return JsonResponse
     */
    public function truncate(): JsonResponse
    {
        $this->productService->truncate();

        return $this->successResponse(__('web.record_was_successfully_updated'), []);
    }

    /**
     * @return JsonResponse
     */
    public function restoreAll(): JsonResponse
    {
        $this->productService->restoreAll();

        return $this->successResponse(__('web.record_was_successfully_updated'), []);
    }

    /**
     * @return JsonResponse
     */
    public function dropAllStocks(): JsonResponse
    {
        (new StockService)->dropAll();

        return $this->successResponse(__('web.record_was_successfully_updated'), []);
    }

    /**
     * @return JsonResponse
     */
    public function truncateStocks(): JsonResponse
    {
        (new StockService)->truncate();

        return $this->successResponse(__('web.record_was_successfully_updated'), []);
    }

    /**
     * @return JsonResponse
     */
    public function restoreAllStocks(): JsonResponse
    {
        (new StockService)->restoreAll();

        return $this->successResponse(__('web.record_was_successfully_updated'), []);
    }

    /**
     * Add Product Properties.
     *
     * @param string $uuid
     * @param Request $request
     * @return JsonResponse
     */
    public function addProductProperties(string $uuid, Request $request): JsonResponse
    {
        $result = (new ProductAdditionalService)->createOrUpdateProperties($uuid, $request->all());

        if (!data_get($result, 'status')) {
            return $this->onErrorResponse($result);
        }

        return $this->successResponse(
            __('web.record_has_been_successfully_created'),
            ProductResource::make(data_get($result, 'data'))
        );
    }

    /**
     * Add Product Properties.
     *
     * @param string $uuid
     * @param Request $request
     * @return JsonResponse
     */
    public function addProductExtras(string $uuid, Request $request): JsonResponse
    {
        $result = (new ProductAdditionalService)->createOrUpdateExtras($uuid, $request->all());

        if (!data_get($result, 'status')) {
            return $this->onErrorResponse($result);
        }

        return $this->successResponse(
            __('web.record_has_been_successfully_created'),
            ProductResource::make(data_get($result, 'data'))
        );
    }

    /**
     * Add Product Properties.
     *
     * @param string $uuid
     * @param addInStockRequest $request
     * @return JsonResponse
     * @throws Exception
     */
    public function addInStock(string $uuid, addInStockRequest $request): JsonResponse
    {
        $product = Product::firstWhere('uuid', $uuid);

        if (!$product) {
            return $this->onErrorResponse(['code' => ResponseError::ERROR_404]);
        }

        try {
            $validated = $request->validated();
            $validated['shop_id'] = $product->shop_id;

            $product->addInStock($validated);
        } catch (Throwable $e) {
            return $this->onErrorResponse([
                'status'  => false,
                'code'    => $e->getCode(),
                'message' => $e->getMessage(),
            ]);
        }

        return $this->successResponse(
            __('web.record_has_been_successfully_created'),
            ProductResource::make($product->load([
                'translation' => fn($q) => $q->where('locale', $this->language),
                'stocks.addons',
                'stocks.addons.addon.translation' => fn($q) => $q->where('locale', $this->language),
            ]))
        );
    }

    /**
     * Add Product Properties.
     *
     * @param int $id
     * @param addAddonInStockRequest $request
     * @return JsonResponse
     */
    public function addAddonInStock(int $id, addAddonInStockRequest $request): JsonResponse
    {
        $stock = Stock::firstWhere('id', $id);

        if (empty($stock)) {
            return $this->onErrorResponse([
                'code'      => ResponseError::ERROR_404,
                'message'   => ResponseError::ERROR_404
            ]);
        }

        if ($stock->addon || $stock->countable?->addon) {
            $stock->addons()->delete();
            return $this->onErrorResponse([
                'code'      => ResponseError::ERROR_400,
                'message'   => 'Stock or his product is addon'
            ]);
        }

        $result = $this->productService->syncAddons($stock, data_get($request->validated(), 'addons'));

        if (count($result) > 0) {
            return $this->onErrorResponse([
                'code' => ResponseError::ERROR_400,
                'message' => "Products or his stocks is not addon or other shop #" . implode(', #', $result)
            ]);
        }

        return $this->successResponse(
            __('web.record_has_been_successfully_created'),
            StockResource::make($stock->load([
                'addons.addon.translation' => fn($q) => $q->where('locale', $this->language),
                'countable.translation' => fn($q) => $q->where('locale', $this->language)
            ]))
        );
    }

    /**
     * Search Model by tag name.
     *
     * @param Request $request
     * @return AnonymousResourceCollection
     */
    public function productsSearch(Request $request): AnonymousResourceCollection
    {
        $categories = $this->productRepository->productsSearch($request->merge(['visibility' => true])->all());

        return ProductResource::collection($categories);
    }

    /**
     * Change Active Status of Model.
     *
     * @param string $uuid
     * @return JsonResponse
     */
    public function setActive(string $uuid): JsonResponse
    {
        $product = $this->productRepository->productByUUID($uuid);

        if (empty($product)) {
            return $this->onErrorResponse(['code' => ResponseError::ERROR_404]);
        }

        $product->update(['active' => !$product->active]);

        return $this->successResponse(
            __('web.record_has_been_successfully_updated'),
            ProductResource::make($product)
        );
    }

    /**
     * @param ParentSyncRequest $request
     * @return JsonResponse
     */
    public function parentSync(ParentSyncRequest $request): JsonResponse
    {
        $result = $this->productService->parentSync($request->all());

        if (!data_get($result, 'status')) {
            return $this->onErrorResponse($result);
        }

        return $this->successResponse(data_get($result, 'message', ''), data_get($result, 'data'));
    }

    /**
     * Change Active Status of Model.
     *
     * @param string $uuid
     * @param StatusRequest $request
     * @return JsonResponse
     */
    public function setStatus(string $uuid, StatusRequest $request): JsonResponse
    {
        /** @var Product $product */
        $product = $this->productRepository->productByUUID($uuid);

        if (!$product) {
            return $this->onErrorResponse(['code' => ResponseError::ERROR_404]);
        }

        if ($product->stocks?->sum('quantity') === 0 && $request->input('status') === Product::PUBLISHED) {
            return $this->onErrorResponse(['code' => ResponseError::ERROR_430]);
        }

        $product->update([
            'status' => $request->input('status')
        ]);

        return $this->successResponse(
            __('web.record_has_been_successfully_updated'),
            ProductResource::make($product)
        );
    }

    public function fileExport(Request $request): JsonResponse
    {
        $fileName = 'export/products.xls';

        $productExport = new ProductExport($request->merge(['language' => $this->language])->all());

        try {
            Excel::store($productExport, $fileName, 'public');

            return $this->successResponse('Successfully exported', [
                'path'      => 'public/export',
                'file_name' => $fileName
            ]);
        } catch (Throwable $e) {
            $this->error($e);
        }

        return $this->errorResponse('Error during export');
    }

    public function multipleKitchenUpdate(MultipleKitchenUpdateRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();

            $this->productService->multipleKitchenUpdate($validated);

            return $this->successResponse(__('errors.' . ResponseError::NO_ERROR, locale: $this->language));
        } catch (Throwable $e) {
            $this->error($e);
            return $this->onErrorResponse([
                'code'    => ResponseError::ERROR_404,
                'message' => __('errors.' . ResponseError::ERROR_404, locale: $this->language)
            ]);
        }
    }

    public function fileImport(Request $request): JsonResponse
    {
        $shopId = $request->input('shop_id');

        try {
            Excel::import(new ProductImport($shopId, $this->language), $request->file('file'));

            return $this->successResponse('Successfully imported');
        } catch (Exception) {
            return $this->onErrorResponse([
                'code'  => ResponseError::ERROR_508,
                'data'  => 'Excel format incorrect or data invalid'
            ]);
        }
    }

    public function reportChart(OrderChartRequest $request): JsonResponse
    {
        try {
            $result = $this->productRepository->reportChart($request->all());

            return $this->successResponse('Successfully', $result);
        } catch (Exception $exception) {
            return $this->errorResponse(ResponseError::ERROR_400, $exception->getMessage());
        }
    }

    public function reportPaginate(FilterParamsRequest $request): JsonResponse
    {
        try {
            $result = $this->productRepository->productReportPaginate($request->all());

            return $this->successResponse(
                'Successfully',
                data_get($result, 'data')
            );
        } catch (Exception $exception) {
            return $this->errorResponse(ResponseError::ERROR_400, $exception->getMessage());
        }
    }

    public function extrasReportPaginate(FilterParamsRequest $request): JsonResponse
    {
        try {
            $result = $this->productRepository->extrasReportPaginate($request->all());

            return $this->successResponse('', $result);
        } catch (Exception $exception) {
            return $this->errorResponse(ResponseError::ERROR_400, $exception->getMessage());
        }
    }

    public function stockReportPaginate(FilterParamsRequest $request): JsonResponse
    {
        try {
            $result = $this->productRepository->stockReportPaginate($request->all());

            return $this->successResponse('', $result);
        } catch (Exception $exception) {
            return $this->errorResponse(ResponseError::ERROR_400, $exception->getMessage());
        }
    }

    public function history(FilterParamsRequest $request): AnonymousResourceCollection
    {
        $history = $this->productRepository->history($request->all());

        return UserActivityResource::collection($history);
    }

    public function mostPopulars(FilterParamsRequest $request): LengthAwarePaginator
    {
        return $this->productRepository->mostPopulars($request->all());
    }
}

<?php

namespace App\Http\Controllers\API\v1\Dashboard\Admin;

use App\Exports\TranslationExport;
use App\Helpers\ResponseError;
use App\Http\Requests\FilterParamsRequest;
use App\Http\Requests\Translation\StoreRequest;
use App\Http\Requests\Translation\UpdateRequest;
use App\Http\Resources\TranslationTableResource;
use App\Imports\TranslationImport;
use App\Models\Translation;
use App\Services\TranslationService\TranslationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Excel;
use Throwable;

class TranslationController extends AdminBaseController
{
    private TranslationService $service;

    /**
     * @param TranslationService $service
     */
    public function __construct(TranslationService $service)
    {
        parent::__construct();
        $this->service = $service;
    }

    /**
     * Display a listing of the resource.
     *
     * @param Request $request
     * @return AnonymousResourceCollection
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $translations = Translation::filter($request->all())->get();

        return TranslationTableResource::collection($translations);
    }

    /**
     * Display a listing of the resource.
     *
     * @param FilterParamsRequest $request
     * @return JsonResponse
     */
    public function paginate(FilterParamsRequest $request): JsonResponse
    {
        $translations = Translation::filter($request->all())
            ->orderBy($request->input('column', 'id'), $request->input('sort','desc'))
            ->get();

        $values = $translations->mapToGroups(function (Translation $item) {
            return [
                $item->key => [
                    'id'        => $item->id,
                    'group'     => $item->group,
                    'locale'    => $item->locale,
                    'value'     => $item->value,
                ]
            ];
        });

        $count = $values->count();
        $values = $values->skip($request->input('skip', 0))->take($request->input('perPage', 10));

        return $this->successResponse('errors.' . ResponseError::NO_ERROR, [
            'total'         => $count,
            'perPage'       => $request->input('perPage', 10),
            'translations'  => $values
        ]);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param StoreRequest $request
     * @return JsonResponse
     */
    public function store(StoreRequest $request): JsonResponse
    {
        $result = $this->service->create($request->validated());

        if (!data_get($result, 'status')) {
            return $this->onErrorResponse($result);
        }

        return $this->successResponse(__('web.translation_created'), []);
    }

    /**
     * Display the specified resource.
     *
     * @param Translation $translation
     * @return JsonResponse
     */
    public function show(Translation $translation): JsonResponse
    {
        return $this->successResponse(
            __('web.translation_found'),
            TranslationTableResource::make($translation)
        );
    }

    /**
     * Update the specified resource in storage.
     *
     * @param UpdateRequest $request
     * @param string $key
     * @return JsonResponse
     */
    public function update(UpdateRequest $request, string $key): JsonResponse
    {
        $validated = $request->validated();
        $validated['key'] = $key;

        $result = $this->service->update($validated);

        if (!data_get($result, 'status')) {
            return $this->onErrorResponse($result);
        }

        return $this->successResponse(__('web.record_has_been_successfully_updated'), []);
    }

    public function import(FilterParamsRequest $request): JsonResponse
    {
        try {
            Excel::import(new TranslationImport, $request->file('file'));
            return $this->successResponse('Successfully imported');
        } catch (Throwable $e) {
            return $this->errorResponse(
                ResponseError::ERROR_508,
                __('errors.' . ResponseError::ERROR_508, locale: $this->language) . ' | ' . $e->getMessage()
            );
        }
    }

    public function export(): JsonResponse
    {
        $fileName = 'export/translations.xlsx';

        $productExport = new TranslationExport;

        try {
            Excel::store($productExport, $fileName, 'public', \Maatwebsite\Excel\Excel::XLSX);

            return $this->successResponse('Successfully exported', [
                'path'      => 'public/export',
                'file_name' => $fileName
            ]);
        } catch (Throwable $e) {
            $this->error($e);
        }

        return $this->errorResponse('Error during export');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param FilterParamsRequest $request
     * @return JsonResponse
     */
    public function destroy(FilterParamsRequest $request): JsonResponse
    {
        $this->service->delete($request->input('ids'));

        return $this->successResponse(
            __('errors.' . ResponseError::RECORD_WAS_SUCCESSFULLY_DELETED, locale: $this->language),
            []
        );
    }

    /**
     * @return JsonResponse
     */
    public function dropAll(): JsonResponse
    {
        $this->service->dropAll();

        return $this->successResponse(__('web.record_was_successfully_updated'), []);
    }

    /**
     * @return JsonResponse
     */
    public function truncate(): JsonResponse
    {
        $this->service->truncate();

        return $this->successResponse(__('web.record_was_successfully_updated'), []);
    }

    /**
     * @return JsonResponse
     */
    public function restoreAll(): JsonResponse
    {
        $this->service->restoreAll();

        return $this->successResponse(__('web.record_was_successfully_updated'), []);
    }

}

<?php

namespace App\Services\InventoryService;

use App\Helpers\ResponseError;
use App\Models\InventoryItem;
use App\Models\InventoryItemHistory;
use App\Services\CoreService;
use DB;
use Throwable;

class InventoryItemService extends CoreService
{

    protected function getModelClass(): string
    {
        return InventoryItem::class;
    }

    /**
     * Create a new Shop model.
     * @param array $data
     * @return array
     */
    public function create(array $data): array
    {
        try {
            $model = DB::transaction(function () use($data) {

                /** @var InventoryItem $model */
                $model = $this->model()->create($data);

                $data['inventory_item_id'] = $model->id;

                InventoryItemHistory::create($data);

				if (data_get($data, 'images.0')) {
					$model->galleries()->delete();
					$model->uploads(data_get($data, 'images'));
					$model->update(['img' => data_get($data, 'images.0')]);
				}

                return $model;
            });

            return [
                'status' => true,
                'code'   => ResponseError::NO_ERROR,
                'data'   => $model
            ];
        } catch (Throwable $e) {
            $this->error($e);
            return [
                'status'  => false,
                'code'    => ResponseError::ERROR_501,
                'message' => __('errors.' . ResponseError::ERROR_501, locale: $this->language)
            ];
        }
    }

    /**
     * Update specified Inventory model.
     * @param InventoryItem $model
     * @param array $data
     * @return array
     */
    public function update(InventoryItem $model, array $data): array
    {
        try {
            $model = DB::transaction(function () use($model, $data) {

                $model->update($data);

                $history = $model->toArray();
                $history['inventory_item_id'] = $model->id;

                InventoryItemHistory::create($history);

				if (data_get($data, 'images.0')) {
					$model->galleries()->delete();
					$model->uploads(data_get($data, 'images'));
					$model->update(['img' => data_get($data, 'images.0')]);
				}

                return $model;
            });

            return [
                'status' => true,
                'code'   => ResponseError::NO_ERROR,
                'data'   => $model
            ];
        } catch (Throwable $e) {
            $this->error($e);
            return [
                'status'  => false,
                'code'    => ResponseError::ERROR_502,
                'message' => __('errors.' . ResponseError::ERROR_502, locale: $this->language)
            ];
        }
    }

    /**
     * Delete model.
     * @param array|null $ids
     * @param int|null $shopId
     * @return array
     */
    public function delete(?array $ids = [], ?int $shopId = null): array
    {
        $models = InventoryItem::when(
			$shopId,
			fn($q) => $q->whereHas('inventory', fn($q) => $q->where('shop_id', $shopId))
		)
			->whereIn('id', $ids)
			->get();

        $errorIds = [];

        foreach ($models as $model) {
            try {
                $model->delete();
            } catch (Throwable $e) {
                $this->error($e);
                $errorIds[] = $model->id;
            }
        }

        if (count($errorIds) === 0) {
            return ['status' => true, 'code' => ResponseError::NO_ERROR];
        }

        return [
            'status'  => false,
            'code'    => ResponseError::ERROR_505,
            'message' => __(
                'errors.' . ResponseError::CANT_DELETE_IDS,
                [
                    'ids' => implode(', ', $errorIds)
                ],
                $this->language
            )
        ];

    }

}

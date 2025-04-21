<?php

namespace App\Services\ExtraValueService;

use App\Helpers\ResponseError;
use App\Models\ExtraGroup;
use App\Models\ExtraValue;
use App\Models\StockExtra;
use App\Repositories\ExtraRepository\ExtraGroupRepository;
use App\Services\CoreService;
use App\Traits\SetTranslations;
use Throwable;

class ExtraValueService extends CoreService
{
    use SetTranslations;

    /**
     * @return string
     */
    protected function getModelClass(): string
    {
        return ExtraValue::class;
    }


    public function create(array $data): array
    {
        try {
            $group = (new ExtraGroupRepository)->extraGroupDetails(data_get($data, 'extra_group_id'));

            if (empty($group)) {
                return [
                    'status' => false,
                    'code'   => ResponseError::ERROR_404
                ];
            }

            /** @var ExtraValue $extraValue */
            /** @var ExtraGroup $group */
            $extraValue = $group->extraValues()->create($data);

            $images = data_get($data, 'images', []);

            if (is_array($images)) {
                $extraValue->galleries()->delete();
                $extraValue->uploads($images ?: []);
            }

            return [
                'status'    => true,
                'code'      => ResponseError::NO_ERROR,
                'data'      => $extraValue,
            ];
        } catch (Throwable $e) {

            $this->error($e);

            return [
                'status'    => false,
                'code'      => ResponseError::ERROR_501,
            ];
        }
    }

    public function update(ExtraValue $extraValue, array $data): array
    {
        try {

            $extraValue->update($data);

            $images = data_get($data, 'images');

            if (is_array($images)) {
                $extraValue->galleries()->delete();

                $extraValue->uploads($images ?: []);
            }

            return [
                'status'    => true,
                'code'      => ResponseError::NO_ERROR,
                'data'      => $extraValue->refresh(),
            ];
        } catch (Throwable $e) {

            $this->error($e);

            return [
                'status'    => false,
                'code'      => ResponseError::ERROR_501,
            ];
        }
    }

    public function delete(?array $ids, ?int $shopId = null): void
    {
        $extraValues = $this->model()
            ->whereIn('id', is_array($ids) ? $ids : [])
            ->when($shopId, fn($q) => $q->whereHas('group', fn($q) => $q->where('shop_id', $shopId)))
            ->get();

        foreach ($extraValues as $extraValue) {

            /** @var ExtraValue $extraValue */

            StockExtra::where('extra_value_id', $extraValue->id)->delete();

            $extraValue->delete();

        }
    }

    public function setActive(int $id): array
    {
        $extraValue = ExtraValue::find($id);

        if (empty($extraValue)) {
            return [
                'status' => false,
                'code' => ResponseError::ERROR_404
            ];
        }

        /** @var ExtraValue $extraValue */
        $extraValue->update(['active' => !$extraValue->active]);

        return [
            'status' => true,
            'code'   => ResponseError::NO_ERROR,
            'data'   => $extraValue,
        ];
    }
}

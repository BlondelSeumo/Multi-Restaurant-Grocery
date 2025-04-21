<?php

namespace App\Repositories\InventoryRepository;

use App\Models\InventoryItem;
use App\Models\Language;
use App\Repositories\CoreRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class InventoryItemRepository extends CoreRepository
{
    protected function getModelClass(): string
    {
        return InventoryItem::class;
    }

    /**
     * @param array $filter
     * @return LengthAwarePaginator
     */
    public function paginate(array $filter): LengthAwarePaginator
    {
        $locale = data_get(Language::languagesList()->where('default', 1)->first(), 'locale');

        /** @var InventoryItem $model */
        $model = $this->model();

        return $model
            ->filter($filter)
            ->with([
                'unit.translation' => fn($q) => $q->where(fn($q) => $q->where('locale', $this->language)->orWhere('locale', $locale)),
            ])
            ->paginate(data_get($filter, 'perPage', 10));
    }

    /**
     * @param InventoryItem $model
     * @return InventoryItem|null
     */
    public function show(InventoryItem $model): InventoryItem|null
    {
        $locale = data_get(Language::languagesList()->where('default', 1)->first(), 'locale');

        return $model->loadMissing([
			'galleries',
			'unit.translation' => fn($q) => $q->where(fn($q) => $q->where('locale', $this->language)->orWhere('locale', $locale)),
		]);
    }
}

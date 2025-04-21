<?php

namespace App\Repositories\OrderRepository;

use App\Models\Language;
use App\Models\OrderDetail;
use App\Repositories\CoreRepository;

class OrderDetailRepository extends CoreRepository
{
    /**
     * @return string
     */
    protected function getModelClass(): string
    {
        return OrderDetail::class;
    }

    public function paginate(array $filter = [])
    {
        $locale = data_get(Language::languagesList()->where('default', 1)->first(), 'locale');

        return $this->model()
            ->filter($filter)
            ->with([
                'stock',
                'order:id,delivery_type',
                'order.currency',
                'stock.countable.translation' => function ($q) use($locale) {
                    $q
                        ->select('id', 'product_id', 'locale', 'title')
                        ->where('locale', $this->language)
                        ->orWhere('locale', $locale);
                },
                'stock.countable.unit.translation' => function ($q) use($locale) {
                    $q->where(fn($q) => $q->where('locale', $this->language)->orWhere('locale', $locale));
                },
                'children.stock.countable.translation' => function ($q) use($locale) {
                    $q
                        ->select('id', 'product_id', 'locale', 'title')
                        ->where('locale', $this->language)
                        ->orWhere('locale', $locale);
                },
                'children.stock.countable.unit.translation' => function ($q) use($locale) {
                    $q->where(fn($q) => $q->where('locale', $this->language)->orWhere('locale', $locale));
                }
            ])
            ->whereNull('parent_id')
            ->paginate(data_get($filter, 'perPage', 10));
    }

    public function orderDetailById(int $id)
    {
        return $this->model()->find($id);
    }

}

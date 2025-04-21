<?php

namespace App\Repositories\OrderRepository\Cook;

use App\Models\Language;
use App\Models\Order;
use App\Repositories\CoreRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

class OrderRepository extends CoreRepository
{
    protected function getModelClass(): string
    {
        return Order::class;
    }

    /**
     * @param array $data
     * @return LengthAwarePaginator
     */
    public function paginate(array $data = []): LengthAwarePaginator
    {
        $locale = data_get(Language::languagesList()->where('default', 1)->first(), 'locale');

        $status = $data['status'] ?? null;
        $statuses = (array)($data['statuses'] ?? []);

        unset($data['status']);
        unset($data['statuses']);

        return $this->model()
            ->with([
                'waiter:id,firstname,lastname,img,phone,email',
                'orderDetails' => fn($q) => $q->whereNull('parent_id')->filter($data),
                'orderDetails.stock.stockExtras.group.translation' => function ($q) use($locale) {
                    $q
                        ->select('id', 'extra_group_id', 'locale', 'title')
                        ->where('locale', $this->language)
                        ->orWhere('locale', $locale);
                },
                'orderDetails.stock.countable:id,unit_id',
                'orderDetails.stock.countable.translation' => function ($q) {
                    $q->select('id', 'product_id', 'locale', 'title')->where('locale', $this->language);
                },
                'orderDetails.stock.countable.unit.translation' => fn($q) => $q
                    ->where('locale', $this->language)
                    ->orWhere('locale', $locale),
                'orderDetails.children.stock.countable:id,unit_id',
                'orderDetails.children.stock.stockExtras.group.translation' => function ($cgt) use($locale) {
                    $cgt->select('id', 'extra_group_id', 'locale', 'title')
                        ->where('locale', $this->language)
                        ->orWhere('locale', $locale);
                },
                'orderDetails.children.stock.countable.unit.translation' => fn($q) => $q
                    ->where('locale', $this->language)
                    ->orWhere('locale', $locale),
                'orderDetails.children.stock.countable.translation' => fn($ct) => $ct
                    ->where('locale', $this->language)
                    ->orWhere('locale', $locale),
            ])
            ->withCount(['orderDetails' => fn($q) => $q->filter($data)])
            ->whereHas('orderDetails', fn($q) => $q->filter($data))
            ->when($status, fn($q) => $q->where('status', $status), fn($q) => $q->whereIn('status', Order::COOKER_STATUSES))
            ->when(count($statuses) > 0, fn($q) => $q->whereIn('status', $statuses))
            ->orderBy(data_get($data, 'column', 'id'), data_get($data, 'sort', 'desc'))
            ->paginate(data_get($data, 'perPage', 10));
    }

    /**
     * @param int|null $id
     * @param array $data
     * @return Builder|array|Collection|Model|Order|null
     */
    public function show(?int $id, array $data = []): Builder|array|Collection|Model|Order|null
    {
        /** @var Order $order */
        $order  = $this->model();
        $locale = data_get(Language::languagesList()->where('default', 1)->first(), 'locale');

        return $order
            ->with([
                'waiter:id,firstname,lastname,img,phone,email',
                'orderDetails' => fn($q) => $q->whereNull('parent_id')->filter($data),
                'orderDetails.stock.countable:id,unit_id',
                'orderDetails.children.stock.countable:id,unit_id',
                'orderDetails.stock.stockExtras.group.translation' => function ($q) use($locale) {
                    $q
                        ->select('id', 'extra_group_id', 'locale', 'title')
                        ->where('locale', $this->language)
                        ->orWhere('locale', $locale);
                },
                'orderDetails.stock.countable.translation' => function ($q) {
                    $q->select('id', 'product_id', 'locale', 'title')->where('locale', $this->language);
                },
                'orderDetails.stock.countable.unit.translation' => fn($q) => $q
                    ->where('locale', $this->language)
                    ->orWhere('locale', $locale),
                'orderDetails.children.stock.countable:id,unit_id',
                'orderDetails.children.stock.stockExtras.group.translation' => function ($cgt) use($locale) {
                    $cgt->select('id', 'extra_group_id', 'locale', 'title')
                        ->where('locale', $this->language)
                        ->orWhere('locale', $locale);
                },
                'orderDetails.children.stock.countable.unit.translation' => fn($q) => $q
                    ->where('locale', $this->language)
                    ->orWhere('locale', $locale),
                'orderDetails.children.stock.countable.translation' => fn($ct) => $ct
                    ->where('locale', $this->language)
                    ->orWhere('locale', $locale),
            ])
            ->find($id);
    }
}

<?php

namespace App\Models;

use App\Traits\Loadable;
use Carbon\Carbon;
use Eloquent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Schema;

/**
 * App\Models\InventoryItemHistory
 *
 * @property int $id
 * @property int $inventory_id
 * @property string $name
 * @property int $quantity
 * @property int $price
 * @property string $bar_code
 * @property int $unit_id
 * @property string $interval
 * @property Carbon|null $expired_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 * @property-read Inventory $inventory
 * @property-read Unit $unit
 * @method static Builder|self newModelQuery()
 * @method static Builder|self newQuery()
 * @method static Builder|self query()
 * @method static Builder|self filter(array $filter)
 * @method static Builder|self whereId($value)
 * @mixin Eloquent
 */
class InventoryItemHistory extends Model
{
    use Loadable, SoftDeletes;

    protected $guarded = ['id'];

	public function inventory(): BelongsTo
	{
		return $this->belongsTo(Inventory::class);
	}

	public function inventoryItem(): BelongsTo
	{
		return $this->belongsTo(InventoryItem::class);
	}

	public function unit(): BelongsTo
	{
		return $this->belongsTo(Unit::class);
	}

	public function scopeFilter($value, $filter)
	{
		$column = data_get($filter,'column');

		if (!Schema::hasColumn('inventory_item_histories', $column)) {
			$column = 'id';
		}

		return $value
			->when(isset($filter['deleted_at']), 		fn($q) => $q->onlyTrashed())
			->when(isset($filter['name']), 				fn($q) => $q->where('name', 'like', '%' . $filter['name'] . '%'))
			->when(isset($filter['unit_id']), 			fn($q) => $q->where('unit', 			  $filter['unit_id']))
			->when(isset($filter['inventory_id']), 		fn($q) => $q->where('inventory_id', 	  $filter['inventory_id']))
			->when(isset($filter['inventory_item_id']), fn($q) => $q->where('inventory_item_id',  $filter['inventory_item_id']))
			->when(isset($filter['quantity']), 			fn($q) => $q->where('quantity', 		  $filter['quantity']))
			->when(isset($filter['price']), 			fn($q) => $q->where('price', 			  $filter['price']))
			->when(isset($filter['bar_code']), 			fn($q) => $q->where('bar_code', 		  $filter['bar_code']))
			->when(isset($filter['interval']), 			fn($q) => $q->where('interval', 		  $filter['interval']))
			->when(isset($filter['expired_from']), 		fn($q) => $q->where('expired_at', '>=',   $filter['expired_from']))
			->when(isset($filter['expired_to']),   		fn($q) => $q->where('expired_at', '<=',   $filter['expired_to']))
			->when(data_get($filter, 'shop_id'), function ($q, $shopId) use ($filter) {

				$q->whereHas('inventory', function ($q) use ($shopId) {

					$q->where('shop_id', $shopId);

					if (!request()->is('api/v1/dashboard/admin/*')) {
						$q->orWhereNull('shop_id');
					}

				});

			})
			->when(
				$column,
				fn($query, $column) => $query->orderBy($column, $filter['sort'] ?? 'desc'),
				fn($query) => $query->orderBy('id', 'desc')
			);
	}
}

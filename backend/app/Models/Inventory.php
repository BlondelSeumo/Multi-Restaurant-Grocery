<?php

namespace App\Models;

use Eloquent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;
use Schema;

/**
 * App\Models\Inventory
 *
 * @property int $id
 * @property int $shop_id
 * @property string $latitude
 * @property string $longitude
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 * @property-read Shop|null $shop
 * @property-read Collection|InventoryItem[] $inventoryItems
 * @property-read InventoryItem|null $inventory_items_count
 * @property-read InventoryTranslation|null $translation
 * @property-read Collection|InventoryTranslation[] $translations
 * @property-read int|null $translations_count
 * @method static Builder|self filter($array)
 * @method static Builder|self newModelQuery()
 * @method static Builder|self newQuery()
 * @method static Builder|self query()
 * @method static Builder|self whereId($value)
 * @method static Builder|self whereShopId($value)
 * @mixin Eloquent
 */
class Inventory extends Model
{
    use SoftDeletes;

    protected $guarded = ['id'];

    public function inventoryItems(): HasMany
    {
        return $this->hasMany(InventoryItem::class);
    }

    public function shop(): BelongsTo
	{
        return $this->belongsTo(Shop::class);
    }

	public function translations(): HasMany
	{
		return $this->hasMany(InventoryTranslation::class);
	}

	public function translation(): HasOne
	{
		return $this->hasOne(InventoryTranslation::class);
	}

    /* Filter Scope */
    public function scopeFilter($value, $filter)
    {
		$column = data_get($filter,'column');

		if (!Schema::hasColumn('inventories', $column)) {
			$column = 'id';
		}

        return $value
            ->when(isset($filter['deleted_at']), fn($q) => $q->onlyTrashed())
			->when(data_get($filter, 'shop_id'), function ($q, $shopId) use ($filter) {

				$q->where(function ($q) use ($shopId) {

					$q->where('shop_id', $shopId);

					if (!request()->is('api/v1/dashboard/admin/*')) {
						$q->orWhereNull('shop_id');
					}

				});

			})
			->when(data_get($filter, 'search'), function ($query, $search) {
				$query->whereHas('translations', function ($q) use ($search) {
					$q->where('title', 'LIKE', "%$search%")->select('id', 'inventory_id', 'locale', 'title');
				});
			})
            ->when(
				$column,
				fn($query, $column) => $query->orderBy($column, $filter['sort'] ?? 'desc'),
				fn($query) => $query->orderBy('id', 'desc')
			);
    }

}

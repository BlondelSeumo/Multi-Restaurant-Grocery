<?php

namespace App\Models;

use Eloquent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;


/**
 * App\Models\Kitchen
 *
 * @property int $id
 * @property int $active
 * @property integer|null $shop_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Shop|null $shop
 * @method static Builder|self filter($array)
 * @method static Builder|self newModelQuery()
 * @method static Builder|self newQuery()
 * @method static Builder|self query()
 * @method static Builder|self whereActive($value)
 * @method static Builder|self whereCreatedAt($value)
 * @method static Builder|self whereDeletedAt($value)
 * @method static Builder|self whereId($value)
 * @method static Builder|self whereImg($value)
 * @method static Builder|self whereShopId($value)
 * @method static Builder|self whereTitle($value)
 * @method static Builder|self whereUpdatedAt($value)
 * @method static Builder|self whereUuid($value)
 * @mixin Eloquent
 */
class Kitchen extends Model
{
    use HasFactory;


    protected $guarded = ['id'];
    // Translations
    public function translations(): HasMany
    {
        return $this->hasMany(KitchenTranslation::class);
    }
    public function translation(): HasOne
    {
        return $this->hasOne(KitchenTranslation::class);
    }
    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class);
    }

    /* Filter Scope */
    public function scopeFilter($value, $filter)
    {
        return $value
            ->when(data_get($filter, 'search'), function ($query, $search) {
                $query->whereHas('translations', function ($q) use ($search) {
                    $q->where('title', 'LIKE', "%$search%")->select('id', 'kitchen_id', 'locale', 'title');
                });
            })
            ->when(data_get($filter, 'shop_id'), function ($q, $shopId) use ($filter) {
                $q->where('shop_id', $shopId);
            })
            ->when(isset($filter['active']), function ($q) use ($filter) {
                $q->whereActive($filter['active']);
            })
            ->when(data_get($filter,'column'), function (Builder $query, $column) use($filter) {
                $query->orderBy($column, data_get($filter, 'sort', 'desc'));
            }, fn($query) => $query->orderBy('id', 'desc'));
    }
}

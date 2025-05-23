<?php

namespace App\Models;

use App\Traits\Countable;
use App\Traits\Loadable;
use App\Traits\MetaTagable;
use App\Traits\Reviewable;
use App\Traits\SetCurrency;
use Database\Factories\ProductFactory;
use Eloquent;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;
use Schema;

/**
 * App\Models\Product
 *
 * @property int $id
 * @property string $uuid
 * @property int $category_id
 * @property int $brand_id
 * @property int $parent_id
 * @property int|null $unit_id
 * @property bool $visibility
 * @property string|null $keywords
 * @property string|null $img
 * @property integer|null $min_qty
 * @property integer|null $max_qty
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 * @property string|null $qr_code
 * @property int|null $stocks_sum_quantity
 * @property double $tax
 * @property int $shop_id
 * @property int $kitchen_id
 * @property boolean $active
 * @property boolean $addon
 * @property string $status
 * @property string $status_note
 * @property string $vegetarian
 * @property string $interval
 * @property string $kcal
 * @property string $carbs
 * @property string $protein
 * @property string $fats
 * @property-read Brand $brand
 * @property-read Collection|Tag[] $tags
 * @property-read Category $category
 * @property-read Discount|null $discount
 * @property-read Collection|Discount[] $discounts
 * @property-read int|null $discounts_count
 * @property-read Collection|ExtraGroup[] $extras
 * @property-read int|null $extras_count
 * @property-read Collection|Gallery[] $galleries
 * @property-read int|null $galleries_count
 * @property-read Collection|Story[] $stories
 * @property-read int|null $stories_count
 * @property-read Collection|OrderDetail[] $order_details
 * @property-read int|null $order_details_count
 * @property-read int|null $product_sales_count
 * @property-read Collection|ProductProperties[] $properties
 * @property-read int|null $properties_count
 * @property-read Collection|StockAddon[] $addons
 * @property-read int|null $addons_count
 * @property-read Collection|Review[] $reviews
 * @property-read int|null $reviews_count
 * @property-read int|null $reviews_avg_rating
 * @property-read Shop|null $shop
 * @property-read Product|null $parent
 * @property-read Collection|Product[] $children
 * @property-read Collection|Stock[] $stocks
 * @property-read Stock|null $stock
 * @property-read int|null $stocks_count
 * @property-read ProductTranslation|null $translation
 * @property-read Collection|ProductTranslation[] $translations
 * @property-read int|null $translations_count
 * @property-read Unit|null $unit
 * @method static ProductFactory factory(...$parameters)
 * @method static Builder|Product filter($array)
 * @method static Builder|Product active($active)
 * @method static Builder|Product newModelQuery()
 * @method static Builder|Product newQuery()
 * @method static Builder|Product onlyTrashed()
 * @method static Builder|Product query()
 * @method static Builder|Product updatedDate($updatedDate)
 * @method static Builder|Product whereBrandId($value)
 * @method static Builder|Product whereAddon($value)
 * @method static Builder|Product whereCategoryId($value)
 * @method static Builder|Product whereCreatedAt($value)
 * @method static Builder|Product whereDeletedAt($value)
 * @method static Builder|Product whereId($value)
 * @method static Builder|Product whereImg($value)
 * @method static Builder|Product whereKeywords($value)
 * @method static Builder|Product whereQrCode($value)
 * @method static Builder|Product whereUnitId($value)
 * @method static Builder|Product whereUpdatedAt($value)
 * @method static Builder|Product whereUuid($value)
 * @method static Builder|Product withTrashed()
 * @method static Builder|Product withoutTrashed()
 * @mixin Eloquent
 */
class Product extends Model
{
    use HasFactory, SoftDeletes, Countable, Loadable, Reviewable, SetCurrency, MetaTagable;

    protected $guarded = ['id'];

    protected $casts = [
        'interval'  => 'double',
        'active'    => 'bool',
        'addon'     => 'bool',
        'min_qty'   => 'int',
        'max_qty'   => 'int',
    ];

    const PUBLISHED     = 'published';
    const PENDING       = 'pending';
    const UNPUBLISHED   = 'unpublished';

    const STATUSES = [
        self::PUBLISHED     => self::PUBLISHED,
        self::PENDING       => self::PENDING,
        self::UNPUBLISHED   => self::UNPUBLISHED,
    ];

    // Translations
    public function translations(): HasMany
    {
        return $this->hasMany(ProductTranslation::class);
    }

    public function translation(): HasOne
    {
        return $this->hasOne(ProductTranslation::class);
    }

    public function kitchen(): BelongsTo
    {
        return $this->belongsTo(Kitchen::class);
    }

    // Product Shop
    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class);
    }

    public function stories(): HasMany
    {
        return $this->hasMany(Story::class);
    }

    // Product Category
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    // Product Brand
    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id');
    }

    // Product Properties
    public function properties(): HasMany
    {
        return $this->hasMany(ProductProperties::class);
    }

    public function orderDetails(): HasManyThrough
    {
        return $this->hasManyThrough(OrderDetail::class, Stock::class,
            'countable_id', 'stock_id', 'id', 'id');
    }

    public function addons(): HasMany
    {
        return $this->hasMany(StockAddon::class, 'addon_id');
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function extras(): BelongsToMany
    {
        return $this->belongsToMany(ExtraGroup::class, ProductExtra::class);
    }

    public function stock(): HasOne
    {
        return $this->hasOne(Stock::class, 'countable_id');
    }

    public function stocks(): HasMany
    {
        return $this->hasMany(Stock::class, 'countable_id');
    }

    public function discounts(): BelongsToMany
    {
        return $this->belongsToMany(Discount::class, 'product_discounts', 'product_id', 'discount_id');
    }

    public function tags(): HasMany
    {
        return $this->hasMany(Tag::class);
    }

    public function scopeUpdatedDate($query, $updatedDate)
    {
        return $query->where('updated_at', '>', $updatedDate);
    }

    public function scopeActive($query, $active)
    {
        return $query->where('active', $active);
    }

    public function scopeFilter($query, $array)
    {
        if (data_get($array, 'with_addon')) {
            unset($array['addon']);
        }

        if (data_get($array, 'shop_id')) {
            unset($array['address']);
        }

        $column = $array['column'] ?? 'id';

        if (Schema::hasColumn('products', $column)) {
            $column = 'id';
        }

        $query
            ->when(isset($array['price_from']), function ($q) use ($array) {
                $q->whereHas('stocks', function ($stock) use($array) {
                    $stock
                        ->where('price', '>=', data_get($array, 'price_from') / $this->currency())
                        ->where('price', '<=', data_get($array, 'price_to',10000000000) / $this->currency());
                });
            })
            ->when(data_get($array, 'actual'), function ($query, $actual) {

                if ($actual === 'in_stock') {
                    $query->whereHas('stocks', fn($q) => $q->where('quantity', '>', 0));
                } else if ($actual === 'low_stock') {
                    $query->whereHas('stocks', fn($q) => $q->where('quantity', '<=', 10)->where('quantity', '>', 0));
                } else if ($actual === 'out_of_stock') {
                    $query->whereHas('stocks', fn($q) => $q->where('quantity', '<=', 0));
                }

                return $query;
            })
            ->when(data_get($array, 'prices'), function (Builder $q, $prices) {

                $to   = data_get($prices, 0, 0) / $this->currency();
                $from = data_get($prices, 1, 0) / $this->currency();

                $q->whereHas('stocks', fn($q) => $q->where([
                    ['price', '>=', $to],
                    ['price', '<=', $to >= $from ? Stock::max('price') : $from],
                ]));

            })
            ->when(isset($array['shop_id']), function ($q) use ($array) {
                $q->where('shop_id', $array['shop_id']);
            })
            ->when(isset($array['category_id']), function ($q) use ($array) {
                $q->where('category_id', $array['category_id']);
            })
            ->when(isset($array['kitchen_id']), function ($q) use ($array) {
                $q->where('kitchen_id', $array['kitchen_id']);
            })
            ->when(isset($array['category_ids']), function ($q) use ($array) {
                $q->whereIn('category_ids', (array)$array['category_ids']);
            })
            ->when(isset($array['visibility']), function ($q) use ($array) {
                $q->where('visibility', $array['visibility']);
            })
            ->when(isset($array['status']), function ($q) use ($array) {
                $q->where('status', $array['status']);
            })
            ->when(isset($array['brand_id']), function ($q) use ($array) {
                $q->where('brand_id', $array['brand_id']);
            })
            ->when(data_get($array, 'brand_ids.*'), function ($q) use ($array) {
                $q->whereIn('brand_id', $array['brand_ids']);
            })
            ->when(isset($array['column_rate']), function ($q) use ($array) {
                $q->whereHas('reviews', function ($review) use($array) {
                    $review->orderBy('rating', data_get($array, 'sort', 'desc'));
                });
            })
            ->when(isset($array['deleted_at']), fn($q) => $q->onlyTrashed())
            ->when(data_get($array, 'bonus'), function (Builder $query) {
                $query->whereHas('stocks.bonus', function ($q) {
                    $q->where('expired_at', '>=', now());
                });
            })
            ->when(data_get($array, 'deals'), function (Builder $query) {
                $query->where(function ($query) {
                    $query->whereHas('stocks.bonus', function ($q) {
                        $q->where('expired_at', '>=', now());
                    })->orWhereHas('discounts', function ($q) {
                        $q->where('end', '>=', now())->where('active', 1);
                    });
                });
            })
            ->when(isset($array['active']), fn($query, $active) => $query->active($active))
            ->when(isset($array['addon']), fn($query, $addon) => $query->whereAddon($addon)->whereHas('stock'),
                fn($query) => $query->whereAddon(0)
            )
            ->when(data_get($array, 'date_from'), function (Builder $query, $dateFrom) use ($array) {

                $dateFrom = date('Y-m-d 00:00:01', strtotime($dateFrom));
                $dateTo = data_get($array, 'date_to', date('Y-m-d'));

                $dateTo = date('Y-m-d 23:59:59', strtotime($dateTo . ' +1 day'));

                $query->where([
                    ['created_at', '>=', $dateFrom],
                    ['created_at', '<=', $dateTo],
                ]);
            })
            ->when(isset($array['column_order']), function ($q) use ($array) {
                $q->withCount('orderDetails')->orderBy('order_details_count', data_get($array, 'sort', 'desc'));
            })
            ->when(isset($array['rest']), function ($q) {
                $q->whereHas('stocks', function ($item) {
                    $item->where('quantity', '>', 0);
                });
            })
            ->when(data_get($array, 'address'), function ($query) use ($array) {
                $query->whereHas('shop', fn($q) => $q->filter(['address' => data_get($array, 'address')]));
            })
            ->when(data_get($array, 'search'), function ($q, $search) {
                $q->where(function ($query) use ($search) {
                    $query
                        ->where('keywords', 'LIKE', "%$search%")
                        ->orWhere('id', 'LIKE', "%$search%")
                        ->orWhere('uuid', 'LIKE', "%$search%")
                        ->orWhereHas('translation', function ($q) use($search) {
                            $q->where('title', 'LIKE', "%$search%")
                                ->select('id', 'product_id', 'locale', 'title');
                        });
                });
            })
            ->when(isset($array['column_price']), function ($q) use ($array) {
                $q->withAvg('stocks', 'price')->orderBy('stocks_avg_price', data_get($array, 'sort', 'desc'));
            })
            ->when(isset($array['with_addon']), fn($query, $addon) => $query->whereHas('stocks', fn($q) => $q->whereHas('addons')))
            ->orderBy($column, data_get($array, 'sort', 'desc'));
    }
}

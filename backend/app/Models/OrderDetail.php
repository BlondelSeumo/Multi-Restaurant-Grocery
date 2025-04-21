<?php

namespace App\Models;

use App\Traits\Notification;
use Database\Factories\OrderDetailFactory;
use Eloquent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Schema;

/**
 * App\Models\OrderDetail
 *
 * @property int $id
 * @property int $order_id
 * @property int $stock_id
 * @property int $parent_id
 * @property int $kitchen_id
 * @property int $cook_id
 * @property float $origin_price
 * @property float $total_price
 * @property float $tax
 * @property float $discount
 * @property float $rate_discount
 * @property int $quantity
 * @property string $note
 * @property string $status
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Order $order
 * @property-read Stock $stock
 * @property-read int $rate_total_price
 * @property-read int $rate_origin_price
 * @property-read int $rate_tax
 * @property-read boolean $bonus
 * @property-read self $parent
 * @property-read Collection $children
 * @method static OrderDetailFactory factory(...$parameters)
 * @method static Builder|self filter($array)
 * @method static Builder|self newModelQuery()
 * @method static Builder|self newQuery()
 * @method static Builder|self query()
 * @method static Builder|self updatedDate($updatedDate)
 * @method static Builder|self whereCreatedAt($value)
 * @method static Builder|self whereDiscount($value)
 * @method static Builder|self whereId($value)
 * @method static Builder|self whereOrderId($value)
 * @method static Builder|self whereOriginPrice($value)
 * @method static Builder|self whereQuantity($value)
 * @method static Builder|self whereStockId($value)
 * @method static Builder|self whereTax($value)
 * @method static Builder|self whereTotalPrice($value)
 * @method static Builder|self whereUpdatedAt($value)
 * @mixin Eloquent
 */
class OrderDetail extends Model
{
    use HasFactory, Notification;

    protected $guarded = ['id'];

    const STATUS_NEW      = 'new';
    const STATUS_ACCEPTED = 'accepted';
    const STATUS_COOKING  = 'cooking';
    const STATUS_READY    = 'ready';
    const STATUS_ENDED    = 'ended';
    const STATUS_CANCELED = 'canceled';

    const STATUSES = [
        self::STATUS_NEW      => self::STATUS_NEW,
        self::STATUS_ACCEPTED => self::STATUS_ACCEPTED,
        self::STATUS_COOKING  => self::STATUS_COOKING,
        self::STATUS_READY    => self::STATUS_READY,
        self::STATUS_ENDED    => self::STATUS_ENDED,
        self::STATUS_CANCELED => self::STATUS_CANCELED,
    ];

    const MERGE_STATUSES = [
        self::STATUS_NEW      => self::STATUS_NEW,
        self::STATUS_ACCEPTED => self::STATUS_ACCEPTED,
        self::STATUS_COOKING  => self::STATUS_COOKING,
        self::STATUS_READY    => self::STATUS_READY,
        self::STATUS_CANCELED => self::STATUS_CANCELED,
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function kitchen(): BelongsTo
    {
        return $this->belongsTo(Kitchen::class);
    }

    public function cooker(): BelongsTo
    {
        return $this->belongsTo(User::class,'cook_id');
    }

    public function stock(): BelongsTo
    {
        return $this->belongsTo(Stock::class)->withTrashed();
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id');
    }

    public function getRateTotalPriceAttribute(): ?float
    {
        if (request()->is('api/v1/dashboard/user/*') || request()->is('api/v1/rest/*')) {
            return $this->total_price * $this->order->rate;
        }

        return $this->total_price;
    }

    public function getRateDiscountAttribute(): ?float
    {
        if (request()->is('api/v1/dashboard/user/*') || request()->is('api/v1/rest/*')) {
            return $this->discount * $this->order->rate;
        }

        return $this->discount;
    }

    public function getRateOriginPriceAttribute(): ?float
    {
        if (request()->is('api/v1/dashboard/user/*') || request()->is('api/v1/rest/*')) {
            return $this->origin_price * $this->order->rate;
        }

        return $this->origin_price;
    }

    public function getRateTaxAttribute(): ?float
    {
        if (request()->is('api/v1/dashboard/user/*') || request()->is('api/v1/rest/*')) {
            return $this->tax * $this->order->rate;
        }

        return $this->tax;
    }

    public function scopeUpdatedDate($query, $updatedDate)
    {
        return $query->where('updated_at', '>', $updatedDate);
    }

    /**
     * @param $query
     * @param $filter
     * @return void
     */
    public function scopeFilter($query, $filter): void
    {
        $column = data_get($filter, 'column', 'id');

        if (!Schema::hasColumn('orders', $column)) {
            $column = 'id';
        }

        $isCooker = request()->is('api/v1/dashboard/cook/*');

        $query
            ->when(data_get($filter, 'user_id'), function ($q, $userId) {
                $q->whereHas('order', function ($query) use($userId) {
                    $query->where('user_id', $userId);
                });
            })
            ->when(data_get($filter, 'shop_ids'), function ($q, $shopIds) {
                $q->whereHas('order', function ($query) use($shopIds) {
                    $query->whereIn('shop_id', $shopIds);
                });
            })
            ->when(data_get($filter, 'shop_id'), function ($q, $shopId) {
                $q->whereHas('order', fn($q) => $q->where('shop_id', $shopId));
            })
            ->when(data_get($filter, 'cook_id'), function ($q, $cookId) use ($isCooker) {

                if ($isCooker) {
                    return $q->where(function ($q) use ($cookId) {
                        $q->where('cook_id', $cookId)->orWhereNull('cook_id');
                    });
                }

                return $q->where('cook_id', $cookId);
            })
            ->when(data_get($filter, 'kitchen_id'), function ($q, $kitchenId) use ($isCooker) {

                if ($isCooker) {
                    return $q->where(function ($q) use ($kitchenId) {
                        $q->where('kitchen_id', $kitchenId)->orWhereNull('kitchen_id');
                    });
                }

                return $q->where('kitchen_id', $kitchenId);
            })
            ->when(data_get($filter, 'empty-cook'), fn($q)              => $q->whereNull('cook_id'))
            ->when(data_get($filter, 'isset-cook'), fn($q)              => $q->whereNotNull('cook_id'))
            ->when(data_get($filter, 'status'),     fn($q, $status) 	=> $q->where('status', $status))
            ->when(data_get($filter, 'statuses'),   fn($q, $statuses)   => $q->whereIn('status', $statuses))
            ->orderBy($column, data_get($filter, 'sort', 'desc'));
    }
}

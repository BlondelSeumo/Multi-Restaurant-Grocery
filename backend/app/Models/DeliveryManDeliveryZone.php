<?php

namespace App\Models;

use Eloquent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * App\Models\DeliveryZone
 *
 * @property int $id
 * @property int $user_id
 * @property array $address
 * @property User|null $user
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * @method static Builder|self newModelQuery()
 * @method static Builder|self newQuery()
 * @method static Builder|self query()
 * @method static Builder|self filter(array $filter = [])
 * @method static Builder|self whereCreatedAt($value)
 * @method static Builder|self whereId($value)
 * @method static Builder|self whereShopId($value)
 * @method static Builder|self whereUpdatedAt($value)
 * @mixin Eloquent
 */
class DeliveryManDeliveryZone extends Model
{
    use HasFactory;

    const TTL = 8640000000; // 100000 day

    protected $guarded = ['id'];

    protected $table = 'delivery_man_delivery_zones';

    protected $casts = [
        'address'    => 'array',
        'created_at' => 'datetime:Y-m-d H:i:s',
        'updated_at' => 'datetime:Y-m-d H:i:s',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeFilter($query, array $filter = []) {

        $query
            ->when(data_get($filter, 'user_id'), fn($q, $userId) => $q->where('shop_id', $userId))
            ->when(data_get($filter, 'shop_id'), fn($q, $shopId) => $q->whereHas('user.invitations', fn($q) => $q->where('shop_id', $shopId)))
            ->when(isset($filter['deleted_at']), fn($q) => $q->onlyTrashed())
            ->orderBy(data_get($filter, 'column', 'id'), data_get($filter, 'sort', 'desc'));

    }
}

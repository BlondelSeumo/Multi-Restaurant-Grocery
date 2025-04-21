<?php

namespace App\Models\Booking;

use App\Models\User;
use App\Models\WaiterTable;
use Eloquent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

/**
 * App\Models\Table
 *
 * @property int $id
 * @property string $name
 * @property int $shop_section_id
 * @property double $tax
 * @property int $chair_count
 * @property boolean $active
 * @property ShopSection|null $shopSection
 * @property Collection|User[] $waiters
 * @property Collection|UserBooking[] $users
 * @property int $users_count
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property string|null $deleted_at
 * @method static Builder|self newModelQuery()
 * @method static Builder|self newQuery()
 * @method static Builder|self query()
 * @method static Builder|self filter(array $filter)
 * @method static Builder|self whereCreatedAt($value)
 * @method static Builder|self whereDeletedAt($value)
 * @method static Builder|self whereId($value)
 * @method static Builder|self whereUpdatedAt($value)
 * @mixin Eloquent
 */
class Table extends Model
{
    use SoftDeletes;

    protected $guarded = ['id'];

    public function shopSection(): BelongsTo
    {
        return $this->belongsTo(ShopSection::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(UserBooking::class, 'table_id');
    }

    public function waiters(): BelongsToMany
    {
        return $this->belongsToMany(User::class, WaiterTable::class);
    }

    public function scopeFilter($query, $filter) {

        $freeFrom = data_get($filter, 'free_from');
        $dateFrom = data_get($filter, 'date_from');
        $dateTo   = data_get($filter, 'date_to');
        $status   = data_get($filter, 'status');

        $query
            ->when(data_get($filter, 'name'), fn($q, $name) => $q->where('name', 'LIKE', "%$name%"))
            ->when(data_get($filter, 'search'), fn($q, $name) => $q->where('name', 'LIKE', "%$name%")->orWhere('id', 'LIKE', "%$name%"))
            ->when(data_get($filter, 'shop_section_id'), fn($q, $shopSectionId) => $q->where('shop_section_id', $shopSectionId))
            ->when(data_get($filter, 'chair_count_from'), fn($q, $countFrom) => $q->where('chair_count', $countFrom))
            ->when(data_get($filter, 'chair_count_to'), fn($q, $countTo) => $q->where('chair_count', $countTo))
            ->when($freeFrom, function ($query, $freeFrom) use ($filter) {

                $query->whereDoesntHave('users', function ($q) use ($freeFrom, $filter) {

                    $freeTo = data_get($filter, 'free_to');

                    $q
                        ->where('start_date', '>=', $freeFrom)
                        ->when($freeTo, fn($b) => $b->where('end_date', '<=', $freeTo))
                        ->when(data_get($filter, 'table_id'), fn($b, $tableId) => $b->where('table_id', $tableId));
                });

            })
            ->when(!$freeFrom && ($dateFrom || $dateTo || $status), function ($query) use ($status, $filter) {

                $dateFrom = null;
                $dateTo   = null;

                if (data_get($filter, 'date_from')) {

                    $now 	   = date('Y-m-d H:i:s');
                    $startDate = data_get($filter, 'date_from', $now);

                    if ($startDate < $now) {
                        $startDate = $now;
                    }

                    $dateFrom  = date('Y-m-d H:i:s', strtotime($startDate));
                    $dateTo    = data_get($filter, 'date_to', $startDate);
                    $dateTo    = date('Y-m-d H:i:s', strtotime($dateTo));

                }

                if ($status && !in_array($status, ['booked', 'occupied'])) {
                    return $query->whereDoesntHave('users', fn($b) => $b
                        ->when($dateFrom, fn($q) => $q
                            ->whereDate('start_date', '>=', $dateFrom)
                            ->whereDate('start_date', '<=', $dateTo)
                        )
                    );
                }

                return $query->whereHas('users', function ($q) use ($dateFrom, $dateTo, $filter) {

                    if ($dateFrom) {
                        $q->where('start_date', '>=', $dateFrom)->where('start_date', '<=', $dateTo);
                    }

                    $status = $filter['status'] ?? null;

                    if (!$status) {
                        return;
                    }

                    if ($status === 'booked') {
                        $q->where('status', UserBooking::NEW);
                    } else if ($status === 'occupied') {
                        $q->where('status', UserBooking::ACCEPTED);
                    }

                });

            })
            ->when(data_get($filter, 'shop_id'), function ($query, $shopId) {
                $query->whereHas('shopSection', fn($q) => $q->where('shop_id', $shopId));
            })
            ->when(data_get($filter, 'shop_ids'), function ($query, $shopIds) {
                $query->whereHas('shopSection', fn($q) => $q->whereIn('shop_id', $shopIds));
            });
    }
}

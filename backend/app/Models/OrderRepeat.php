<?php

namespace App\Models;

use Carbon\Carbon;
use Eloquent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Schema;

/**
 * App\Models\OrderRepeat
 *
 * @property int $id
 * @property int $order_id
 * @property string $from
 * @property string $to
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Order|null $order
 * @method static Builder|self filter($array)
 * @method static Builder|self newModelQuery()
 * @method static Builder|self newQuery()
 * @method static Builder|self query()
 * @mixin Eloquent
 */
class OrderRepeat extends Model
{
	protected $guarded = ['id'];

	public function order(): BelongsTo
	{
		return $this->belongsTo(Order::class);
	}

	/**
	 * @param $query
	 * @param $filter
	 * @return void
	 */
	public function scopeFilter($query, $filter): void
	{
		$column = data_get($filter, 'column', 'id');

		if (!Schema::hasColumn('order_repeats', $column)) {
			$column = 'id';
		}

		$query->orderBy($column, data_get($filter, 'sort', 'desc'));
	}

}

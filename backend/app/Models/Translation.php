<?php

namespace App\Models;

use DB;
use Eloquent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * App\Models\Translation
 *
 * @property int $id
 * @property int $status
 * @property string $locale
 * @property string $group
 * @property string $key
 * @property string|null $value
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 * @method static Builder|self filter($array = [])
 * @method static Builder|self newModelQuery()
 * @method static Builder|self newQuery()
 * @method static Builder|self query()
 * @method static Builder|self whereCreatedAt($value)
 * @method static Builder|self whereGroup($value)
 * @method static Builder|self whereId($value)
 * @method static Builder|self whereKey($value)
 * @method static Builder|self whereLocale($value)
 * @method static Builder|self whereUpdatedAt($value)
 * @method static Builder|self whereValue($value)
 * @mixin Eloquent
 */
class Translation extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = ['id'];

    public function scopeFilter($query, $array = [])
    {
        return $query
            ->when(data_get($array, 'search'), fn ($query, $search) => $query->where(function ($q) use($search) {
                $q
                    ->where('key', 'LIKE', "%$search%")
                    ->orWhere(DB::raw('LOWER(value)'), 'LIKE', '%' . strtolower($search) . '%')
                    ->orWhere('value', 'LIKE', "%$search%");
            })
            )
            ->when(isset($array['group']), function ($q) use ($array) {
                $q->where('group', $array['group']);
            })
            ->when(isset($array['locale']), function ($q) use ($array) {
                $q->where('locale', $array['locale']);
            })
            ->when(isset($array['deleted_at']), function ($q) {
                $q->onlyTrashed();
            });
    }
}

<?php

namespace App\Models;

use Database\Factories\TransactionFactory;
use Eloquent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * App\Models\Transaction
 *
 * @property int $id
 * @property string $payable_type
 * @property int $payable_id
 * @property float $price
 * @property int|null $user_id
 * @property int|null $payment_sys_id
 * @property string|null $payment_trx_id
 * @property string|null $note
 * @property string|null $request
 * @property string|null $perform_time
 * @property string|null $refund_time
 * @property int|null $parent_id
 * @property string $status
 * @property string $type
 * @property string $status_description
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property string|null $deleted_at
 * @property-read Order|Wallet|null $payable
 * @property-read Payment|null $paymentSystem
 * @property-read PaymentProcess|null $paymentProcess
 * @property-read User|null $user
 * @property-read self|null $parent
 * @property-read Collection|self[] $children
 * @method static TransactionFactory factory(...$parameters)
 * @method static Builder|self filter($array = [])
 * @method static Builder|self newModelQuery()
 * @method static Builder|self newQuery()
 * @method static Builder|self query()
 * @method static Builder|self whereCreatedAt($value)
 * @method static Builder|self whereDeletedAt($value)
 * @method static Builder|self whereId($value)
 * @method static Builder|self whereNote($value)
 * @method static Builder|self wherePayableId($value)
 * @method static Builder|self wherePayableType($value)
 * @method static Builder|self wherePaymentSysId($value)
 * @method static Builder|self wherePaymentTrxId($value)
 * @method static Builder|self wherePerformTime($value)
 * @method static Builder|self wherePrice($value)
 * @method static Builder|self whereRefundTime($value)
 * @method static Builder|self whereStatus($value)
 * @method static Builder|self whereStatusDescription($value)
 * @method static Builder|self whereUpdatedAt($value)
 * @method static Builder|self whereUserId($value)
 * @mixin Eloquent
 */
class Transaction extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = ['id'];

    const STATUS_PROGRESS   = 'progress';
    const STATUS_SPLIT   	= 'split';
    const STATUS_PAID       = 'paid';
    const STATUS_CANCELED   = 'canceled';
    const STATUS_REJECTED   = 'rejected';
    const STATUS_REFUND     = 'refund';
    const STATUS_REPAY      = 're_pay';

    const STATUSES = [
        self::STATUS_PROGRESS   => self::STATUS_PROGRESS,
        self::STATUS_PAID       => self::STATUS_PAID,
        self::STATUS_CANCELED   => self::STATUS_CANCELED,
        self::STATUS_REJECTED   => self::STATUS_REJECTED,
        self::STATUS_REFUND     => self::STATUS_REFUND,
        self::STATUS_REPAY      => self::STATUS_REPAY,
    ];

    const REQUEST_WAITING = 'waiting';
    const REQUEST_PENDING = 'pending';
    const REQUEST_APPROVED = 'approved';
    const REQUEST_REJECT = 'reject';

    const REQUESTS = [
        self::REQUEST_WAITING,
        self::REQUEST_PENDING,
        self::REQUEST_APPROVED,
        self::REQUEST_REJECT,
    ];

    const TYPE_MODEL = 'model';
    const TYPE_TIP   = 'tip';

    const TYPES = [
        self::TYPE_MODEL => self::TYPE_MODEL,
        self::TYPE_TIP 	 => self::TYPE_TIP,
    ];

    public function payable(): MorphTo
    {
        return $this->morphTo('payable');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id');
    }

    public function paymentSystem(): BelongsTo
    {
        return $this->belongsTo(Payment::class, 'payment_sys_id');
    }

    public function paymentProcess(): BelongsTo
    {
        return $this->belongsTo(PaymentProcess::class, 'payment_trx_id');
    }

    public function scopeFilter($query, $filter = [])
    {
        return $query
            ->when(data_get($filter, 'model') == 'orders', function (Builder $query) {
                $query->where(['payable_type' => Order::class]);
            })
            ->when(data_get($filter, 'request'), function (Builder $query, $request) {
                $query->where('request', $request);
            })
            ->when(data_get($filter, 'shop_id'), function (Builder $q, $shopId) {

                $q->whereHasMorph('payable', Order::class, function (Builder $b) use ($shopId) {
                    $b->where('shop_id', $shopId);
                });

            })
            ->when(isset($filter['deleted_at']), fn($q) => $q->onlyTrashed())
            ->when(data_get($filter, 'model') == 'wallet', fn($q) => $q->where(['payable_type' => Wallet::class]))
            ->when(data_get($filter, 'user_id'), fn($q, $userId) => $q->where('user_id', $userId))
            ->when(data_get($filter, 'status'), fn($q, $status) => $q->where('status', $status));
    }
}

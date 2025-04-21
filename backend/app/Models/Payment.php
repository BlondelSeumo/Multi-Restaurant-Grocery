<?php

namespace App\Models;

use Database\Factories\PaymentFactory;
use Eloquent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * App\Models\Payment
 *
 * @property int $id
 * @property string|null $tag
 * @property int $input
 * @property int $sandbox
 * @property int $active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 * @property-read ShopPayment|null $shopPayment
 * @property-read PaymentPayload|null $paymentPayload
 * @method static PaymentFactory factory(...$parameters)
 * @method static Builder|Payment newModelQuery()
 * @method static Builder|Payment newQuery()
 * @method static Builder|Payment query()
 * @method static Builder|Payment whereActive($value)
 * @method static Builder|Payment whereCreatedAt($value)
 * @method static Builder|Payment whereId($value)
 * @method static Builder|Payment whereInput($value)
 * @method static Builder|Payment whereSandbox($value)
 * @method static Builder|Payment whereTag($value)
 * @method static Builder|Payment whereUpdatedAt($value)
 * @mixin Eloquent
 */
class Payment extends Model
{
    use HasFactory, SoftDeletes;

    const TAG_CASH         = 'cash';
    const TAG_WALLET       = 'wallet';
    const TAG_MERCADO_PAGO = 'mercado-pago';
    const TAG_STRIPE       = 'stripe';
    const TAG_MOYA_SAR     = 'moya-sar';
    const TAG_FLUTTER_WAVE = 'flutter-wave';
    const TAG_MOLLIE       = 'mollie';
    const TAG_PAY_PAL      = 'paypal';
    const TAG_PAY_STACK    = 'paystack';
    const TAG_PAY_TABS     = 'paytabs';
    const TAG_RAZOR_PAY    = 'razorpay';
    const TAG_ZAIN_CASH    = 'zain-cash';
    const TAG_IYZICO       = 'iyzico';
    const TAG_MAKSEKESKUS  = 'maksekeskus';
    const TAG_PAY_FAST     = 'pay-fast';


    protected $guarded = ['id'];

    public function shopPayment(): BelongsTo
    {
        return $this->belongsTo(ShopPayment::class,'id','payment_id');
    }

    public function paymentPayload(): HasOne
    {
        return $this->hasOne(PaymentPayload::class);
    }
}

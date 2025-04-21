<!DOCTYPE html>
<html lang="en">
<?php
/** @var App\Models\Order $order */
/** @var string $logo */
/** @var string $lang */

use App\Models\Order;
use App\Models\Transaction;
use App\Models\Translation;

$keys = [
    'order.summary',
    'order.number',
    'item.name',
    'quantity',
    'price',
    'title',
    'payment.method',
    'shop',
    'delivery.address',
    'delivery.time',
    'subtotal',
    'tax',
    'total.price',
    'order.status',
    'coupon',
    'discount',
    'tips',
    'delivery.fee',
    'order.status_change'
];

$paymentMethod = $order?->transaction?->paymentSystem?->tag;
$trxStatus = $order?->transaction?->status ?? Transaction::STATUS_PROGRESS;

if (!empty($paymentMethod)) {
    $keys[] = $paymentMethod;
}

if (!empty($trxStatus)) {
    $keys[] = $trxStatus;
}

$translations     = Translation::where('locale', $lang)->whereIn('key', $keys)->get();

$orderSummary     = $translations->where('key', 'order.summary')   ->first()?->value ?? 'order.summary';
$orderNumber      = $translations->where('key', 'order.number')    ->first()?->value ?? 'order.number';
$itemName         = $translations->where('key', 'item.name')       ->first()?->value ?? 'item.name';
$quantity         = $translations->where('key', 'quantity')        ->first()?->value ?? 'quantity';
$price            = $translations->where('key', 'price')           ->first()?->value ?? 'price';
$appName          = $translations->where('key', 'title')           ->first()?->value ?? env('APP_NAME');
$paymentTitle     = $translations->where('key', 'payment.method')  ->first()?->value ?? 'payment.method';
$shop             = $translations->where('key', 'shop')            ->first()?->value ?? 'shop';
$deliveryAddress  = $translations->where('key', 'delivery.address')->first()?->value ?? 'delivery.address';
$orderStatus      = $translations->where('key', 'order.status')    ->first()?->value ?? 'order.status';
$deliveryTitle    = $translations->where('key', 'delivery.time')   ->first()?->value ?? 'delivery.time';
$subtotal         = $translations->where('key', 'subtotal')        ->first()?->value ?? 'subtotal';
$taxTitle         = $translations->where('key', 'tax')             ->first()?->value ?? 'tax';
$totalTitle       = $translations->where('key', 'total.price')     ->first()?->value ?? 'total.price';
$paymentMethod    = $translations->where('key', $paymentMethod)    ->first()?->value ?? $paymentMethod;
$trxStatus        = $translations->where('key', $trxStatus)        ->first()?->value ?? $trxStatus;
$couponTitle      = $translations->where('key', 'coupon')          ->first()?->value ?? 'coupon';
$tipsTitle        = $translations->where('key', 'tips')            ->first()?->value ?? 'tips';
$discountTitle    = $translations->where('key', 'discount')        ->first()?->value ?? 'discount';
$emailTitle       = $translations->where('key', 'email.title')     ->first()?->value ?? 'email.title';
$deliveryFeeTitle = $translations->where('key', 'delivery.fee')    ->first()?->value ?? 'delivery.fee';

$userName        = $order->username ?? "{$order->user?->firstname} {$order->user?->lastname}";
$userPhone       = $order->phone ?? $order->user?->phone;
$position        = $order?->currency?->position;
$symbol          = $order?->currency?->symbol;
$status          = $order?->status;
$shopPhone       = $order->shop?->phone ?? $order->shop?->seller?->phone;
$shopTitle       = $order->shop?->translation?->title;
$shopAddress     = $order->shop?->translation?->address;
$deliveryTime    = date('m/d/Y', strtotime("$order->delivery_date $order->delivery_time"));
$createdAt       = date('m/d/Y', strtotime($order->created_at));
$address         = data_get($order, 'address.address', '');
if ($order->delivery_type !== Order::DELIVERY) {
    $address = $shopAddress;
}
?>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $emailTitle }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f8f8f8;
        }

        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #fff;
            padding: 20px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        .header {
            text-align: center;
        }

        .header img {
            width: 150px;
        }

        .content {
            padding: 20px;
        }

        .order-summary {
            margin-top: 20px;
        }

        .order-summary h3 {
            margin-top: 0;
            border-bottom: 1px solid #ccc;
            padding-bottom: 20px;
        }

        .order-details {
            width: 100%;
            border-collapse: collapse;
        }

        .order-details th, .order-details td {
            padding: 10px;
            border: 1px solid #ddd;
        }

        .order-details th {
            background-color: #f1f1f1;
        }

        .footer {
            text-align: center;
            margin-top: 20px;
        }

        .order-number {
            display: table;
        }

        .order-number-date {
            max-width: 300px;
            width: 300px;
            display: table-cell;
        }

        .order-number-phone {
            padding-left: 10px;
        }

        .blue-color {
            color: #065c94;
        }

        @media (max-width: 600px) {
            .container {
                margin: 10px;
                padding: 10px;
            }

            .order-details th, .order-details td {
                padding: 5px;
            }
        }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <img src="{{$logo}}" alt="{{$logo}}">
        <h2 class="blue-color">{{ $emailTitle }}</h2>
    </div>
    <div class="content">
        <div class="order-summary">
            <h3>{{ $orderSummary }}</h3>
            <strong>{{ $userName }}</strong>
            <div class="order-number">
                <div class="order-number-date">{{ $createdAt }}</div>
                <div class="order-number-phone">{{ $orderNumber }} #{{$order->id}}</div>
            </div>
            <p><strong>{{ $paymentTitle }}*</strong><br>{{ "$paymentMethod $trxStatus" }}</p>
            <div class="order-number">
                <div class="order-number-date"><strong>{{ $shop }}</strong><br> {{ "$shopTitle $shopAddress" }}</div>
                <div class="order-number-phone">{{ $shopPhone }}</div>
            </div>
            <p><strong>{{ $deliveryAddress }}</strong><br>{{ $address }}</p>
            <p><strong>{{ $orderStatus }}</strong><br>{{ $status }}</p>
            <p><strong>{{ $deliveryTitle }}</strong><br>{{ $deliveryTime }}</p>
            <table class="order-details">
                <thead>
                <tr>
                    <th>{{ $itemName }}</th>
                    <th>{{ $quantity }}</th>
                    <th>{{ $price }}</th>
                </tr>
                </thead>
                <tbody>
                    @foreach($order->orderDetails as $orderDetail)
                        @php
                            $addons = '';
                            $orderDetail->children?->transform(function ($i) use(&$addons, $order) {
                                $addons .= $i?->stock?->countable?->translation?->title . " x $i?->quantity {$order->currency?->symbol}$i?->rate_total_price, ";
                            });
                            $addons = substr($addons, 0, -2);

                            $extras = '';

                            foreach($orderDetail->stock->stockExtras ?? (object)[] as $extra) {

                                if(!$extra?->value) {
                                    continue;
                                }

                                $extras .= ',' . $extra?->value;
                            }

                        @endphp
                        <tr>
                            <td class="blue-color">{{ $orderDetail->stock?->countable?->translation?->title }}{{ $extras }}{{ $addons }}</td>
                            <td>{{ $orderDetail->quantity }}</td>
                            <td>
                                {{ $position === 'before' ? $symbol : '' }}
                                {{ number_format($orderDetail->rate_total_price, 2)  }}
                                {{ $position === 'after' ? $symbol : '' }}
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
            <p>
                <strong>
                {{ $subtotal }}:
                {{ $position === 'before' ? $symbol : '' }}
                {{ number_format($order->rate_total_price + $order->rate_total_discount - $order->rate_tax - $order->rate_delivery_fee + $order->coupon?->price, 2)  }}
                {{ $position === 'after' ? $symbol : '' }}
                </strong>
            </p>
            <p>
                <strong>
                {{ $taxTitle }}:
                {{ $position === 'before' ? $symbol : '' }}
                {{ number_format($order->rate_tax, 2)  }}
                {{ $position === 'after' ? $symbol : '' }}
                </strong>
            </p>
            <p>
                <strong>
                    {{ $deliveryFeeTitle }}:
                    {{ $position === 'before' ? $symbol : '' }}
                    {{ number_format($order->rate_delivery_fee, 2)  }}
                    {{ $position === 'after' ? $symbol : '' }}
                </strong>
            </p>
            @if($order->rate_tips)
            <p>
                <strong>
                    {{ $tipsTitle }}:
                    {{ $position === 'before' ? $symbol : '' }}
                    {{ number_format($order->rate_tips, 2)  }}
                    {{ $position === 'after' ? $symbol : '' }}
                </strong>
            </p>
            @endif
            @if($order?->coupon?->price)
            <p>
                <strong>
                    {{ $couponTitle }}:
                    {{ $position === 'before' ? $symbol : '' }}
                    <span style="color: red">{{ number_format($order?->coupon?->price, 2)  }}</span>
                    {{ $position === 'after' ? $symbol : '' }}
                </strong>
            </p>
            @endif
            @if($order->rate_total_discount)
            <p>
                <strong>
                    {{ $discountTitle }}:
                    {{ $position === 'before' ? $symbol : '' }}
                    <span style="color: red">- {{ number_format($order->rate_total_discount, 2)  }}</span>
                    {{ $position === 'after' ? $symbol : '' }}
                </strong>
            </p>
            @endif
            <p>
                <strong>
                {{ $totalTitle }}:
                {{ $position === 'before' ? $symbol : '' }}
                {{ number_format($order->rate_total_price, 2)  }}
                {{ $position === 'after' ? $symbol : '' }}
                </strong>
            </p>
        </div>
    </div>
    <div class="footer">
        <p>&copy; {{ date('Y') }} {{ $appName }}</p>
    </div>
</div>
</body>
</html>

<?php

namespace App\Services\PaymentService;

use App\Models\Order;
use App\Models\ParcelOrder;
use App\Models\Payment;
use App\Models\PaymentPayload;
use App\Models\PaymentProcess;
use App\Models\Payout;
use Exception;
use Illuminate\Database\Eloquent\Model;
use Log;
use MercadoPago\Config;
use MercadoPago\Item;
use MercadoPago\Preference;
use MercadoPago\SDK;
use Str;
use Throwable;

class MercadoPagoService extends BaseService
{
    protected function getModelClass(): string
    {
        return Payout::class;
    }

    /**
     * @param array $data
     * @return PaymentProcess|Model
     * @throws Throwable
     */
    public function orderProcessTransaction(array $data): Model|PaymentProcess
    {
        $payment        = Payment::where('tag', Payment::TAG_MERCADO_PAGO)->first();

        $paymentPayload = PaymentPayload::where('payment_id', $payment?->id)->first();
        $payload        = $paymentPayload?->payload;

        /** @var Order $order */
        $order = Order::find(data_get($data, 'order_id'));

        $totalPrice     = $order->rate_total_price;

        $host = request()->getSchemeAndHttpHost();
        $url  = "$host/order-mercado-pago-success?" . (
            data_get($data, 'parcel_id') ? "parcel_id=$order->id" : "order_id=$order->id"
            );

        $token = data_get($payload, 'token');

        SDK::setAccessToken($token);

        $sandbox = (bool)data_get($payload, 'sandbox', false);

        $config = new Config();
        $config->set('sandbox', $sandbox);
        $config->set('access_token', $token);

        $trxRef = Str::uuid();
        $item               = new Item;
        $item->id           = $trxRef;
        $item->title        = $order->id;
        $item->quantity     = $order->order_details_sum_quantity ?? 1;
        $item->unit_price   = $totalPrice ?? 1;

        $preference             = new Preference;
        $preference->items      = [$item];
        $preference->back_urls  = [
            'success' => $url,
            'failure' => $url,
            'pending' => $url
        ];

        $preference->auto_return = 'approved';

        $preference->save();

        $payment_link = $sandbox ? $preference->sandbox_init_point : $preference->init_point;

        if (!$payment_link) {
            throw new Exception('ERROR IN MERCADO PAGO');
        }

        Log::error('preference', [
            'id'   => $preference,
            'preference' => $preference->id,
            'preference_items' => $preference->items,
            'preference_init' => $preference->init_point
        ]);

        return PaymentProcess::updateOrCreate([
            'user_id'    => auth('sanctum')->id(),
            'model_id'   => $order->id,
            'model_type' => get_class($order)
        ], [
            'id'    => $trxRef,
            'data'  => [
                'url'   => $payment_link,
                'price' => $totalPrice,
            ]
        ]);
    }
}

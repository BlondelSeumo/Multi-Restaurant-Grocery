<?php

namespace App\Services\PaymentService;

use App\Models\Order;
use App\Models\Payment;
use App\Models\PaymentPayload;
use App\Models\PaymentProcess;
use App\Models\Payout;
use Exception;
use Illuminate\Database\Eloquent\Model;
use Maksekeskus\Maksekeskus;
use Str;
use Throwable;

class MaksekeskusService extends BaseService
{
    protected function getModelClass(): string
    {
        return Payout::class;
    }

    /**
     * @param array $data
     * @return PaymentProcess|Model
     * @throws Exception
     */
    public function orderProcessTransaction(array $data): Model|PaymentProcess
    {
        $payment        = Payment::where('tag', Payment::TAG_MAKSEKESKUS)->first();
        $paymentPayload = PaymentPayload::where('payment_id', $payment?->id)->first();
        $payload        = $paymentPayload->payload;
        $host           = request()->getSchemeAndHttpHost();

        $order          = Order::find(data_get($data, 'order_id'));
        $totalPrice     = ceil($order->rate_total_price * 2 * 100) / 2;

        $shopId         = $payload['shop_id'];
        $keyPublishable = $payload['key_publishable'];
        $keySecret      = $payload['key_secret'];

        $MK = new Maksekeskus($shopId, $keyPublishable, $keySecret, (bool)$payload['demo']);

        $email = auth('sanctum')->user()?->email;

        $body = [
            'transaction' => [
                'amount'        => $totalPrice,
                'currency'      => Str::lower($order->currency?->title),
                'id'            => "id: #$order->id",
                'reference'     => "reference: #$order->id",
                'merchant_data' => "merchant: #$order->id",
            ],
            'customer' => [
                'email'   => $email ?? Str::random(8) . '@gmail.com',
                'ip'      => request()->ip(),
                'country' => $payload['country'],
                'locale'  => $payload['country'],
            ],
            'app_info' => [
                'module'            => 'E-Commerce',
                'module_version'    => '1.0.1',
                'platform'          => 'Web',
                'platform_version'  => '2.0'
            ],
            'return_url' => "$host/payment-success?order_id=$order->id&lang=$this->language&status=success",
            'cancel_url' => "$host/payment-success?order_id=$order->id&lang=$this->language&status=canceled",
            'notification_url' => "$host/api/v1/webhook/maksekeskus/payment",
            'transaction_url' => [
                'return_url' => [
                    'url'    => "$host/payment-success?order_id=$order->id&lang=$this->language&status=success",
                    'method' => 'POST',
                ],
                'cancel_url' => [
                    'url'    => "$host/payment-success?order_id=$order->id&lang=$this->language&status=canceled",
                    'method' => 'POST',
                ],
                'notification_url' => [
                    'url'    => "$host/api/v1/webhook/maksekeskus/payment",
                    'method' => 'POST',
                ],
            ],
        ];

        try {
            $data = $MK->createTransaction($body);
        } catch (Throwable $e) {
            throw new Exception($e->getMessage());
        }

        return PaymentProcess::updateOrCreate([
            'user_id'    => auth('sanctum')->id(),
            'model_id'   => $order->id,
            'model_type' => get_class($order),
        ], [
            'id' => data_get($data, 'id'),
            'data' => [
                'methods'    => data_get($data, 'payment_methods.banklinks'),
                'payment_id' => $payment?->id,
                'price'      => $totalPrice
            ]
        ]);
    }
}

<?php

namespace App\Services\PaymentService;

use App\Models\Payment;
use App\Models\PaymentPayload;
use App\Models\PaymentProcess;
use App\Models\Payout;
use DB;
use Exception;
use Illuminate\Database\Eloquent\Model;
use Str;
use Stripe\Checkout\Session;
use Stripe\Exception\ApiErrorException;
use Stripe\PaymentIntent;
use Stripe\Stripe;
use Throwable;

class StripeService extends BaseService
{
    protected function getModelClass(): string
    {
        return Payout::class;
    }


    /**
     * @param array $data
     * @param array $types
     * @return array
     * @throws Exception
     */
    public function splitTransaction(array $data, array $types = ['card']): array
    {
        $payment = Payment::where('tag', Payment::TAG_STRIPE)->first();

        $paymentPayload = PaymentPayload::where('payment_id', $payment?->id)->first();
        $payload        = $paymentPayload?->payload;

        Stripe::setApiKey(data_get($payload, 'stripe_sk'));

        [$key, $before] = $this->getPayload($data, $payload);
        $modelId 		= data_get($before, 'model_id');

        $result = [];
        $split  = $data['split'] ?? 1;

        $totalPrice = round((float)$before['total_price'] * 100 / $split, 2);
        $before['total_price'] = $totalPrice;

        if ($before['total_price'] <= 0) {
            throw new Exception('The minimum amount must be greater than 1' . $before['currency']);
        }

        DB::table('payment_process')->where([
            'user_id'    => auth('sanctum')->id(),
            'model_id'   => $modelId,
            'model_type' => data_get($before, 'model_type')
        ])->delete();

        for ($i = 0; $split > $i; $i++) {

            $totalPrice = ceil($totalPrice);

            if (@$data['type'] === 'mobile') {
                $result[] = $this->mobile($data, $types, $before, $totalPrice, $modelId, $payment);
                continue;
            }

            $host = request()->getSchemeAndHttpHost();
            $url  = "$host/order-stripe-success?token={CHECKOUT_SESSION_ID}&$key=$modelId";

            $result[] = $this->web($data, $types, $before, $totalPrice, $modelId, $payment, $url);
        }

        return $result;
    }


    /**
     * @param array $data
     * @param array $types
     * @param array $before
     * @param float $totalPrice
     * @param int $modelId
     * @param Payment $payment
     * @return Model|PaymentProcess
     * @throws ApiErrorException
     */
    private function mobile(array $data, array $types, array $before, float $totalPrice, int $modelId, Payment $payment): Model|PaymentProcess
    {
        $session = PaymentIntent::create([
            'payment_method_types' => $types,
            'currency' => Str::lower(data_get($before, 'currency')),
            'amount' => $totalPrice,
        ]);

        $paymentProcess = PaymentProcess::create([
            'user_id'    => auth('sanctum')->id(),
            'model_id'   => $modelId,
            'model_type' => data_get($before, 'model_type'),
            'id' 		 => $session->id,
            'data' 		 => array_merge([
                'client_secret' => $session->client_secret,
                'price'         => $totalPrice,
                'type'          => 'mobile',
                'cart'			=> $data,
                'payment_id' 	=> $payment->id,
                'split'			=> $data['split'] ?? 1
            ], $before)
        ]);

        $paymentProcess->id = $session->id;

        return $paymentProcess;
    }

    /**
     * @param array $data
     * @param array $types
     * @param array $before
     * @param float $totalPrice
     * @param int $modelId
     * @param Payment $payment
     * @param string $url
     * @return Model|PaymentProcess
     * @throws ApiErrorException
     */
    private function web(array $data, array $types, array $before, float $totalPrice, int $modelId, Payment $payment, string $url): Model|PaymentProcess
    {
        $session = Session::create([
            'payment_method_types' => $types,
            'currency' => Str::lower(data_get($before, 'currency')),
            'line_items' => [
                [
                    'price_data' => [
                        'currency' => Str::lower(data_get($before, 'currency')),
                        'product_data' => [
                            'name' => 'Payment'
                        ],
                        'unit_amount' => $totalPrice,
                    ],
                    'quantity' => 1,
                ]
            ],
            'mode'        => 'payment',
            'success_url' => $url,
            'cancel_url'  => $url,
        ]);

        $paymentProcess = PaymentProcess::create([
            'user_id'    => auth('sanctum')->id(),
            'model_id'   => $modelId,
            'model_type' => data_get($before, 'model_type'),
            'id' 		 => $session->payment_intent ?? $session->id,
            'data' 		 => array_merge([
                'url'        => $session->url,
                'payment_id' => $payment->id,
                'split'		 => $data['split'] ?? 1
            ], $before)
        ]);

        $paymentProcess->id = $session->id;

        return $paymentProcess;
    }

    /**
     * @param array $data
     * @param array $types
     * @return PaymentProcess|Model
     * @throws Throwable
     */
    public function orderProcessTransaction(array $data, array $types = ['card']): Model|PaymentProcess
    {
        $payment = Payment::where('tag', Payment::TAG_STRIPE)->first();

        $paymentPayload = PaymentPayload::where('payment_id', $payment?->id)->first();
        $payload        = $paymentPayload?->payload;

        Stripe::setApiKey(data_get($payload, 'stripe_sk'));

        [$key, $before] = $this->getPayload($data, $payload);
        $modelId 		= data_get($before, 'model_id');

        $totalPrice = round((float)data_get($before, 'total_price') * 100, 2);

        DB::table('payment_process')->where([
            'user_id'    => auth('sanctum')->id(),
            'model_id'   => $modelId,
            'model_type' => data_get($before, 'model_type')
        ])->delete();

        if (@$data['type'] === 'mobile') {
            return $this->mobile($data, $types, $before, $totalPrice, $modelId, $payment);
        }

        $host = request()->getSchemeAndHttpHost();
        $url  = "$host/order-stripe-success?token={CHECKOUT_SESSION_ID}&$key=$modelId";

        return $this->web($data, $types, $before, $totalPrice, $modelId, $payment, $url);
    }


}

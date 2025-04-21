<?php

namespace App\Services\PaymentService;

use Str;
use Http;
use Exception;
use App\Models\Payment;
use App\Models\PaymentPayload;
use App\Models\PaymentProcess;
use Illuminate\Database\Eloquent\Model;

class MollieService extends BaseService
{
    protected function getModelClass(): string
    {
        return Payment::class;
    }

    /**
     * @param array $data
     * @return PaymentProcess|Model
     * @throws Exception
     */
    public function orderProcessTransaction(array $data): Model|PaymentProcess
    {
        $payment        = Payment::where('tag', Payment::TAG_MOLLIE)->first();
        $paymentPayload = PaymentPayload::where('payment_id', $payment?->id)->first();
        $payload        = $paymentPayload?->payload;

        $host = request()->getSchemeAndHttpHost();

        $token = base64_encode(data_get($payload, 'secret_key'));

        $headers = [
            'Authorization' => "Basic $token"
        ];

        [$key, $before] = $this->getPayload($data, $payload);
        $modelId 		= data_get($before, 'model_id');

        $totalPrice = ceil((float)data_get($before, 'total_price'));

        $url = "$host/order-stripe-success?$key=$modelId";
        $currency = Str::upper(data_get($before, 'currency'));

        $request = Http::withHeaders($headers)
            ->post('https://api.mollie.com/v2/payment-links', [
                'amount' => [
                    'value'    => "$totalPrice.00",
                    'currency' => $currency,
                ],
                'description' => "Payment for products",
                'redirectUrl' => $url,
                'reusable'    => false,
                'webhookUrl'  => "$host/api/v1/webhook/mollie/payment?$key=$modelId&lang=$this->language",
            ]);

        $response = $request->json();

        if (!in_array($request->status(), [200, 201])) {
            $message = data_get($response, 'title') . ': ' . data_get($response, 'detail');
            throw new Exception($message, $request->status());
        }

        return PaymentProcess::updateOrCreate([
            'user_id'    => auth('sanctum')->id(),
            'model_id'   => $modelId,
            'model_type' => data_get($before, 'model_type'),
        ], [
            'id' => data_get($response, 'id'),
            'data' => [
                'url'        => data_get($response, '_links.paymentLink.href'),
                'price'      => $totalPrice,
                'cart'	     => $data,
                'payment_id' => $payment->id,
            ]
        ]);

    }

}

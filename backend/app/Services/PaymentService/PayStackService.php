<?php
namespace App\Services\PaymentService;

use App\Models\Order;
use App\Models\Payment;
use App\Models\PaymentPayload;
use App\Models\PaymentProcess;
use App\Models\Payout;
use DB;
use Exception;
use Illuminate\Database\Eloquent\Model;
use Matscode\Paystack\Transaction;
use Str;
use Throwable;

class PayStackService extends BaseService
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
        $payment = Payment::where('tag', Payment::TAG_PAY_STACK)->first();

        $paymentPayload = PaymentPayload::where('payment_id', $payment?->id)->first();
        $payload        = $paymentPayload?->payload;

        $transaction    = new Transaction(data_get($payload, 'paystack_sk'));

        [$key, $before] = $this->getPayload($data, $payload);
        $modelId 		= data_get($before, 'model_id');

        $totalPrice = round((float)data_get($before, 'total_price') * 100, 2);

        $host = request()->getSchemeAndHttpHost();
        $url  = "$host/order-stripe-success?$key=$modelId";

        $body = [
            'email'    => auth('sanctum')->user()?->email,
            'amount'   => $totalPrice,
            'currency' => Str::upper(data_get($before, 'currency')),
        ];

        $response = $transaction->setCallbackUrl($url)->initialize($body);

        if (isset($response?->status) && !data_get($response, 'status')) {
            throw new Exception(data_get($response, 'message', 'PayStack server error'));
        }

        return PaymentProcess::updateOrCreate([
            'user_id'    => auth('sanctum')->id(),
            'model_id'   => $modelId,
            'model_type' => data_get($before, 'model_type')
        ], [
            'id' => data_get($response, 'reference'),
            'data' => [
                'url'   	 => data_get($response, 'authorizationUrl'),
                'price' 	 => $totalPrice,
                'cart'  	 => $data,
                'payment_id' => $payment->id,
            ]
        ]);
    }


    /**
     * @param array $data
     * @return array
     * @throws Throwable
     */
    public function splitTransaction(array $data): array
    {
        return DB::transaction(function () use ($data) {
            $payment = Payment::where('tag', Payment::TAG_PAY_STACK)->first();

            $paymentPayload = PaymentPayload::where('payment_id', $payment?->id)->first();
            $payload        = $paymentPayload?->payload;

            $transaction    = new Transaction(data_get($payload, 'paystack_sk'));

            [$key, $before] = $this->getPayload($data, $payload);
            $modelId 		= data_get($before, 'model_id');

            $result = [];
            $split  = $data['split'] ?? 1;

            $totalPrice = round((float)$before['total_price'] * 100 / $split, 2);

            $before['total_price'] = $totalPrice;

            if ($before['total_price'] <= 0) {
                throw new Exception('The minimum amount must be greater than 1' . $before['currency']);
            }

            $host = request()->getSchemeAndHttpHost();
            $url  = "$host/order-stripe-success?$key=$modelId";

            for ($i = 0; $split > $i; $i++) {

                $totalPrice = round($totalPrice, 2);

                $body = [
                    'email'    => auth('sanctum')->user()?->email,
                    'amount'   => $totalPrice,
                    'currency' => Str::upper(data_get($before, 'currency')),
                ];

                $response = $transaction->setCallbackUrl($url)->initialize($body);

                if (isset($response?->status) && !data_get($response, 'status')) {
                    throw new Exception(data_get($response, 'message', 'PayStack server error'));
                }

                $paymentProcess = PaymentProcess::create([
                    'user_id'    => auth('sanctum')->id(),
                    'model_id'   => $modelId,
                    'model_type' => data_get($before, 'model_type'),
                    'id' 		 => data_get($response, 'reference'),
                    'data' 		 => [
                        'url'   	 => data_get($response, 'authorizationUrl'),
                        'price' 	 => $totalPrice,
                        'cart'  	 => $data,
                        'payment_id' => $payment->id,
                    ]
                ]);

                $paymentProcess->id = data_get($response, 'reference');

                $result[] = $paymentProcess;

            }

            return $result;
        });
    }

}

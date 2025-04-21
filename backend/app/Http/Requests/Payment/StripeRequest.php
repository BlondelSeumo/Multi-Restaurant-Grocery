<?php

namespace App\Http\Requests\Payment;

use App\Http\Requests\BaseRequest;
use Illuminate\Validation\Rule;

class StripeRequest extends BaseRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules(): array
    {
        $userId = auth('sanctum')->id();

        return [
            'cart_id'   => [Rule::exists('carts',  'id')],
            'order_id'  => [
                Rule::exists('orders', 'id')
                    ->when(!empty($userId), fn($q) => $q->where('user_id', $userId))
            ],
            'tips' => 'numeric',
            'from_wallet_price' => 'numeric',
            'wallet_id' => [
                Rule::exists('wallets', 'id')->where('user_id', auth('sanctum')->id())
            ],
            'total_price' => [
                'numeric'
            ],
        ];
    }

}

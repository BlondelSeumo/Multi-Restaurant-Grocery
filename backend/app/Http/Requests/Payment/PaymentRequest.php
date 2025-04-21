<?php

namespace App\Http\Requests\Payment;

use App\Http\Requests\Order\StoreRequest;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PaymentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules(): array
    {
        $userId         = auth('sanctum')->id();

        $cartId         = request('cart_id');
        $walletId       = request('wallet_id');

        $rules = [];

        if ($cartId) {
            $rules = (new StoreRequest)->rules();
        }

        return [
            'cart_id' => [
                !$walletId ? 'required' : 'nullable',
                Rule::exists('carts', 'id')->where('owner_id', $userId)
            ],
            'wallet_id' => [
                !$cartId ? 'required' : 'nullable',
                Rule::exists('wallets', 'id')->where('user_id', auth('sanctum')->id())
            ],
        ]  + $rules;
    }
}

<?php

namespace App\Http\Requests\Payment;

use App\Http\Requests\BaseRequest;
use App\Models\Settings;
use Illuminate\Validation\Rule;

class SplitRequest extends BaseRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules(): array
    {
        $splitMin = Settings::where('key', 'split_min')->value('value') ?? 2;
        $splitMax = Settings::where('key', 'split_max')->value('value') ?? 10;

        return [
            'cart_id' 				=> [Rule::exists('carts',  'id')],
            'order_id' 				=> [Rule::exists('orders', 'id')],
            'after_payment_tips'	=> 'numeric',
            'split'    				=> ['int', "min:$splitMin", "max:$splitMax"],
        ];
    }
}

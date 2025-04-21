<?php

namespace App\Http\Requests\DeliveryManDeliveryZone;

use App\Http\Requests\BaseRequest;

class StoreRequest extends BaseRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules():array
    {
        return [
            'address'     => 'array|required',
            'address.*'   => 'array|required',
            'address.*.*' => 'numeric|required',
        ];
    }
}

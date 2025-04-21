<?php

namespace App\Http\Requests\Order;

use App\Http\Requests\BaseRequest;

class AddRepeatRequest extends BaseRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules(): array
    {
        return [
			'from' => 'required|date_format:Y-m-d',
			'to'   => 'required|date_format:Y-m-d',
        ];
    }
}

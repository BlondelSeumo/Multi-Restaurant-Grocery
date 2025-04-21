<?php

namespace App\Http\Requests\Inventory;

use App\Http\Requests\BaseRequest;
use Illuminate\Validation\Rule;

class StoreRequest extends BaseRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules(): array
    {
        return [
            'shop_id' => [
                Rule::exists('shops', 'id')->whereNull('deleted_at'),
            ],
			'latitude'  => 'required|numeric',
			'longitude' => 'required|numeric',
            'title'     => ['required', 'array'],
            'title.*'   => ['required', 'string', 'min:1', 'max:191'],
        ];
    }
}

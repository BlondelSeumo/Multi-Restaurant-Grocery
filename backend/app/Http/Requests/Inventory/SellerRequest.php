<?php

namespace App\Http\Requests\Inventory;

use App\Http\Requests\BaseRequest;

class SellerRequest extends BaseRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules(): array
    {
		$rules = (new StoreRequest)->rules();
		unset($rules['shop_id']);

        return $rules;
    }
}

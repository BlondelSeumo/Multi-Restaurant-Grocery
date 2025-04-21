<?php

namespace App\Http\Requests\InventoryItem;

use App\Helpers\GetShop;
use App\Http\Requests\BaseRequest;
use Illuminate\Validation\Rule;

class UpdateRequest extends BaseRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules(): array
    {
		$shopId = GetShop::shop()?->id;

		return [
			'inventory_id' => [
				'required',
				'int',
				Rule::exists('inventories', 'id')->whereNull('deleted_at')->when($shopId, fn($q) => $q->where('shop_id', $shopId))
			],
			'name' 			=> 'required|string|max:255',
			'bar_code' 		=> 'required|string|max:255',
			'quantity' 		=> 'required|numeric',
			'price' 		=> 'required|numeric',
			'interval' 		=> 'required|numeric',
			'unit_id' 		=> [
				'required',
				'int',
				Rule::exists('units', 'id')->whereNull('deleted_at')
			],
			'expired_at' 	=> 'required|date_format:Y-m-d',
			'images'     	=> ['required', 'array'],
			'images.*'   	=> ['required', 'string', 'min:1', 'max:191'],
        ];
    }
}

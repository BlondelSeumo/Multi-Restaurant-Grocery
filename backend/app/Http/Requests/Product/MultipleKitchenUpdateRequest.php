<?php

namespace App\Http\Requests\Product;

use App\Http\Requests\BaseRequest;
use Illuminate\Validation\Rule;

class MultipleKitchenUpdateRequest extends BaseRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules(): array
    {
        return [
            'category_ids'   => 'array',
            'category_ids.*' => ['int', Rule::exists('categories', 'id')],
            'kitchen_id'     => ['int', Rule::exists('kitchens', 'id')]
        ];
    }
}

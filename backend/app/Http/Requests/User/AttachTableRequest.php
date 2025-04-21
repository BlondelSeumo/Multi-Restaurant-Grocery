<?php

namespace App\Http\Requests\User;

use App\Http\Requests\BaseRequest;
use Illuminate\Validation\Rule;

class AttachTableRequest extends BaseRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules(): array
    {
        return [
            'table_ids' => 'required|array',
            'table_ids.*' => [
                'required',
                'integer',
                Rule::exists('tables', 'id')->where('active', true)],
            'shop_id' => [
                'integer',
                Rule::exists('shops', 'id')
            ]
        ];
    }
}

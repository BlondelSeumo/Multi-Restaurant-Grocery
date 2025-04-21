<?php

namespace App\Http\Requests\Kitchen;

use App\Http\Requests\BaseRequest;

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
            'active'        => 'required|boolean',
            'title'         => 'required|array',
            'title.*'       => 'required|string|min:2|max:191',
            'description'   => 'array',
            'description.*' => 'string',
        ];
    }
}

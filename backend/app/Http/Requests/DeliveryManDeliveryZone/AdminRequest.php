<?php

namespace App\Http\Requests\DeliveryManDeliveryZone;

use App\Http\Requests\BaseRequest;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminRequest extends BaseRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules(): array
    {
        return (new StoreRequest)->rules() + [
                'user_id' => [
                    'required',
                    Rule::exists('users', 'id')->whereNull('deleted_at')
                ],
            ];
    }
}

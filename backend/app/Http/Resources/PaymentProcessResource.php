<?php

namespace App\Http\Resources;

use App\Models\PaymentProcess;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentProcessResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  Request  $request
     * @return array
     */
    public function toArray($request): array
    {
        /** @var PaymentProcess|JsonResource $this */
        return [
            'id'		 => $this->when($this->id, 			$this->id),
            'data'		 => $this->when($this->data, 		$this->data),
            'model_type' => $this->when($this->model_type, 	$this->model_type),
            'model_id'	 => $this->when($this->model_id, 	$this->model_id),
            'user_id'	 => $this->when($this->user_id, 	$this->user_id),
            'clicked'	 => $this->data['clicked'] ?? false,

            // Relations
            'user' => UserResource::make($this->whenLoaded('user')),
        ];
    }
}

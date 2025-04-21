<?php

namespace App\Http\Resources;

use App\Models\DeliveryManDeliveryZone;
use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DeliveryManDeliveryZoneResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  Request  $request
     * @return array|Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
        /** @var DeliveryManDeliveryZone|JsonResource $this */
        return $this->address ?? [];
    }
}

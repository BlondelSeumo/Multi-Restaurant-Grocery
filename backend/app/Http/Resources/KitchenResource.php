<?php

namespace App\Http\Resources;

use App\Models\Kitchen;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class KitchenResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  Request  $request
     * @return array
     */
    public function toArray($request): array
    {
        /** @var Kitchen|JsonResource $this */
        return [
            'id'      => $this->when($this->id, $this->id),
            'active'  => $this->when($this->active, $this->active),
            'shop_id' => $this->when($this->shop_id, $this->shop_id),

            // Relations
            'shop'         => ShopResource::make($this->whenLoaded('shop')),
            'translation'  => TranslationResource::make($this->whenLoaded('translation')),
            'translations' => TranslationResource::collection($this->whenLoaded('translations')),
        ];
    }
}

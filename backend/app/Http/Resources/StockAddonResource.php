<?php

namespace App\Http\Resources;

use App\Models\StockAddon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StockAddonResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  Request  $request
     * @return array
     */
    public function toArray($request): array
    {
        /** @var StockAddon|JsonResource $this */
        return [
            'id'        => $this->id,
            'stock_id'  => $this->when($this->addon, $this->addon?->stock?->id),
            'addon_id'  => $this->when($this->addon_id, $this->addon_id),
//            'addon_stock_id' => $this->when($this->addon, $this->addon?->stock?->id),
            'stock'     => StockResource::make($this->whenLoaded('stock')),
            'product'   => ProductResource::make($this->whenLoaded('addon')),
        ];
    }
}

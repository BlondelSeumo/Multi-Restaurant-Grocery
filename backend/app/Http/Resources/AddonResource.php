<?php

namespace App\Http\Resources;

use App\Models\StockAddon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AddonResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param Request $request
     * @return array
     */
    public function toArray($request): array
    {
        /** @var StockAddon|JsonResource $this */

        return [
            'id'       => $this->id,
            'stock_id' => $this->stock_id,
            'addon_id' => $this->addon_id,
            'addon'    => StockResource::make($this->whenLoaded('addon')),
        ];
    }

}

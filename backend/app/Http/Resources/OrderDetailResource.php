<?php

namespace App\Http\Resources;

use App\Models\OrderDetail;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderDetailResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  Request  $request
     * @return array
     */
    public function toArray($request): array
    {
        /** @var OrderDetail|JsonResource $this */

        if (empty($this?->id)) {
            return [];
        }

        return [
            'id'            => $this->when($this->id, $this->id),
            'order_id'      => $this->when($this->order_id, $this->order_id),
            'stock_id'      => $this->when($this->stock_id, $this->stock_id),
            'kitchen_id'    => $this->when($this->kitchen_id, $this->kitchen_id),
            'cook_id'       => $this->when($this->cook_id, $this->cook_id),
            'note'          => $this->when($this->note, $this->note),
            'origin_price'  => $this->when($this->rate_origin_price, $this->rate_origin_price),
            'total_price'   => $this->when($this->rate_total_price, $this->rate_total_price),
            'tax'           => $this->when($this->rate_tax, $this->rate_tax),
            'discount'      => $this->when($this->rate_discount, $this->rate_discount),
            'quantity'      => $this->when($this->quantity, $this->quantity),
            'bonus'         => (bool)$this->bonus,
            'status'        => $this->when($this->status, $this->status),
            'created_at'    => $this->when($this->created_at, $this->created_at?->format('Y-m-d H:i:s') . 'Z'),
            'updated_at'    => $this->when($this->updated_at, $this->updated_at?->format('Y-m-d H:i:s') . 'Z'),

            // Relations
            'kitchen'       => KitchenResource::make($this->whenLoaded('kitchen')),
            'cooker'        => UserResource::make($this->whenLoaded('cooker')),
            'stock'         => OrderStockResource::make($this->whenLoaded('stock')),
            'parent'        => OrderDetailResource::make($this->whenLoaded('parent')),
            'addons'        => OrderDetailResource::collection($this->whenLoaded('children')),
        ];
    }
}

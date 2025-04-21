<?php

namespace App\Http\Resources;

use App\Models\InventoryItem;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InventoryItemResource extends JsonResource
{
	/**
	 * Transform the resource into an array.
	 *
	 * @param  Request  $request
	 * @return array
	 */
	public function toArray($request): array
	{
		/** @var InventoryItem|JsonResource $this */

		return [
			'id'            => $this->when($this->id, 			$this->id),
			'inventory_id'	=> $this->when($this->inventory_id, $this->inventory_id),
			'name'			=> $this->when($this->name, 		$this->name),
			'quantity'		=> $this->when($this->quantity, 	$this->quantity),
			'price'			=> $this->when($this->price, 		$this->price),
			'bar_code'		=> $this->when($this->bar_code, 	$this->bar_code),
			'unit_id'		=> $this->when($this->unit_id, 		$this->unit_id),
			'interval'		=> $this->when($this->interval, 	$this->interval),
			'expired_at'	=> $this->when($this->expired_at, 	$this->expired_at),
			'created_at'    => $this->when($this->created_at, 	$this->created_at?->format('Y-m-d H:i:s') . 'Z'),
			'updated_at'    => $this->when($this->updated_at, 	$this->updated_at?->format('Y-m-d H:i:s') . 'Z'),
			'deleted_at'    => $this->when($this->deleted_at, 	$this->deleted_at?->format('Y-m-d H:i:s') . 'Z'),

			/*Relations*/
			'galleries'     => GalleryResource::collection($this->whenLoaded('galleries')),
			'inventory' 	=> InventoryResource::make($this->whenLoaded('inventory')),
			'unit'			=> UnitResource::make($this->whenLoaded('unit')),
		];
	}
}

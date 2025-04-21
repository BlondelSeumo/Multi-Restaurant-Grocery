<?php

namespace App\Http\Resources;

use App\Models\Inventory;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InventoryResource extends JsonResource
{
	/**
	 * Transform the resource into an array.
	 *
	 * @param  Request $request
	 * @return array
	 */
	public function toArray($request): array
	{
		/** @var Inventory|JsonResource $this */
		$locales = $this->relationLoaded('translations') ?
			$this->translations->pluck('locale')->toArray() : null;

		return [
			'id'            => $this->when($this->id, 			$this->id),
			'shop_id'		=> $this->when($this->shop_id, 		$this->shop_id),
			'latitude'		=> $this->when($this->latitude, 	$this->latitude),
			'longitude'		=> $this->when($this->longitude,	$this->longitude),
			'created_at'    => $this->when($this->created_at, 	$this->created_at?->format('Y-m-d H:i:s') . 'Z'),
			'updated_at'    => $this->when($this->updated_at, 	$this->updated_at?->format('Y-m-d H:i:s') . 'Z'),
			'deleted_at'    => $this->when($this->deleted_at, 	$this->deleted_at?->format('Y-m-d H:i:s') . 'Z'),

			/*Relations*/
			'galleries' 	=> GalleryResource::collection($this->whenLoaded('galleries')),
			'translation'   => TranslationResource::make($this->whenLoaded('translation')),
			'translations'  => TranslationResource::collection($this->whenLoaded('translations')),
			'locales'       => $this->when($locales, $locales),
			'shop' 			=> ShopResource::make($this->whenLoaded('shop')),
			'items'			=> InventoryItemResource::collection($this->whenLoaded('inventoryItems')),
		];
	}
}

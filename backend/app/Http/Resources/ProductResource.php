<?php

namespace App\Http\Resources;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param Request $request
     * @return array
     */
    public function toArray($request): array
    {
        /** @var Product|JsonResource $this */

        $locales = $this->relationLoaded('translations') ?
            $this->translations->pluck('locale')->toArray() : null;

        return [
            'id'                    => $this->when($this->id, $this->id),
            'uuid'                  => $this->when($this->uuid, $this->uuid),
            'shop_id'               => $this->when($this->shop_id, $this->shop_id),
            'parent_id'             => $this->when($this->parent_id, $this->parent_id),
            'category_id'           => $this->when($this->category_id, $this->category_id),
            'keywords'              => $this->when($this->keywords, $this->keywords),
            'brand_id'              => $this->when($this->brand_id, $this->brand_id),
            'tax'                   => $this->when($this->tax, $this->tax),
            'qr_code'               => $this->when($this->qr_code, $this->qr_code),
            'status'                => $this->when($this->status, $this->status),
            'status_note'           => $this->when($this->status_note, $this->status_note),
            'active'                => (bool) $this->active,
            'addon'                 => (bool) $this->addon,
            'visibility'            => (bool) $this->visibility,
            'vegetarian'            => (bool) $this->vegetarian,
            'img'                   => $this->when($this->img, $this->img),
            'interval'              => $this->when($this->interval, $this->interval),
            'kitchen_id'            => $this->when($this->kitchen_id, 	$this->kitchen_id),
            'stocks_count'          => $this->when($this->stocks_count, $this->stocks_count, 0),
            'kcal'                  => $this->when($this->kcal, $this->kcal),
            'carbs'                 => $this->when($this->carbs, $this->carbs),
            'protein'               => $this->when($this->protein, $this->protein),
            'fats'                  => $this->when($this->fats, $this->fats),
            'min_qty'               => $this->when($this->min_qty, $this->min_qty),
            'max_qty'               => $this->when($this->max_qty, $this->max_qty),
            'created_at'            => $this->when($this->created_at, $this->created_at?->format('Y-m-d H:i:s') . 'Z'),
            'updated_at'            => $this->when($this->updated_at, $this->updated_at?->format('Y-m-d H:i:s') . 'Z'),
            'deleted_at'            => $this->when($this->deleted_at, $this->deleted_at?->format('Y-m-d H:i:s') . 'Z'),
            'order_details_count'   => $this->when($this->order_details_count, $this->order_details_count),
            'reviews_count'         => $this->whenLoaded('reviews', $this->reviews_count),
            'rating_percent'        => $this->whenLoaded('reviews', $this->reviews->avg('rating')),

            // Relations
            'discounts'             => SimpleDiscountResource::collection($this->whenLoaded('discounts')),
            'translation'           => TranslationResource::make($this->whenLoaded('translation')),
            'translations'          => TranslationResource::collection($this->whenLoaded('translations')),
            'locales'               => $this->when($locales, $locales),
            'kitchen'               => KitchenResource::make($this->whenLoaded('kitchen')),
            'properties'            => ProductPropertyResource::collection($this->whenLoaded('properties')),
            'stocks'                => SimpleStockResource::collection($this->whenLoaded('stocks')),
            'stock'                 => SimpleStockResource::make($this->whenLoaded('stock')),
            'stories'               => SimpleStoryResource::collection($this->whenLoaded('stories')),
            'shop'                  => ShopResource::make($this->whenLoaded('shop')),
            'category'              => CategoryResource::make($this->whenLoaded('category')),
            'brand'                 => BrandResource::make($this->whenLoaded('brand')),
            'unit'                  => UnitResource::make($this->whenLoaded('unit')),
            'reviews'               => ReviewResource::collection($this->whenLoaded('reviews')),
            'galleries'             => GalleryResource::collection($this->whenLoaded('galleries')),
            'extras'                => ExtraGroupResource::collection($this->whenLoaded('extras')),
            'tags'                  => TagResource::collection($this->whenLoaded('tags')),
            'meta_tags'             => MetaTagResource::collection($this->whenLoaded('metaTags')),
            'addons'                => AddonResource::collection($this->whenLoaded('addons')),
        ];
    }

}

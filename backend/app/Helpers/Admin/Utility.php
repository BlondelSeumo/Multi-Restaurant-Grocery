<?php

namespace App\Helpers\Admin;

use App\Helpers\ResponseError;
use App\Http\Resources\ProductResource;
use App\Http\Resources\StockResource;
use App\Models\Product;
use App\Models\PushNotification;
use App\Models\Settings;
use App\Models\Stock;
use App\Models\StockInventoryItem;
use App\Models\Translation;
use App\Models\User;
use App\Traits\Notification;
use Illuminate\Support\Collection;

class Utility
{
	use Notification;

	public static function calculateInventory(Stock $stock): void
	{
		$seller = $stock->product?->shop?->seller;
		$inventoryTitle = Translation::where('key', 'inventory')->value('value');

		self::decrementFromInventory($stock, $stock->inventoryItems, $seller, $inventoryTitle);
		self::decrementFromInventory($stock->product, $stock->product->inventoryItems, $seller, $inventoryTitle);
	}

	/**
	 * @param Stock|Product $model
	 * @param Collection|null $modelInventoryItems
	 * @param User $seller
	 * @param string|null $inventoryTitle
	 * @return void
	 */
	private static function decrementFromInventory(
		Stock|Product $model,
		Collection|null $modelInventoryItems,
		User $seller,
		?string $inventoryTitle
	): void
	{
		/** @var StockInventoryItem[] $modelInventoryItems *///ProductInventoryItem[]
		foreach ($modelInventoryItems as $modelInventoryItem) {

			$inventoryItem = $modelInventoryItem->inventoryItem;

			$decrement = $modelInventoryItem->interval / $inventoryItem->interval;

			if ($inventoryItem->interval > $modelInventoryItem->interval) {
				$decrement = $inventoryItem->interval / $modelInventoryItem->interval;
			}

			$quantity  = $inventoryItem->quantity - $decrement;
			$inventory = $inventoryItem->inventory;

			$inventoryItem->update(['quantity' => $quantity]);

			$title = "$inventoryTitle {$inventory->translation->title}: $inventoryItem->name";
			$littleStock = Settings::where('key', 'little_stock')->value('value');

			if ($littleStock > 0 && $littleStock <= $quantity) {

				$message = __(
					'errors.' . ResponseError::OUT_OF_STOCK,
					['inventory_item' => $title, 'quantity' => $littleStock],
					request('lang', 'en')
				);

				(new self)->sendNotification(
					array_values(array_unique($seller->firebase_token)),
					$message,
					$model->id,
					[
						'id'     => $model->id,
						'status' => 'status',
						'type'   => PushNotification::OUT_OF_STOCK
					],
					[$seller->id],
					$message,
				);

			}

			if ($quantity > 0) {
				continue;
			}

			$message = __(
				'errors.' . ResponseError::OUT_OF_STOCK,
				['inventory_item' => $title],
				request('lang', 'en')
			);

			(new self)->sendNotification(
				array_values(array_unique($seller->firebase_token)),
				$message,
				$model->id,
				[
					'id'     => $model->id,
					'status' => 'status',
					'type'   => PushNotification::OUT_OF_STOCK
				],
				[$seller->id],
				$message,
			);

		}

	}

	/**
	 * @param Stock|StockResource|Product|ProductResource $model
	 * @return float|int
	 */
	public static function calculateCostPrice(Stock|StockResource|Product|ProductResource $model): float|int
	{
		$costPrice = 0;

		foreach ($model->inventoryItems as $inventoryItem) {

			if (!$inventoryItem->inventoryItem)	{
				continue;
			}

			$interval = $inventoryItem->inventoryItem->interval / $inventoryItem->interval;

			if ($inventoryItem->interval > $inventoryItem->inventoryItem->interval) {
				$interval = $inventoryItem->interval / $inventoryItem->inventoryItem->interval;
			}

			$price = (get_class($model) === Stock::class ? $model->price : $model->stocks?->first()?->price);

			$costPrice = $price / $interval;
		}

		return $costPrice;
	}
}

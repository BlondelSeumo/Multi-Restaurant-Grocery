<?php

namespace App\Services\OrderService;

use App\Helpers\ResponseError;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Product;
use App\Models\Stock;
use App\Models\User;
use App\Models\UserCart;
use App\Services\CartService\CartService;
use App\Services\CoreService;
use Throwable;

class OrderDetailService extends CoreService
{
    /**
     * @return string
     */
    protected function getModelClass(): string
    {
        return OrderDetail::class;
    }

    public function create(Order $order, array $collection, ?array $notes = []): Order
    {

        if (empty($order->table_id)) {
            foreach ($order->orderDetails as $orderDetail) {

                $orderDetail?->stock?->increment('quantity', $orderDetail?->quantity);

                $orderDetail?->forceDelete();

            }
        }

        return $this->update($order, $collection, $notes);
    }

    public function update(Order $order, $collection, $notes): Order
    {
        foreach ($collection as $item) {

            /** @var Stock $stock */
            $stock = Stock::with([
                'countable:id,status,shop_id,active,min_qty,max_qty,tax,img,interval',
                'countable.discounts' => fn($q) => $q
                    ->where('start', '<=', today())
                    ->where('end', '>=', today())
                    ->where('active', 1)
            ])
                ->find(data_get($item, 'stock_id'));

            if (!$stock?->countable?->active || $stock?->countable?->status != Product::PUBLISHED) {
                continue;
            }

            $actualQuantity = $this->actualQuantity($stock, data_get($item, 'quantity', 0));

            if (empty($actualQuantity) || $actualQuantity <= 0) {
                continue;
            }

            data_set($item, 'quantity', $actualQuantity);
            data_set($item, 'note', data_get($notes, $stock->id, ''));

            $addons = (array)data_get($item, 'addons', []);

            /** @var OrderDetail $orderDetail */
            $orderDetail = $order->orderDetails()->create($this->setItemParams($item, $stock));

            $stock->decrement('quantity', $actualQuantity);

            foreach ($addons as $addon) {

                /** @var Stock $addonStock */
                $addonStock = Stock::with([
                    'countable:id,status,shop_id,active,min_qty,max_qty,tax,img,interval',
                    'countable.discounts' => fn($q) => $q
                        ->where('start', '<=', today())
                        ->where('end', '>=', today())
                        ->where('active', 1)
                ])
                    ->find(data_get($addon, 'stock_id'));

                if (!$addonStock) {
                    continue;
                }

                $actualQuantity = $this->actualQuantity($addonStock, data_get($addon, 'quantity', 0));

                if (empty($actualQuantity) || $actualQuantity <= 0) {
                    continue;
                }

                $addon['quantity']  = $actualQuantity;
                $addon['parent_id'] = $orderDetail->id;

                $order->orderDetails()->create($this->setItemParams($addon, $addonStock));

                $addonStock->decrement('quantity', $actualQuantity);

//                Utility::calculateInventory($addonStock);
            }

//            Utility::calculateInventory($stock);

        }

        return $order;
    }

    public function createOrderUser(Order $order, int $cartId, ?array $notes = []): Order
    {
        /** @var Cart $cart */
        $cart = clone Cart::with([
            'userCarts.cartDetails:id,user_cart_id,stock_id,price,discount,quantity',
            'userCarts.cartDetails.stock.bonus' => fn($q) => $q->where('expired_at', '>', now()),
            'shop',
            'shop.bonus' => fn($q) => $q->where('expired_at', '>', now()),
        ])
            ->select('id', 'total_price', 'shop_id')
            ->find($cartId);

        (new CartService)->calculateTotalPrice($cart);

        $cart = clone Cart::with([
            'shop',
            'userCarts.cartDetails' => fn($q) => $q->whereNull('parent_id'),
            'userCarts.cartDetails.stock.countable',
            'userCarts.cartDetails.children.stock.countable',
        ])->find($cart->id);

        if (empty($cart?->userCarts)) {
            return $order;
        }

        foreach ($cart->userCarts as $userCart) {

            $cartDetails = $userCart->cartDetails;

            if (empty($cartDetails)) {
                $userCart->delete();
                continue;
            }

            foreach ($cartDetails as $cartDetail) {

                /** @var UserCart $userCart */
                $stock = $cartDetail->stock;

                $cartDetail->setAttribute('note', data_get($notes, $stock->id, ''));

                /** @var OrderDetail $parent */
                $parent = $order->orderDetails()->create($this->setItemParams($cartDetail, $stock));

                $stock->decrement('quantity', $cartDetail->quantity);

                foreach ($cartDetail->children as $addon) {

                    $stock = $addon->stock;

                    $addon->setAttribute('parent_id', $parent?->id);

                    $addon->setAttribute('note', data_get($notes, $stock->id, ''));
                    $order->orderDetails()->create($this->setItemParams($addon, $stock));

                    $stock->decrement('quantity', $addon->quantity);
                }

            }

        }

        $cart->delete();

        return $order;

    }

    private function setItemParams($item, ?Stock $stock): array
    {

        $quantity  = data_get($item, 'quantity', 0);
        $kitchenId = 0;

        if (data_get($item, 'bonus')) {

            data_set($item, 'origin_price', 0);
            data_set($item, 'total_price', 0);
            data_set($item, 'tax', 0);
            data_set($item, 'discount', 0);

        } else {

            $originPrice = $stock?->price * $quantity;

            $discount    = $stock?->actual_discount * $quantity;

            $tax         = $stock?->tax_price * $quantity;

            $totalPrice  = $originPrice - $discount + $tax;

            data_set($item, 'origin_price', $originPrice);
            data_set($item, 'total_price', max($totalPrice,0));
            data_set($item, 'tax', $tax);
            data_set($item, 'discount', $discount);
        }

        if (!$stock->addon) {
            $kitchenId = $stock->countable?->kitchen_id;
        }

        return [
            'note'         => data_get($item, 'note', 0),
            'origin_price' => data_get($item, 'origin_price', 0),
            'tax'          => data_get($item, 'tax', 0),
            'discount'     => data_get($item, 'discount', 0),
            'total_price'  => data_get($item, 'total_price', 0),
            'stock_id'     => data_get($item, 'stock_id'),
            'parent_id'    => data_get($item, 'parent_id'),
            'quantity'     => $quantity,
            'bonus'        => data_get($item, 'bonus', false),
            'kitchen_id'   => $kitchenId
        ];
    }

    /**
     * @param Stock|null $stock
     * @param $quantity
     * @return mixed
     */
    private function actualQuantity(?Stock $stock, $quantity): mixed
    {

        $countable = $stock?->countable;

        if ($quantity < ($countable?->min_qty ?? 0)) {

            $quantity = $countable?->min_qty;

        } else if($quantity > ($countable?->max_qty ?? 0)) {

            $quantity = $countable?->max_qty;

        }

        return $quantity > $stock->quantity ? max($stock->quantity, 0) : $quantity;
    }

    /**
     * @param int $orderId
     * @param int $cookId
     * @param int|null $shopId
     * @return array
     */
    public function updateCook(int $orderId, int $cookId, int|null $shopId = null): array
    {
        try {
            /** @var User $cook */

            $cook = User::with(['roles'])
                ->when($shopId, fn($q) => $q->whereHas('invitations', fn($q) => $q->where('shop_id', $shopId)))
                ->find($cookId);

            $orderDetail = OrderDetail::when($shopId, fn($q) => $q->whereHas('order', fn($b) => $b->where('shop_id',$shopId)))
                ->find($orderId);

            if ($cook?->kitchen_id !== $orderDetail?->kitchen_id) {
                return [
                    'status'  => false,
                    'code'    => ResponseError::ERROR_511,
                    'message' => __('errors.' . ResponseError::ERROR_511, locale: $this->language)
                ];
            }

            if (!$orderDetail) {
                return [
                    'status'  => false,
                    'code'    => ResponseError::ERROR_404,
                    'message' => __('errors.' . ResponseError::ERROR_404, locale: $this->language)
                ];
            }

//            if ($orderDetail->order?->delivery_type !== Order::DINE_IN) {
//                return [
//                    'status'  => false,
//                    'code'    => ResponseError::ERROR_502,
//                    'message' => __('errors.' . ResponseError::ORDER_PICKUP, locale: $this->language)
//                ];
//            }

            if (!$cook || !$cook->hasRole('cook')) {
                return [
                    'status'  => false,
                    'code'    => ResponseError::ERROR_211,
                    'message' => __('errors.' . ResponseError::ERROR_211, locale: $this->language)
                ];
            }

            if (!$cook->invitations?->where('shop_id', $orderDetail->order?->shop_id)?->first()?->id) {
                return [
                    'status'  => false,
                    'code'    => ResponseError::ERROR_212,
                    'message' => __('errors.' . ResponseError::ERROR_212, locale: $this->language)
                ];
            }

            $orderDetail->update([
                'cook_id' => $cook->id,
            ]);

            return ['status' => true, 'message' => ResponseError::NO_ERROR, 'data' => $orderDetail];
        } catch (Throwable) {
            return [
                'status'  => false,
                'code'    => ResponseError::ERROR_502,
                'message' => __('errors.' . ResponseError::ERROR_502, locale: $this->language)
            ];
        }
    }

    /**
     * @param int|null $id
     * @return array
     */
    public function attachCook(?int $id): array
    {
        try {
            /** @var OrderDetail $orderDetail */
            $orderDetail = OrderDetail::with('user')->find($id);

//            if ($orderDetail?->order?->delivery_type !== Order::DINE_IN) {
//                return [
//                    'status'  => false,
//                    'code'    => ResponseError::ERROR_502,
//                    'message' => __('errors.' . ResponseError::ORDER_PICKUP, locale: $this->language)
//                ];
//            }

            if (!empty($orderDetail->cook_id)) {
                return [
                    'status'  => false,
                    'code'    => ResponseError::COOKER_NOT_EMPTY,
                    'message' => __('errors.' . ResponseError::COOKER_NOT_EMPTY, locale: $this->language)
                ];
            }

            /** @var User $user */
            $user = auth('sanctum')->user();

            if (!$user?->invitations?->where('shop_id', $orderDetail?->order?->shop_id)?->first()?->id) {
                return [
                    'status'  => false,
                    'code'    => ResponseError::ERROR_212,
                    'message' => __('errors.' . ResponseError::ERROR_212, locale: $this->language)
                ];
            }

            $orderDetail->update([
                'cook_id' => auth('sanctum')->id(),
            ]);

            return ['status' => true, 'message' => ResponseError::NO_ERROR, 'data' => $orderDetail];
        } catch (Throwable) {
            return [
                'status'  => false,
                'code'    => ResponseError::ERROR_502,
                'message' => __('errors.' . ResponseError::ERROR_502, locale: $this->language)
            ];
        }
    }

    public function statusUpdate(OrderDetail $orderDetail, ?string $status): array
    {
        if ($orderDetail->status == $status) {
            return [
                'status'  => false,
                'code'    => ResponseError::ERROR_252,
                'message' => __('errors.' . ResponseError::ERROR_252, locale: $this->language)
            ];
        }

        $orderDetail->update([
            'status' => $status
        ]);

        $orderDetail->children()->update([
            'status' => $status
        ]);

        return ['status' => true, 'message' => ResponseError::NO_ERROR, 'data' => $orderDetail];
    }

}

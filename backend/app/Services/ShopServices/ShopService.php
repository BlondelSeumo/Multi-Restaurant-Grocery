<?php

namespace App\Services\ShopServices;

use App\Helpers\FileHelper;
use App\Helpers\ResponseError;
use App\Models\Shop;
use App\Services\CoreService;
use App\Services\Interfaces\ShopServiceInterface;
use App\Services\ShopCategoryService\ShopCategoryService;
use App\Traits\SetTranslations;
use DB;
use Exception;
use Illuminate\Support\Facades\Cache;
use Throwable;

class ShopService extends CoreService implements ShopServiceInterface
{
    use SetTranslations;

    protected function getModelClass(): string
    {
        return Shop::class;
    }

    /**
     * Create a new Shop model.
     * @param array $data
     * @return array
     */
    public function create(array $data): array
    {
        try {
            $shopId = DB::transaction(function () use($data) {

                $parent = Shop::whereNull('parent_id')->first();

                if (empty($parent)) {
                    throw new Exception(__('errors.' . ResponseError::ERROR_213, locale: $this->language), 422);
                }

                if (DB::table('shops')->select('id')->count() >= 5) {
                    throw new Exception(__('errors.' . ResponseError::ERROR_213, locale: $this->language), 422);
                }

                /** @var Shop $parent */
                $data['parent_id'] = $parent->id;

                /** @var Shop $shop */
                $shop = $this->model()->create($this->setShopParams($data));

                $this->setTranslations($shop, $data, true, true);

                if (data_get($data, 'images.0')) {
                    $shop->update([
                        'logo_img'       => data_get($data, 'images.0'),
                        'background_img' => data_get($data, 'images.1'),
                    ]);
                    $shop->uploads(data_get($data, 'images'));
                }

                (new ShopCategoryService)->update($data, $shop);

                if (data_get($data, 'tags.0')) {
                    $shop->tags()->sync(data_get($data, 'tags', []));
                }

                try {
                    Cache::forget('shops-location');
                } catch (Throwable) {}

                return $shop->id;
            });

            return [
                'status' => true,
                'code' => ResponseError::NO_ERROR,
                'data' => Shop::with([
                    'translation' => fn($q) => $q->where('locale', $this->language),
                    'categories.translation' => fn($q) => $q->where('locale', $this->language),
                    'seller.roles',
                    'tags.translation' => fn($q) => $q->where('locale', $this->language),
                    'seller' => fn($q) => $q->select('id', 'firstname', 'lastname', 'uuid'),
                ])->find($shopId)
            ];
        } catch (Throwable $e) {
            $this->error($e);
            return [
                'status'    => false,
                'code'      => ResponseError::ERROR_501,
                'message'   => $e->getMessage(),
            ];
        }
    }

    /**
     * Update specified Shop model.
     * @param string $uuid
     * @param array $data
     * @return array
     */
    public function update(string $uuid, array $data): array
    {
        try {
            /** @var Shop $shop */
            $shop = $this->model();

            $shop = $shop->when(data_get($data, 'user_id'), fn($q, $userId) => $q->where('user_id', $userId))
                ->where('uuid', $uuid)
                ->first();

            if (empty($shop)) {
                return ['status' => false, 'code' => ResponseError::ERROR_404];
            }

            $parent = Shop::whereNull('parent_id')->first();

            if (empty($parent)) {
                throw new Exception(__('errors.' . ResponseError::ERROR_213, locale: $this->language), 422);
            }

            $data['parent_id'] = $shop->parent_id;

            $shop->update($this->setShopParams($data, $shop));

            if(data_get($data, 'categories.*', [])) {
                (new ShopCategoryService)->update($data, $shop);
            }

            $this->setTranslations($shop, $data, true, true);

            if (data_get($data, 'images.0')) {
                $shop->galleries()->where('type', '!=', 'shop-documents')->delete();
                $shop->update([
                    'logo_img'       => data_get($data, 'images.0'),
                    'background_img' => data_get($data, 'images.1'),
                ]);
                $shop->uploads(data_get($data, 'images'));
            }

            if (data_get($data, 'tags.0')) {
                $shop->tags()->sync(data_get($data, 'tags', []));
            }

            return [
                'status' => true,
                'code' => ResponseError::NO_ERROR,
                'data' => Shop::with([
                    'translation'               => fn($q) => $q->where('locale', $this->language),
                    'categories.translation'    => fn($q) => $q->where('locale', $this->language),
                    'seller.roles',
                    'tags.translation'          => fn($q) => $q->where('locale', $this->language),
                    'seller'                    => fn($q) => $q->select('id', 'firstname', 'lastname', 'uuid'),
                    'workingDays',
                    'closedDates',
                ])->find($shop->id)
            ];
        } catch (Exception $e) {
            return ['status' => false, 'code' => $e->getCode() ? 'ERROR_' . $e->getCode() : ResponseError::ERROR_400, 'message' => $e->getMessage()];
        }
    }

    /**
     * Delete Shop model.
     * @param array|null $ids
     * @return array
     */
    public function delete(?array $ids = []): array
    {
        foreach (Shop::whereIn('id', is_array($ids) ? $ids : [])->get() as $shop) {

            /** @var Shop $shop */

            if (empty($shop->parent_id)) {
                continue;
            }

            FileHelper::deleteFile($shop->logo_img);
            FileHelper::deleteFile($shop->background_img);

            if (!$shop->seller?->hasRole('admin')) {
                $shop->seller->syncRoles('user');
            }

            $shop->delete();
        }

        try {
            Cache::forget('shops-location');
            Cache::forget('delivery-zone-list');
        } catch (Exception) {}

        return ['status' => true, 'code' => ResponseError::NO_ERROR];
    }

    /**
     * Set params for Shop to update or create model.
     * @param array $data
     * @param Shop|null $shop
     * @return array
     */
    private function setShopParams(array $data, ?Shop $shop = null): array
    {
        $location       = data_get($data, 'location', $shop?->location);
        $deliveryTime   = [
            'from'  => data_get($data, 'delivery_time_from', data_get($shop?->delivery_time, 'delivery_time_from', '0')),
            'to'    => data_get($data, 'delivery_time_to', data_get($shop?->delivery_time, 'delivery_time_to', '0')),
            'type'  => data_get($data, 'delivery_time_type', data_get($shop?->delivery_time, 'delivery_time_type', Shop::DELIVERY_TIME_MINUTE)),
        ];

        return [
            'user_id'           => data_get($data, 'user_id', auth('sanctum')->id()),
            'parent_id'         => data_get($data, 'parent_id'),
            'email_statuses'    => data_get($data, 'email_statuses'),
            'tax'               => data_get($data, 'tax', $shop?->tax),
            'percentage'        => data_get($data, 'percentage', $shop?->percentage ?? 0),
            'min_amount'        => data_get($data, 'min_amount', $shop?->min_amount ?? 0),
            'phone'             => data_get($data, 'phone'),
            'open'              => data_get($data, 'open', $shop?->open ?? 0),
            'delivery_time'     => $deliveryTime,
            'order_payment'     => data_get($data, 'order_payment', Shop::ORDER_PAYMENT_BEFORE),
            'show_type'         => data_get($data, 'show_type', $shop?->show_type ?? 1),
            'status_note'       => data_get($data, 'status_note', $shop?->status_note ?? ''),
            'price'             => data_get($data, 'price', $shop?->price),
            'wifi_name'         => data_get($data, 'wifi_name', $shop?->wifi_name),
            'wifi_password'     => data_get($data, 'wifi_password', $shop?->wifi_password),
            'price_per_km'      => data_get($data, 'price_per_km', $shop?->price_per_km),
            'type'              => data_get(Shop::TYPES_BY, data_get($data, 'type', $shop?->type)),
            'location'          => [
                'latitude'      => data_get($location, 'latitude', data_get($shop?->location, 'latitude', 0)),
                'longitude'     => data_get($location, 'longitude', data_get($shop?->location, 'longitude', 0)),
            ],
        ];
    }

    /**
     * @param string $uuid
     * @param array $data
     * @return array
     */
    public function imageDelete(string $uuid, array $data): array
    {
        $shop = Shop::firstWhere('uuid', $uuid);

        if (empty($shop)) {
            return [
                'status' => false,
                'code'   => ResponseError::ERROR_404,
                'data'   => $shop->refresh(),
            ];
        }

        /** @var Shop $shop */
        $shop->galleries()
            ->where('path', data_get($data, 'tag') === 'background' ? $shop->background_img : $shop->logo_img)
            ->delete();

        $shop->update([data_get($data, 'tag') . '_img' => null]);

        return [
            'status' => true,
            'code'   => ResponseError::NO_ERROR,
            'data'   => $shop->refresh(),
        ];
    }
}

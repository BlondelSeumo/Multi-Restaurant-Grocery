<?php

namespace App\Services\DeliveryManDeliveryZoneService;

use App\Models\User;
use Exception;
use App\Services\CoreService;
use App\Helpers\ResponseError;
use App\Models\DeliveryManDeliveryZone;

class DeliveryManDeliveryZoneService extends CoreService
{

    /**
     * @return string
     */
    protected function getModelClass(): string
    {
        return DeliveryManDeliveryZone::class;
    }

    /**
     * @param array $data
     * @param int|null $shopId
     * @return array
     */
    public function create(array $data, ?int $shopId = null): array
    {
        try {
            $user = User::when($shopId, function ($q) use ($shopId) {
                $q->whereHas('invitations', fn($q) => $q->where('shop_id', $shopId));
            })
                ->where('id', $data['user_id'])
                ->first();

            if (empty($user)) {
                return [
                    'status'  => false,
                    'code'    => ResponseError::ERROR_404,
                    'message' => __('errors.' . ResponseError::ERROR_404, locale: $this->language)
                ];
            }

            $deliveryZone = $user->deliveryManDeliveryZone()->updateOrCreate(['user_id' => $user->id], $data);

            return ['status' => true, 'code' => ResponseError::NO_ERROR, 'data' => $deliveryZone];
        } catch (Exception $e) {
            $this->error($e);
            return [
                'status'  => false,
                'code'    => ResponseError::ERROR_501,
                'message' => __('errors.' . ResponseError::ERROR_501, locale: $this->language)
            ];
        }
    }

    /**
     * @param array|null $ids
     * @param int|null $userId
     * @return array
     */
    public function delete(?array $ids = [], ?int $userId = null): array
    {
        $deliveryManDeliveryZones = DeliveryManDeliveryZone::whereIn('id', (array)$ids)
            ->when($userId, fn($q) => $q->where('user_id', $userId))
            ->get();

        foreach ($deliveryManDeliveryZones as $deliveryManDeliveryZone) {
            $deliveryManDeliveryZone->delete();
        }

        return [
            'status' => true,
            'code' => ResponseError::NO_ERROR,
        ];
    }
}

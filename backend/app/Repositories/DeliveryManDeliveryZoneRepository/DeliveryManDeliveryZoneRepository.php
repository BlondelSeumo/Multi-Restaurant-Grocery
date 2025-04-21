<?php

namespace App\Repositories\DeliveryManDeliveryZoneRepository;

use App\Helpers\ResponseError;
use Illuminate\Support\Collection;
use App\Repositories\CoreRepository;
use App\Models\DeliveryManDeliveryZone;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class DeliveryManDeliveryZoneRepository extends CoreRepository
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
     * @return LengthAwarePaginator
     */
    public function paginate(array $data = []): LengthAwarePaginator
    {
        /** @var DeliveryManDeliveryZone $deliveryManDeliveryZone */
        $deliveryManDeliveryZone = $this->model();

        return $deliveryManDeliveryZone
            ->filter($data)
            ->with(['user'])
            ->paginate(data_get($data, 'perPage', 15));
    }

    /**
     * @param array $data
     * @return Collection
     */
    public function list(array $data = []): Collection
    {
        /** @var DeliveryManDeliveryZone $deliveryManDeliveryZone */
        $deliveryManDeliveryZone = $this->model();

        return $deliveryManDeliveryZone->filter($data)->get();
    }

    /**
     * @param int $userId
     * @param int|null $shopId
     * @return array
     */
    public function show(int $userId, ?int $shopId = null): array
    {
        $deliverManDeliveryZone = DeliveryManDeliveryZone::where('user_id', $userId)
            ->with(['user'])
            ->when($shopId, fn($q) => $q->whereHas('user.invitations', fn($q) => $q->where('shop_id', $shopId)))
            ->first();

        if (empty($deliverManDeliveryZone)) {
            return [
                'status'  => false,
                'code'    => ResponseError::ERROR_404,
                'message' => __('errors.' . ResponseError::ERROR_404, locale: $this->language)
            ];
        }

        return ['status' => true, 'code' => ResponseError::NO_ERROR, 'data' => $deliverManDeliveryZone];
    }
}

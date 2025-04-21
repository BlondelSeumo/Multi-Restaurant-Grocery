<?php

namespace App\Services\OrderService;

use App\Helpers\ResponseError;
use App\Models\Order;
use App\Models\OrderRepeat;
use App\Traits\Notification;
use App\Services\CoreService;
use Exception;

class OrderRepeatService extends CoreService
{
    use Notification;

    /**
     * @return string
     */
    protected function getModelClass(): string
    {
        return Order::class;
    }

	/**
	 * @throws Exception
	 */
	public function create(Order $order, array $data): OrderRepeat
	{
		if ($data['from'] < $order->delivery_date) {
			throw new Exception(__('errors.' . ResponseError::ERROR_120, locale: $this->language), 400);
		}

        if ($data['from'] > $data['to']) {
            throw new Exception(__('errors.' . ResponseError::ERROR_120, locale: $this->language), 400);
        }

		return OrderRepeat::updateOrCreate([
			'order_id' => $order->id,
		], $data)->fresh('order');
	}

    /**
     * @throws Exception
     */
    public function del(OrderRepeat $orderRepeat)
    {
        $orderRepeat->delete();
    }

}

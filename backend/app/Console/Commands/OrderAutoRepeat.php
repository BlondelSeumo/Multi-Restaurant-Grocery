<?php

namespace App\Console\Commands;

use App\Helpers\NotificationHelper;
use App\Models\Order;
use App\Models\OrderRepeat;
use App\Models\Payment;
use App\Models\Settings;
use App\Models\Transaction;
use App\Services\EmailSettingService\EmailSendService;
use App\Services\OrderService\OrderDetailService;
use App\Services\OrderService\OrderService;
use App\Traits\Notification;
use DB;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Throwable;

class OrderAutoRepeat extends Command
{
	use Notification;

	/**
	 * The name and signature of the console command.
	 *
	 * @var string
	 */
	protected $signature = 'order:auto:repeat';

	/**
	 * The console command description.
	 *
	 * @var string
	 */
	protected $description = 'order auto repeat';

	/**
	 * Create a new command instance.
	 *
	 * @return void
	 */
	public function __construct()
	{
		parent::__construct();
	}

	/**
	 * Execute the console command.
	 *
	 * @return int
	 */
	public function handle(): int
	{
		try {
			OrderRepeat::where('to', '<', date('Y-m-d', strtotime('-1 day')))->delete();
			$now  = date('Y-m-d');
			$cash = Payment::where('tag', Payment::TAG_CASH)->value('id');

			/** @var OrderRepeat[] $orderRepeats */
			$orderRepeats = OrderRepeat::with([
				'order.shop',
				'order.user',
				'order.orderDetails' => fn($q) => $q->select(['id', 'order_id', 'parent_id', 'stock_id', 'quantity', 'note'])->whereNull('parent_id'),
				'order.orderDetails.children:id,order_id,parent_id,stock_id,quantity,note',
			])
				->where('to', '>=', $now)
				->get();

			$autoApprove = Settings::where('key', 'order_auto_approved')->value('value');

			foreach ($orderRepeats as $orderRepeat) {

				/** @var Order $newOrder */
				$newOrder = DB::transaction(function () use ($orderRepeat, $now, $cash, $autoApprove) {
					$order = $orderRepeat->order->toArray();

					$alreadyCreated = Order::where('user_id', $order['user_id'])
						->where('delivery_date', $now)
						->exists();

					if ($alreadyCreated) {
						return null;
					}

					$order['delivery_date'] = $now;
					$order['status'] 		= Order::STATUS_NEW;

					if ((int)$autoApprove === 1) {
						$order['status'] = Order::STATUS_ACCEPTED;
					}

					unset($order['id']);
					unset($order['created_at']);
					unset($order['updated_at']);

					$newOrder = Order::create($order);

					$newOrder->createTransaction([
						'price'              => $newOrder->total_price,
						'user_id'            => $newOrder->user_id,
						'payment_sys_id'     => $cash,
						'note'               => $newOrder->id,
						'perform_time'       => now(),
						'status_description' => "Transaction for Order #$newOrder->id",
						'status'             => Transaction::STATUS_PROGRESS,
					]);

					$orderDetails = [];

					foreach ($order['order_details'] as $orderDetail) {

						$orderDetail['addons'] = $orderDetail['children'];
						unset($orderDetail['children']);

						$orderDetails[] = $orderDetail;

					}

					$order = (new OrderDetailService)->update($newOrder, $orderDetails, []);

					$data = [];

					if ($order->table_id) {
						$data['table_id'] = $order->table_id;
					}

					if ($order->tips) {
						$data['tips'] = $order->rate_tips;
					}

					(new OrderService)->calculateOrder($order, $order->shop, $data);

					if (in_array($newOrder->status, $newOrder->shop?->email_statuses ?? []) && ($newOrder->email || $newOrder->user?->email)) {
						(new EmailSendService)->sendOrder($newOrder);
					}

					$this->info($newOrder->id);

					return $newOrder;
				});

				$result = ['data' => $newOrder];

				$this->newOrderNotification($result);

				if ((int)$autoApprove === 1) {
					(new NotificationHelper)->autoAcceptNotification(
						data_get($result, 'data'),
                        $this->language,
						Order::STATUS_ACCEPTED
					);
				}

			}

		} catch (Throwable $e) {
			Log::error($e->getMessage(), [
				'code'    => $e->getCode(),
				'message' => $e->getMessage(),
				'trace'   => $e->getTrace(),
				'file'    => $e->getFile(),
			]);
		}

		return 0;
	}
}

<?php

namespace App\Console\Commands;

use App\Models\Order;
use App\Models\Payment;
use App\Models\Settings;
use App\Models\Transaction;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Throwable;

class OrderAutoRemove extends Command
{
	/**
	 * The name and signature of the console command.
	 *
	 * @var string
	 */
	protected $signature = 'order:auto:remove';

	/**
	 * The console command description.
	 *
	 * @var string
	 */
	protected $description = 'remove canceled orders';

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
		$orderAutoRemove = Settings::where('key', 'order_auto_remove')->first()?->value ?? 15;
		$from 	= date('Y-m-d 23:59:59', strtotime("-$orderAutoRemove minute"));

		$before = $orderAutoRemove + 5;
		$to 	= date('Y-m-d 23:59:59', strtotime("-$before minute"));

		$orders = Order::with(['transactions.paymentSystem'])
			->whereDate('created_at', '<=', $from)
			->whereDate('created_at', '>=', $to)
			->whereHas('transaction', function ($query) {
				$query->where('status', '!=', Transaction::STATUS_PAID);
			})
			->get();

		foreach ($orders as $order) {

			try {
				if ($order?->transaction?->paymentSystem?->tag === Payment::TAG_CASH) {
					continue;
				}

				if ($order?->transaction?->status === Transaction::STATUS_PAID) {
					continue;
				}

				$order->delete();
			} catch (Throwable $e) {
				Log::error($e->getMessage(), [
					'code'    => $e->getCode(),
					'message' => $e->getMessage(),
					'trace'   => $e->getTrace(),
					'file'    => $e->getFile(),
				]);
			}

		}

		return 0;
	}
}

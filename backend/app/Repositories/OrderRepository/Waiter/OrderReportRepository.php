<?php

namespace App\Repositories\OrderRepository\Waiter;

use App\Models\Order;
use App\Models\User;
use App\Repositories\CoreRepository;
use Illuminate\Support\Facades\DB;

class OrderReportRepository extends CoreRepository
{
    /**
     * @return string
     */
    protected function getModelClass(): string
    {
        return Order::class;
    }

    /**
     * @param array $filter
     * @return array
     */
    public function report(array $filter = []): array
    {
        $type     = data_get($filter, 'type', 'day');
        $waiterId = data_get($filter, 'waiter_id');
        $dateFrom = date('Y-m-d 00:00:01', strtotime(request('date_from')));
        $dateTo   = date('Y-m-d 23:59:59', strtotime(request('date_to', now())));
        $now      = now()?->format('Y-m-d 00:00:01');
        $user     = User::withAvg('assignReviews', 'rating')->with(['wallet'])->find($waiterId);

        $lastOrder = DB::table('orders')
            ->when($waiterId, fn($q) => $q->where('waiter_id', $waiterId), fn($q) => $q->whereNotNull('table_id'))
            ->where('created_at', '>=', $dateFrom)
            ->where('created_at', '<=', $dateTo)
            ->where('status', Order::STATUS_DELIVERED)
            ->latest('id')
            ->first();

        $orders = DB::table('orders')
            ->when($waiterId, fn($q) => $q->where('waiter_id', $waiterId), fn($q) => $q->whereNotNull('table_id'))
            ->where('created_at', '>=', $dateFrom)
            ->where('created_at', '<=', $dateTo)
            ->where('status', Order::STATUS_DELIVERED)
            ->select([
                DB::raw("sum(if(status = 'paid', waiter_fee, 0)) as waiter_fee"),
                DB::raw("sum(if(status = 'paid', tips, 0)) as waiter_tips"),
                DB::raw('count(id) as total_count'),
                DB::raw("sum(if(created_at >= '$now', 1, 0)) as total_today_count"),
                DB::raw("sum(if(status = 'new', 1, 0)) as total_new_count"),
                DB::raw("sum(if(status = 'canceled', 1, 0)) as total_canceled_count"),
                DB::raw("sum(if(status = 'paid', 1, 0)) as total_paid_count"),
            ])
            ->first();

        $type = match ($type) {
            'year'  => '%Y',
            'week'  => '%w',
            'month' => '%Y-%m',
            default => '%Y-%m-%d',
        };

        $chart = DB::table('orders')
            ->when($waiterId, fn($q) => $q->where('waiter_id', $waiterId), fn($q) => $q->whereNotNull('table_id'))
            ->where('created_at', '>=', $dateFrom)
            ->where('created_at', '<=', $dateTo)
            ->where('status', Order::STATUS_DELIVERED)
            ->select([
                DB::raw("(DATE_FORMAT(created_at, '$type')) as time"),
                DB::raw('sum(total_price) as total_price'),
                DB::raw('sum(waiter_fee) as waiter_tips'),
            ])
            ->groupBy('time')
            ->orderBy('time')
            ->get();

        $chartByTable = DB::table('orders')
            ->when($waiterId, fn($q) => $q->where('waiter_id', $waiterId), fn($q) => $q->whereNotNull('table_id'))
            ->where('created_at', '>=', $dateFrom)
            ->where('created_at', '<=', $dateTo)
            ->where('status', Order::STATUS_DELIVERED)
            ->select([
                DB::raw('table_id'),
                DB::raw('sum(waiter_fee) as total_price'),
                DB::raw('sum(waiter_fee) as waiter_tips'),
            ])
            ->groupBy('table_id')
            ->orderBy('total_price')
            ->get();

        return [
            'last_order_total_price'    => (int)ceil(data_get($lastOrder, 'total_price', 0)),
            'last_order_income'         => (int)ceil(data_get($lastOrder, 'waiter_fee', 0)),
            'total_price'               => (int)data_get($orders, 'waiter_fee', 0) - data_get($orders, 'waiter_tips', 0),
            'waiter_tips'               => (int)data_get($orders, 'waiter_tips', 0),
            'avg_rating'                => $user?->assign_reviews_avg_rating,
            'wallet_price'              => $user?->wallet?->price,
            'wallet_currency'           => $user?->wallet?->currency,
            'total_count'               => (int)data_get($orders, 'total_count', 0),
            'total_today_count'         => (int)data_get($orders, 'total_today_count', 0),
            'total_new_count'           => (int)data_get($orders, 'total_new_count', 0),
            'total_canceled_count'      => (int)data_get($orders, 'total_canceled_count', 0),
            'total_paid_count'          => (int)data_get($orders, 'total_paid_count', 0),
            'chart'                     => $chart,
            'chart_by_table'            => $chartByTable,
        ];
    }

}

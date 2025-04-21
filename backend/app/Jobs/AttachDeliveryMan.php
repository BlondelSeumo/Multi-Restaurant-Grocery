<?php

namespace App\Jobs;

use App\Helpers\NotificationHelper;
use App\Models\Order;
use App\Models\Settings;
use App\Models\User;
use App\Traits\Loggable;
use App\Traits\Notification;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Support\Facades\Http;
use Illuminate\Queue\{InteractsWithQueue, SerializesModels};

class AttachDeliveryMan implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels, Loggable, Notification;

    public ?Order $order;
    public ?string $language;

    /**
     * Create a new event instance.
     *
     * @param Order|null $order
     * @param string|null $language
     */
    public function __construct(?Order $order, ?string $language)
    {
        $this->order    = $order;
        $this->language = $language;
    }


    /**
     * Handle the event
     * @return void
     */
    public function handle(): void
    {
        try {
            $order = $this->order;

            $second = Settings::where('key', 'deliveryman_order_acceptance_time')->first();

            if (empty($order) || $order->delivery_type !== Order::DELIVERY) {
                return;
            }

            $items = [];

            $users = User::with('deliveryManSetting')
                ->whereHas('deliveryManSetting', fn(Builder $query) => $query
                    ->where('online', 1)
                    ->where(function ($q) {
                        $q
                            ->where('updated_at', '>=', date('Y-m-d H:i', strtotime('-15 minutes')))
                            ->orWhere('created_at', '>=', date('Y-m-d H:i', strtotime('-15 minutes')));
                    })
                )
                ->whereNotNull('firebase_token')
                ->select(['firebase_token', 'id'])
                ->get();

            foreach ($users as $user) {
                $items[] = [
                    'firebase_token' => $user->firebase_token,
                    'user'           => $user,
                ];

            }

            $url = "https://fcm.googleapis.com/v1/projects/{$this->projectId()}/messages:send";

            $token = $this->updateToken();

            $headers = [
                'Authorization' => "Bearer $token",
                'Content-Type' => 'application/json'
            ];

            foreach (collect($items)->sort(SORT_ASC) as $item) {

                $deliveryMan = data_get(Order::select(['id', 'deliveryman'])->find($order->id), 'deliveryman');

                if (!empty($deliveryMan)) {
                    continue;
                }

                foreach ((array)$item['firebase_token'] ?? [] as $receiver) {

                    Http::withHeaders($headers)->post($url, [
                        'message' => [
                            'token' => $receiver,
                            'notification' => [
                                'title' => "New order #$order->id",
                                'body'  => 'need attach deliveryman',
                            ],
                            'data'  => (new NotificationHelper)->deliveryManOrder($order),
                            'sound' => 'default',
                        ],
                    ]);

                }

                sleep(data_get($second, 'value', 30));
            }

        } catch (Exception $e) {
            $this->error($e);
        }
    }
}

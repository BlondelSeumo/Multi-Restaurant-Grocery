<?php

namespace App\Traits;

use App\Helpers\ResponseError;
use App\Models\PushNotification;
use App\Models\Settings;
use App\Models\User;
use App\Services\PushNotificationService\PushNotificationService;
use Google\Client;
use Google\Exception;
use Illuminate\Support\Facades\Http;
use Throwable;

/**
 * App\Traits\Notification
 *
 * @property string $language
 */
trait Notification
{
    public function sendNotification(
        array   $receivers = [],
        ?string $message = '',
        ?string $title = null,
        mixed   $data = [],
        array   $userIds = [],
        ?string $firebaseTitle = '',
    ): void
    {
        dispatch(function () use ($receivers, $message, $title, $data, $userIds, $firebaseTitle) {

            if (empty($receivers)) {
                return;
            }

            $type = data_get($data, 'order.type');

            if (is_array($userIds) && count($userIds) > 0) {
                (new PushNotificationService)->storeMany([
                    'type' 	=> $type ?? data_get($data, 'type'),
                    'title' => $title,
                    'body' 	=> $message,
                    'data' 	=> $data,
                    'sound' => 'default',
                ], $userIds);
            }

            $url = "https://fcm.googleapis.com/v1/projects/{$this->projectId()}/messages:send";

            try {
                $token = $this->updateToken();
            } catch (Throwable) {
                return;
            }

            $headers = [
                'Authorization' => "Bearer $token",
                'Content-Type'  => 'application/json'
            ];

            foreach ($receivers as $receiver) {

                Http::withHeaders($headers)->post($url, [
                    'message' => [
                        'token' => $receiver,
                        'notification' => [
                            'title' => $firebaseTitle ?? $title,
                            'body' 	=> $message,
                        ],
                        'data' => [
                            'id'     => (string)($data['id'] 	?? ''),
                            'status' => (string)($data['status'] ?? ''),
                            'type'   => (string)($data['type'] 	?? '')
                        ],
                        'android' => [
                            'notification' => [
                                'sound' => 'default',
                            ]
                        ],
                        'apns' => [
                            'payload' => [
                                'aps' => [
                                    'sound' => 'default'
                                ]
                            ]
                        ]
                    ]
                ]);

            }

        })->afterResponse();
    }

    public function sendAllNotification(?string $title = null, mixed $data = [], ?string $firebaseTitle = ''): void
    {
        dispatch(function () use ($title, $data, $firebaseTitle) {

            User::select([
                'id',
                'deleted_at',
                'active',
                'email_verified_at',
                'phone_verified_at',
                'firebase_token',
            ])
                ->where('active', 1)
                ->where(fn($q) => $q->whereNotNull('email_verified_at')->orWhereNotNull('phone_verified_at'))
                ->whereNotNull('firebase_token')
                ->orderBy('id')
                ->chunk(100, function ($users) use ($title, $data, $firebaseTitle) {

                    $firebaseTokens = $users?->pluck('firebase_token', 'id')?->toArray();

                    $receives = [];

                    foreach ($firebaseTokens as $firebaseToken) {

                        if (empty($firebaseToken)) {
                            continue;
                        }

                        $receives[] = array_filter($firebaseToken, fn($item) => !empty($item));
                    }

                    $receives = array_merge(...$receives);

                    $this->sendNotification(
                        $receives,
                        $title,
                        data_get($data, 'id'),
                        $data,
                        array_keys(is_array($firebaseTokens) ? $firebaseTokens : []),
                        $firebaseTitle
                    );

                });

        })->afterResponse();

    }


    public function newOrderNotification($result): void
    {
        $adminFirebaseTokens = User::with(['roles' => fn($q) => $q->where('name', 'admin')])
            ->whereHas('roles', fn($q) => $q->where('name', 'admin'))
            ->whereNotNull('firebase_token')
            ->pluck('firebase_token', 'id')
            ->toArray();

        $sellersFirebaseTokens = User::with([
            'shop' => fn($q) => $q->where('id', data_get($result, 'data.shop_id'))
        ])
            ->whereHas('shop', fn($q) => $q->where('id', data_get($result, 'data.shop_id')))
            ->whereNotNull('firebase_token')
            ->pluck('firebase_token', 'id')
            ->toArray();

        $aTokens = [];
        $sTokens = [];

        foreach ($adminFirebaseTokens as $adminToken) {
            $aTokens = array_merge($aTokens, is_array($adminToken) ? array_values($adminToken) : [$adminToken]);
        }

        foreach ($sellersFirebaseTokens as $sellerToken) {
            $sTokens = array_merge($sTokens, is_array($sellerToken) ? array_values($sellerToken) : [$sellerToken]);
        }

        $this->sendNotification(
            array_values(array_unique(array_merge($aTokens, $sTokens))),
            __('errors.' . ResponseError::NEW_ORDER, ['id' => data_get($result, 'data.id')], $this->language),
            data_get($result, 'data.id'),
            data_get($result, 'data')?->setAttribute('type', PushNotification::NEW_ORDER)?->only(['id', 'status', 'delivery_type']),
            array_merge(array_keys($adminFirebaseTokens), array_keys($sellersFirebaseTokens))
        );

    }


    /**
     * @return string
     * @throws Exception
     */
    private function updateToken(): string
    {
        $googleClient = new Client;
        $googleClient->setAuthConfig(storage_path('app/google-service-account.json'));
        $googleClient->addScope('https://www.googleapis.com/auth/firebase.messaging');

        $token = $googleClient->fetchAccessTokenWithAssertion()['access_token'];

        Settings::updateOrCreate(['key' => 'firebase_auth_token'], ['value' => $token]);

        return $token;
    }

    private function projectId()
    {
        return Settings::where('key', 'project_id')->value('value');
    }
}

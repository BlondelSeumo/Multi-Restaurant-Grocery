<?php

namespace App\Services\WalletHistoryService;

use DB;
use Log;
use Throwable;
use App\Models\User;
use App\Models\Currency;
use Illuminate\Support\Str;
use App\Traits\Notification;
use App\Models\WalletHistory;
use App\Services\CoreService;
use App\Helpers\ResponseError;
use App\Models\NotificationUser;
use App\Models\PushNotification;
use App\Http\Resources\WalletHistoryResource;

class WalletHistoryService extends CoreService
{
    use Notification;

    protected function getModelClass(): string
    {
        return WalletHistory::class;
    }

    public function create(array $data): array
    {
        if (!data_get($data, 'type') || !data_get($data, 'price') || !data_get($data, 'user')
        ) {
            Log::error('wallet history empty', [
                'type'  => data_get($data, 'type'),
                'price' => data_get($data, 'price'),
                'user'  => data_get($data, 'user'),
                'data'  => $data
            ]);
            return ['status' => false, 'code' => ResponseError::ERROR_400, 'data' => 'empty'];
        }

        /** @var User $user */
        $user = data_get($data, 'user');

        $walletHistory = $this->model()->create([
            'uuid'          => Str::uuid(),
            'wallet_uuid'   => data_get($user->wallet, 'uuid'),
            'type'          => data_get($data, 'type', 'withdraw'),
            'price'         => data_get($data, 'price'),
            'note'          => data_get($data, 'note'),
            'created_by'    => $user->id,
            'status'        => data_get($data, 'status', WalletHistory::PROCESSED),
        ]);

        if (data_get($data, 'type') == 'topup') {

            $user->wallet()->increment('price', data_get($data, 'price'));

        } else if (data_get($data, 'type') == 'withdraw') {

            $user->wallet()->decrement('price', data_get($data, 'price'));

        }

        return ['status' => true, 'code' => ResponseError::NO_ERROR, 'data' => $walletHistory];
    }

    public function changeStatus(string $uuid, string $status = null): array
    {
        /** @var WalletHistory $walletHistory */
        $walletHistory = $this->model()->firstWhere('uuid', $uuid);

        if (!$walletHistory) {
            return ['status' => false, 'code' => ResponseError::ERROR_404];
        }

        if ($walletHistory->status === WalletHistory::PROCESSED) {

            $isCancel = $status === WalletHistory::REJECTED || $status === WalletHistory::CANCELED;

            $walletHistory->update([
                'status' => $status,
                'price' => $isCancel ? $walletHistory->wallet->price + $walletHistory->price : $walletHistory->price
            ]);

        }

        return ['status' => true, 'code' => ResponseError::NO_ERROR];
    }

    /**
     * @param $request
     * @return array
     * @throws Throwable
     */
    public function send($request): array
    {
        return DB::transaction(function () use ($request) {

            /** @var User $sendingUser */
            $sendingUser = User::with(['wallet', 'notifications'])->firstWhere('uuid', $request->input('uuid'));

            if (empty($sendingUser->wallet)) {
                return [
                    'status'  => false,
                    'code'    => ResponseError::ERROR_109,
                    'message' => __('errors.' . ResponseError::ERROR_109, locale: $this->language)
                ];
            }

            $rate  = Currency::find($request->input('currency_id'))?->rate;
            $price = $request->input('price') / ($rate ?? 1);

            $request->merge([
                'price' => $price,
                'note'  => "$sendingUser->firstname $sendingUser->lastname"
            ]);

            $result = $this->withDraw($request);

            if (!data_get($result, 'status')) {
                return $result;
            }

            /** @var User $sender */
            $sender = auth('sanctum')->user();

            $filter = $request->all();
            $filter['status'] = WalletHistory::PAID;
            $filter['type']   = 'topup';
            $filter['user']   = $sendingUser;
            $filter['created_by'] = $sender->id;

            $result = $this->create($filter);

            if (!data_get($result, 'status')) {
                return $result;
            }

            $notification = $sendingUser
                ?->notifications
                ?->where('type', \App\Models\Notification::PUSH)
                ?->first();

            /** @var NotificationUser $notification */
            if ($notification?->notification?->active) {

                $message = __(
                    'errors.' . ResponseError::WALLET_TOP_UP,
                    ['sender' => "$sender->firstname $sender->lastname"],
                    $sendingUser?->lang ?? $this->language
                );

                $this->sendNotification(
                    $sendingUser->firebase_token ?? [],
                    $message,
                    $message,
                    [
                        'id'     => $sendingUser->id,
                        'price'  => $price,
                        'type'   => PushNotification::WALLET_TOP_UP
                    ],
                    [$sendingUser->id],
                    $message,
                );

            }

            return [
                'status'  => true,
                'code'    => ResponseError::NO_ERROR,
                'message' => __('errors.' . ResponseError::RECORD_WAS_SUCCESSFULLY_CREATED, locale: $this->language),
                'data'    => WalletHistoryResource::make(data_get($result, 'data'))
            ];
        });
    }

    /**
     * @param $request
     * @return array
     * @throws Throwable
     */
    public function withDraw($request): array
    {
        $user = auth('sanctum')->user();

        if (empty($user->wallet) || $user->wallet->price < $request->input('price')) {
            return [
                'status' => false,
                'code'   => ResponseError::ERROR_109
            ];
        }

        $filter = $request->all();
        $filter['status'] = WalletHistory::PAID;
        $filter['type']   = 'withdraw';
        $filter['user']   = auth('sanctum')->user();

        return $this->create($filter);
    }

}

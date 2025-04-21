<?php

namespace App\Services\AuthService;

use App\Helpers\ResponseError;
use App\Http\Resources\UserResource;
use App\Models\Notification;
use App\Models\User;
use App\Services\CoreService;
use App\Services\SMSGatewayService\SMSBaseService;
use App\Services\UserServices\UserWalletService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Spatie\Permission\Models\Role;

class AuthByMobilePhone extends CoreService
{
    /**
     * @return string
     */
    protected function getModelClass(): string
    {
        return User::class;
    }

    /**
     * @param array $array
     * @return JsonResponse
     */
    public function authentication(array $array): JsonResponse
    {
        $phone = preg_replace('/\D/', '', data_get($array, 'phone'));

        $sms = (new SMSBaseService)->smsGateway($phone);

        if (!data_get($sms, 'status')) {

            return $this->onErrorResponse([
                'code'    => ResponseError::ERROR_400,
                'message' => data_get($sms, 'message', '')
            ]);

        }

        return $this->successResponse(__('web.otp_successfully_send'), [
            'verifyId'  => data_get($sms, 'verifyId'),
            'phone'     => data_get($sms, 'phone'),
            'message'   => data_get($sms, 'message', '')
        ]);
    }

    /**
     * @todo REMOVE IN THE FUTURE
     * @param array $array
     * @return JsonResponse
     */
    public function confirmOPTCode(array $array): JsonResponse
    {
        if (data_get($array, 'type') !== 'firebase') {

            $data = Cache::get('sms-' . data_get($array, 'verifyId'));

            if (empty($data)) {
                return $this->onErrorResponse(['code' => ResponseError::ERROR_404]);
            }

            $count = $this->setOTPCount($data);

            if ($count == 0) {
                return $this->onErrorResponse(['code' => ResponseError::ERROR_202]);
            }

            if (Carbon::parse(data_get($data, 'expiredAt')) < now()) {
                return $this->onErrorResponse(['code' => ResponseError::ERROR_203]);
            }

            if (data_get($data, 'OTPCode') !== data_get($data, 'verifyCode')) {
                return $this->onErrorResponse(['code' => ResponseError::ERROR_201]);
            }

            $user = $this->model()->where('phone', data_get($data, 'phone'))->first();

        }

        $array['active'] = 1;
        $array['phone_verified_at'] = now();
        $array['deleted_at'] = null;

        if (empty($user)) {
            $user = $this->model()
                ->withTrashed()
                ->updateOrCreate([
                    'phone' => data_get($array, 'phone')
                ], $array);

            $id = Notification::where('type', Notification::PUSH)->select(['id', 'type'])->first()?->id;

            $user->notifications()->sync((array)$id);

            $user->emailSubscription()->updateOrCreate([
                'user_id' => $user->id
            ], [
                'active' => true
            ]);
        }

        /** @var User $user */
        if (!$user->hasAnyRole(Role::query()->pluck('name')->toArray())) {
            $user->syncRoles('user');
        }

        if(empty($user->wallet)) {
            $user = (new UserWalletService)->create($user);
        }

        $token = $user->createToken('api_token')->plainTextToken;

        Cache::forget('sms-' . data_get($array, 'verifyId'));

        return $this->successResponse('User successfully login', [
            'token' => $token,
            'user'  => UserResource::make($user),
        ]);

    }

    public function forgetPasswordVerify(array $data): JsonResponse
    {
        $user = User::withTrashed()->where('phone', str_replace('+', '', data_get($data, 'phone')))->first();

        if (empty($user)) {
            return $this->onErrorResponse(['code' => ResponseError::ERROR_404]);
        }

        if (!empty($user->deleted_at)) {
            $user->update([
                'deleted_at' => null
            ]);
        }

        $token = $user->createToken('api_token')->plainTextToken;

        return $this->successResponse('User successfully login', [
            'token' => $token,
            'user'  => UserResource::make($user),
        ]);
    }

    public function setOTPCount(array $array)
    {
        $verifyId = data_get($array, 'verifyId');

        $count = Cache::get($verifyId);

        if ($count > 0) {
            Cache::forget($verifyId);
            Cache::put($verifyId, $count - 1, 300);
        }

        return $count;
    }

}

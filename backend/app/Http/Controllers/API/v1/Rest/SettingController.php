<?php

namespace App\Http\Controllers\API\v1\Rest;

use App\Helpers\ResponseError;
use App\Http\Controllers\Controller;
use App\Http\Resources\ReferralResource;
use App\Models\Order;
use App\Models\Referral;
use App\Models\Settings;
use App\Models\SmsPayload;
use App\Models\Translation;
use App\Services\SettingService\SettingService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class SettingController extends Controller
{
    use ApiResponse;

    public function __construct(private SettingService $service)
    {
        parent::__construct();
    }

    public function settingsInfo(): JsonResponse
    {
        $settings = $this->service->getSettings();

        return $this->successResponse(__('errors.' . ResponseError::SUCCESS, locale: $this->language), $settings);
    }

    public function referral(): JsonResponse
    {
        $active = Settings::where('key', 'referral_active')->first();

        if (!data_get($active, 'value')) {
            return $this->onErrorResponse([
                'code'    => ResponseError::ERROR_404,
                'message' => __('errors.' . ResponseError::ERROR_404, locale: $this->language)
            ]);
        }

        $referral = Referral::with([
            'translation' => fn($q) => $q->where('locale', $this->language),
            'translations',
            'galleries',
        ])->where([
            ['expired_at', '>=', now()],
        ])->first();

        if (empty($referral)) {
            return $this->onErrorResponse([
                'code'    => ResponseError::ERROR_404,
                'message' => __('errors.' . ResponseError::ERROR_404, locale: $this->language)
            ]);
        }

        return $this->successResponse(
            __('errors.' . ResponseError::SUCCESS, locale: $this->language),
            ReferralResource::make($referral)
        );
    }

    public function translationsPaginate(): JsonResponse
    {
        $translations = Cache::remember('language-'. $this->language, 86400, function () {
            return Translation::where('locale', $this->language)
                ->where('status', 1)
                ->pluck('value', 'key');
        });

        return $this->successResponse('errors.' . ResponseError::NO_ERROR, $translations->all());
    }

    /**
     * @return JsonResponse
     */
    public function systemInformation(): JsonResponse
    {
        return $this->service->systemInformation();
    }

    /**
     * @return JsonResponse
     */
    public function stat(): JsonResponse
    {
        $users = DB::table('users')
            ->select(['id'])
            ->count('id');

        $orders = DB::table('orders')
            ->select(['id', 'status'])
            ->where('status', Order::STATUS_DELIVERED)
            ->count('id');

        return $this->successResponse(__('errors.' . ResponseError::SUCCESS, locale: $this->language), [
            'users'  => $users,
            'orders' => $orders
        ]);
    }

    /**
     * @return JsonResponse
     */
    public function defaultSmsPayload(): JsonResponse
    {
        return $this->successResponse(
            __('errors.' . ResponseError::SUCCESS, locale: $this->language),
            SmsPayload::select(['type', 'default'])->where('default', 1)->first()
        );
    }

    /**
     * @return JsonResponse
     */
    public function projectVersion(): JsonResponse
    {
        return $this->successResponse(__('errors.' . ResponseError::SUCCESS, locale: $this->language), [
            'version' => env('PROJECT_V')
        ]);
    }

    /**
     * @return JsonResponse
     */
    public function timeZone(): JsonResponse
    {
        return $this->successResponse(__('errors.' . ResponseError::SUCCESS, locale: $this->language), [
            'timeZone'  => config('app.timezone'),
            'time'      => date('Y-m-d H:i:s')
        ]);
    }

}

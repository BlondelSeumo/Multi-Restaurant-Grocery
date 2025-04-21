<?php

namespace App\Http\Controllers\API\v1\Dashboard\Admin;

use App\Helpers\ResponseError;
use App\Models\Referral;
use App\Models\Settings;
use App\Models\User;
use App\Services\SettingService\SettingService;
use File;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Psr\SimpleCache\InvalidArgumentException;
use Throwable;

class SettingController extends AdminBaseController
{

    public function __construct(private SettingService $service)
    {
        parent::__construct();
    }

    /**
     * Display a listing of the resource.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $settings = $this->service->getSettings();

        return $this->successResponse(__('errors.' . ResponseError::SUCCESS, locale: $this->language), $settings);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $isRemoveRef = false;

        foreach ($request->all() as $index => $item) {

            if ($index === 'default_delivery_zone') {

                File::put(public_path('default_delivery_zone.json'), json_encode($item));

                $item = 'default_delivery_zone.json';

            }

            if ($index === 'template_delivery_zones') {

                File::put(public_path('template_delivery_zones.json'), json_encode($item));

                $item = 'template_delivery_zones.json';

            }

            Settings::withTrashed()->updateOrCreate(['key' => $index],[
                'value' => $item,
                'deleted_at' => null
            ]);

            if ($index === 'referral_active' && $item) {
                $isRemoveRef = true;
            }

        }

        if ($isRemoveRef) {
            $this->clearReferral();
        }

        try {
            Cache::delete('admin-settings');
        } catch (InvalidArgumentException $e) {
            $this->error($e);
        }

        return $this->successResponse(
            __('errors.' . ResponseError::USER_SUCCESSFULLY_REGISTERED, locale: $this->language)
        );

    }

    /**
     * @return void
     */
    public function clearReferral(): void
    {
        $deActiveReferral = Referral::first();

        if (empty($deActiveReferral)) {
            return;
        }

        User::withTrashed()
            ->whereNotNull('my_referral')
            ->select(['my_referral', 'id'])
            ->chunkMap(function (User $user) {
                try {
                    $user->update([
                        'my_referral' => null
                    ]);
                } catch (Throwable $e) {
                    $this->error($e);
                }
            });

        try {
            Cache::delete('admin-settings');
        } catch (InvalidArgumentException $e) {
            $this->error($e);
        }

    }

    public function systemInformation(): JsonResponse
    {
        return $this->service->systemInformation();
    }

    public function clearCache(): JsonResponse
    {
        Artisan::call('optimize:clear');
        Artisan::call('cache:clear');
        Artisan::call('config:cache');

        return $this->successResponse( __('errors.' . ResponseError::SUCCESS, locale: $this->language), []);
    }

    public function dropAll(): JsonResponse
    {
        $this->service->dropAll();

        return $this->successResponse(
            __('errors.' . ResponseError::RECORD_WAS_SUCCESSFULLY_DELETED, locale: $this->language)
        );
    }

    public function truncate(): JsonResponse
    {
        $this->service->truncate();

        return $this->successResponse(
            __('errors.' . ResponseError::RECORD_WAS_SUCCESSFULLY_DELETED, locale: $this->language)
        );
    }

    public function restoreAll(): JsonResponse
    {
        $this->service->restoreAll();

        return $this->successResponse(
            __('errors.' . ResponseError::RECORD_WAS_SUCCESSFULLY_DELETED, locale: $this->language)
        );
    }

}

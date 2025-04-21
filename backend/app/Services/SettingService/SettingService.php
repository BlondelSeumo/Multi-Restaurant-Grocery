<?php

namespace App\Services\SettingService;

use App\Models\Settings;
use App\Services\CoreService;
use File;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Throwable;

class SettingService extends CoreService
{
    protected function getModelClass(): string
    {
        return Settings::class;
    }

    /**
     * @return Collection|array
     */
    public function getSettings(): Collection|array
    {
        $settings = Settings::get();

        if (
            !(request()->is('api/v1/dashboard/user/*') || request()->is('api/v1/rest/*'))
            || !!request('seller')
        ) {
            $this->defaultDeliveryZone($settings);
            $this->templateDeliveryZones($settings);
        }

        return $settings;
    }

    /**
     * @param Collection|array $settings
     * @return void
     */
    private function defaultDeliveryZone(Collection|array &$settings): void
    {
        $zone = null;

        try {
            $zone = File::get(public_path('default_delivery_zone.json'));
        } catch (Throwable) {}

        if ($settings->where('key', 'default_delivery_zone')->isEmpty()) {

            Settings::create([
                'key'   => 'default_delivery_zone',
                'value' => 'default_delivery_zone.json'
            ]);

            $settings = Settings::get();

        }

        $settings->where('key', 'default_delivery_zone')->first()->value = json_decode($zone);
    }

    /**
     * @param $settings
     * @return void
     */
    private function templateDeliveryZones(&$settings): void
    {
        $zone = null;

        try {
            $zone = File::get(public_path('template_delivery_zones.json'));
        } catch (Throwable) {}

        if ($settings->where('key', 'template_delivery_zones')->isEmpty()) {

            Settings::create([
                'key'   => 'template_delivery_zones',
                'value' => 'template_delivery_zones.json'
            ]);

            $settings = Settings::get();

        }

        $settings->where('key', 'template_delivery_zones')->first()->value = json_decode($zone);
    }

    /**
     * @return JsonResponse
     */
    public function systemInformation(): JsonResponse
    {
        // get MySql version from DataBase
        $error  = 'No error';

        try {
            $mysql  	= DB::selectOne(DB::raw('SHOW VARIABLES LIKE "%innodb_version%"'));
            $node       = exec('node -v');
            $npm        = exec('npm -v');
            $composer   = exec('composer -V');
        } catch (Throwable $e) {
            $this->error($e);
            $node = '';
            $npm = '';
            $composer = '';
            $error = $e->getMessage() ?? 'can`t run php command exec';
            $mysql = (object)['Value' => 'Mysql Error', 'Variable_name' => 'Mysql Error'];
        }

        return $this->successResponse('success', [
            'PHP Version'       => phpversion(),
            'Laravel Version'   => app()->version(),
            'OS Version'        => php_uname(),
            'MySql Version'     => $mysql->Value,
            'NodeJs Version'    => $node,
            'NPM Version'       => $npm,
            'Project Version'   => env('PROJECT_V'),
            'Composer Version'  => $composer,
            'error'             => $error,
            'engine'            => $mysql->Variable_name
        ]);
    }
}

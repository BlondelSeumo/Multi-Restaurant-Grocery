<?php

namespace App\Console;

use App\Models\Settings;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     *
     * @param Schedule $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule): void
    {
        $time = Settings::where('key', 'order_auto_remove')->first()?->value;
        $time = empty($time) ?  15 : $time;

//		$schedule->command('sudo chmod -R 777 ./storage/')->hourly();
//		$schedule->command('sudo chmod -R 777 ./bootstrap/cache/')->hourly();
        $schedule->command('email:send:by:time')->hourly();
        $schedule->command('remove:expired:bonus:from:cart')->dailyAt('00:01');
        $schedule->command('remove:expired:closed:dates')->dailyAt('00:01');
        $schedule->command('remove:expired:stories')->dailyAt('00:01');
        $schedule->command('order:auto:repeat')->dailyAt('00:01');
        $schedule->command('order:auto:remove')->hourlyAt("*/$time");
        $schedule->command('expired:subscription:remove')->everyMinute();
//         $schedule->command('truncate:telescope')->daily();
        $schedule->command('update:models:galleries')->hourly()->withoutOverlapping()->runInBackground();

    }

    /**
     * Register the commands for the application.
     *
     * @return void
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}

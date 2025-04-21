<?php

namespace App\Console\Commands;

//use App\Models\ShopSubscription;
use Illuminate\Console\Command;

class RemoveExpiredSubscription extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'expired:subscription:remove';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'remove expired subscription';

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
//		ShopSubscription::whereDate('expired_at', '<', now()->format('Y-m-d'))
//			->get()
//			->map(fn (ShopSubscription $shopSubscription) => $shopSubscription->delete());

        return 0;
    }
}

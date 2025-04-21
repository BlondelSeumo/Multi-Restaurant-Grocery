<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class ChangeForeignInOrdersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
	{
        Schema::table('orders', function (Blueprint $table) {
			$table->unsignedBigInteger('waiter_id')->nullable()->change();
			$table->unsignedBigInteger('cook_id')->nullable()->change();
			$table->unsignedBigInteger('address_id')->nullable()->change();
			$table->unsignedBigInteger('user_id')->nullable()->change();
			$table->unsignedBigInteger('currency_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
	{
        Schema::table('orders', function (Blueprint $table) {
            //
        });
    }
}

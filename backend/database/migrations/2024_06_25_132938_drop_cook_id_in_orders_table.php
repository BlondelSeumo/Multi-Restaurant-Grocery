<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class DropCookIdInOrdersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            try {
                Schema::table('orders', function (Blueprint $table) {
                    $table->dropForeign('orders_cook_id_foreign');
                });
            }catch (Throwable){}

            Schema::table('orders', function (Blueprint $table) {
                $table->dropColumn('cook_id');
            });
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
            $table->unsignedInteger('cook_id')->nullable();
        });
    }
}

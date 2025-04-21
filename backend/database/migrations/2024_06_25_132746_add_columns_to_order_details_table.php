<?php

use App\Models\OrderDetail;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddColumnsToOrderDetailsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        Schema::table('order_details', function (Blueprint $table) {
            $table->unsignedBigInteger('cook_id')->nullable();
            $table->unsignedBigInteger('kitchen_id')->nullable();
            $table->string('status')->default(OrderDetail::STATUS_NEW);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {
        Schema::table('order_details', function (Blueprint $table) {
            $table->dropColumn('cook_id');
            $table->dropColumn('kitchen_id');
            $table->dropColumn('status');
        });
    }
}

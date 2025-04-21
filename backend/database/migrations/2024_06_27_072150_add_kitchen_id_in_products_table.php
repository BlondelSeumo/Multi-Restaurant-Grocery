<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddKitchenIdInProductsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
	{
		if (Schema::hasColumn('categories', 'kitchen_id')) {
			Schema::table('categories', function (Blueprint $table) {
				$table->dropColumn('kitchen_id');
			});
		}

        Schema::table('products', function (Blueprint $table) {
			$table->unsignedBigInteger('kitchen_id')->nullable();
		});
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
	{
        Schema::table('products', function (Blueprint $table) {
            //
        });
    }
}

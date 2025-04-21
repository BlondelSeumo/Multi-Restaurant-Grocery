<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateInventoryItemHistoriesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
	{
        Schema::table('inventory_items', function (Blueprint $table) {
            $table->dropColumn('quantity');
            $table->dropColumn('price');
        });

        Schema::table('inventory_items', function (Blueprint $table) {
            $table->double('quantity')->default(0);
            $table->double('price')->default(0);
        });

        Schema::create('inventory_item_histories', function (Blueprint $table) {
            $table->id();
			$table->foreignId('inventory_item_id')->constrained()->cascadeOnUpdate()->cascadeOnDelete();
			$table->foreignId('inventory_id')->constrained()->cascadeOnUpdate()->cascadeOnDelete();
			$table->string('name');
			$table->double('quantity')->default(0);
			$table->double('price')->default(0);
			$table->string('bar_code')->nullable();
			$table->foreignId('unit_id')->nullable()->constrained()->cascadeOnUpdate()->nullOnDelete();
			$table->string('interval')->nullable();
			$table->date('expired_at')->nullable();
			$table->softDeletes();
            $table->timestamps();
        });

        Schema::create('product_inventory_items', function (Blueprint $table) {
            $table->id();
			$table->foreignId('inventory_item_id')->constrained()->cascadeOnUpdate()->cascadeOnDelete();
			$table->foreignId('product_id')->constrained()->cascadeOnUpdate()->cascadeOnDelete();
			$table->string('interval')->nullable();
			$table->softDeletes();
            $table->timestamps();
        });

        Schema::create('stock_inventory_items', function (Blueprint $table) {
            $table->id();
			$table->foreignId('inventory_item_id')->constrained()->cascadeOnUpdate()->cascadeOnDelete();
			$table->foreignId('stock_id')->constrained()->cascadeOnUpdate()->cascadeOnDelete();
			$table->string('interval')->nullable();
			$table->softDeletes();
            $table->timestamps();
        });

    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
	{
        Schema::dropIfExists('product_inventory_items');
        Schema::dropIfExists('inventory_item_histories');
    }
}

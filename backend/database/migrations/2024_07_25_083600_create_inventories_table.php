<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateInventoriesTable extends Migration
{
	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up(): void
	{
		Schema::create('inventories', function (Blueprint $table) {
			$table->id();
			$table->foreignId('shop_id')->nullable()->constrained()->cascadeOnUpdate()->cascadeOnDelete();
			$table->double('latitude')->nullable();
			$table->double('longitude')->nullable();
			$table->softDeletes();
			$table->timestamps();
		});

		Schema::create('inventory_translations', function (Blueprint $table) {
			$table->id();
			$table->foreignId('inventory_id')->constrained()->cascadeOnUpdate()->cascadeOnDelete();
			$table->string('title');
			$table->string('locale', 4);
			$table->softDeletes();
		});

		Schema::create('inventory_items', function (Blueprint $table) {
			$table->id();
			$table->foreignId('inventory_id')->constrained()->cascadeOnUpdate()->cascadeOnDelete();
			$table->string('name');
			$table->integer('quantity')->default(0);
			$table->integer('price')->default(0);
			$table->string('bar_code')->nullable();
			$table->foreignId('unit_id')->nullable()->constrained()->cascadeOnUpdate()->nullOnDelete();
			$table->string('interval')->nullable();
			$table->date('expired_at')->nullable();
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
		Schema::dropIfExists('inventory_translations');
		Schema::dropIfExists('inventory_items');
		Schema::dropIfExists('inventories');
	}
}

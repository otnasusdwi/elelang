<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('logistics', function (Blueprint $table) {
            $table->id();

            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();

            $table->dateTime('pickup_time')->nullable();
            $table->string('pickup_location', 200)->nullable();

            $table->string('delivery_method', 50)->nullable(); // pickup|courier|other
            $table->string('notes', 500)->nullable();

            $table->timestamps();

            $table->unique('order_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('logistics');
    }
};
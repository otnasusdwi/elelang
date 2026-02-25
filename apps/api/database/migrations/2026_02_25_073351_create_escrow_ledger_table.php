<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('escrow_ledger', function (Blueprint $table) {
            $table->id();

            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();

            $table->decimal('amount', 15, 2);
            $table->string('state', 20); // held|released|refunded

            // referensi eksternal (payment gateway / manual)
            $table->string('reference', 100)->nullable();
            $table->text('note')->nullable();

            $table->timestamps();

            $table->index(['order_id', 'state']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('escrow_ledger');
    }
};
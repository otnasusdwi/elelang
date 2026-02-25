<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();

            $table->foreignId('auction_id')->constrained('auctions')->cascadeOnDelete();
            $table->foreignId('commodity_id')->constrained('commodities')->cascadeOnDelete();

            $table->foreignId('seller_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('buyer_id')->constrained('users')->cascadeOnDelete();

            $table->decimal('final_price', 15, 2);

            $table->string('status', 30)->default('pending'); 
            // pending | paid | shipping | delivered | completed | cancelled

            $table->timestamps();

            $table->unique('auction_id'); // 1 auction => 1 order
            $table->index(['buyer_id', 'status']);
            $table->index(['seller_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
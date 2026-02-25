<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('auctions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('commodity_id')->constrained('commodities')->cascadeOnDelete();

            $table->dateTime('start_at');
            $table->dateTime('end_at');

            $table->string('status', 20)->default('scheduled'); // scheduled|live|ended|cancelled
            $table->string('timezone', 50)->nullable();

            $table->unsignedInteger('anti_sniping_seconds')->default(10);
            $table->unsignedInteger('extend_minutes')->default(10);
            $table->unsignedInteger('extended_count')->default(0);

            $table->timestamps();

            $table->index(['status', 'start_at']);
            $table->index(['status', 'end_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('auctions');
    }
};

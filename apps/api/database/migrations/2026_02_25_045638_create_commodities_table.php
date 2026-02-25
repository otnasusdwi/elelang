<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('commodities', function (Blueprint $table) {
            $table->id();

            $table->foreignId('seller_id')->constrained('users')->cascadeOnDelete();

            $table->string('name', 150);
            $table->decimal('weight_kg', 10, 2)->nullable();
            $table->string('size_grade', 50)->nullable();
            $table->string('location', 150)->nullable();
            $table->string('catch_method', 100)->nullable();
            $table->dateTime('catch_time')->nullable();
            $table->text('description')->nullable();

            $table->string('status', 20)->default('draft'); // draft|published|archived

            $table->timestamps();

            $table->index(['seller_id', 'status']);
            $table->index('name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('commodities');
    }
};

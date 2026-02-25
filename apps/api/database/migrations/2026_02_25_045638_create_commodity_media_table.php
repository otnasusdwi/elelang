<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('commodity_media', function (Blueprint $table) {
            $table->id();

            $table->foreignId('commodity_id')->constrained('commodities')->cascadeOnDelete();

            $table->string('type', 20)->default('image'); // image|video
            $table->string('url'); // hasil upload /api/media
            $table->integer('sort_order')->default(0);

            $table->timestamps();

            $table->index(['commodity_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('commodity_media');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('disputes', function (Blueprint $table) {
            $table->id();

            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignId('opened_by')->constrained('users')->cascadeOnDelete();

            $table->string('reason', 150);
            $table->text('description')->nullable();

            $table->string('status', 20)->default('open'); 
            // open | in_review | resolved | rejected

            $table->string('resolution', 30)->nullable(); 
            // refund | release | replacement | none

            $table->text('resolution_note')->nullable();
            $table->foreignId('resolved_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();

            $table->unique('order_id'); // 1 order => 1 dispute (MVP)
            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('disputes');
    }
};
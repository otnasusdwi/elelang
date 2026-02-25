<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void {
    Schema::create('audit_logs', function (Blueprint $t) {
      $t->id();
      $t->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
      $t->string('action', 100);              // e.g. admin.auction.update
      $t->string('method', 10);
      $t->string('path', 255);
      $t->unsignedSmallInteger('status_code')->nullable();
      $t->string('ip', 45)->nullable();
      $t->string('user_agent', 255)->nullable();
      $t->json('payload')->nullable();        // sanitized
      $t->json('meta')->nullable();           // e.g. ids impacted
      $t->timestamps();
      $t->index(['action', 'created_at']);
    });
  }
  public function down(): void { Schema::dropIfExists('audit_logs'); }
};
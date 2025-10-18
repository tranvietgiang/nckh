<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('personal_access_tokens', function (Blueprint $table) {
            $table->id();
            // $table->morphs('tokenable'); // bỏ dòng này

            // Tạo cột thủ công để ID là chuỗi
            $table->string('tokenable_type');
            $table->string('tokenable_id');

            // tạo lại index gộp như morphs()
            $table->index(['tokenable_type', 'tokenable_id']);

            $table->string('name'); // dùng string là chuẩn, text cũng được nhưng không cần thiết
            $table->string('token', 64)->unique();
            $table->text('abilities')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable()->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('personal_access_tokens');
    }
};
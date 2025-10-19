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
        Schema::create('import_errors', function (Blueprint $table) {
            $table->id('error_id');
            $table->string('user_id')->nullable();     // MSSV
            $table->string('name')->nullable();        // Họ tên SV
            $table->string('email')->nullable();       // Email SV
            $table->string('reason')->nullable();      // Lý do lỗi
            $table->unsignedBigInteger('class_id')->nullable();
            $table->string('teacher_id')->nullable();
            $table->timestamps();

            // 🔹 Khóa ngoại mềm (tùy chọn)
            $table->foreign('class_id')
                ->references('class_id')->on('classes')
                ->onDelete('set null');

            $table->foreign('teacher_id')
                ->references('user_id')->on('users')
                ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('import_errors');
    }
};
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
            $table->string('user_id', 15)->nullable();
            $table->string('fullname', 50)->nullable();
            $table->string('email')->nullable();
            $table->text('reason', 600)->nullable();

            // Phân loại lỗi (major, class, group, student, ...)
            $table->string('typeError', 50)->nullable();

            // Khóa ngoại lớp học
            $table->unsignedBigInteger('class_id')->nullable();
            $table->foreign('class_id')
                ->references('class_id')
                ->on('classes')
                ->nullOnDelete();

            // Khóa ngoại ngành học
            $table->unsignedBigInteger('major_id')->nullable();
            $table->foreign('major_id')
                ->references('major_id')
                ->on('majors')
                ->nullOnDelete();

            // Giảng viên
            $table->string('teacher_id', 15)->nullable();
            $table->foreign('teacher_id')
                ->references('user_id')
                ->on('users')
                ->nullOnDelete();

            $table->timestamps();
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
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
            $table->text('reason', 225)->nullable();
            $table->foreignId('class_id')->constrained("classes", "class_id")->nullable();
            $table->foreignId('major_id')->constrained("majors", "major_id")->nullable();
            $table->string('teacher_id', 15)->nullable();
            $table->foreign('teacher_id')
                ->references('user_id')->on('users')
                ->onDelete('set null');
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
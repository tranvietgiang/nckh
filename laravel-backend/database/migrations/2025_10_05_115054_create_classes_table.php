<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('classes', function (Blueprint $table) {
            $table->id('class_id');
            $table->string('class_name', 100);
            $table->string('class_code', 20)->unique();
            $table->string('teacher_id', 15); // FK tới users.user_id
            $table->foreign('teacher_id')->references('user_id')->on('users')->onDelete('cascade');
            $table->foreignId("major_id")->constrained('majors', "major_id")->onDelete("cascade");
            $table->string('semester', 10);
            $table->string('academic_year', 9);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('classes');
    }
};
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_profiles', function (Blueprint $table) {
            $table->id('user_profile_id');
            $table->string('fullname', 100);
            $table->string('birthdate', 10)->nullable();
            $table->string('phone', 20)->nullable();
            $table->foreignId("major_id")->constrained('majors', "major_id")->onDelete("cascade");
            $table->string('user_id', 15);
            $table->foreign('user_id')->references('user_id')->on('users')->onDelete('cascade');
            $table->string('class_student', 15)->nullable();
            $table->foreignId('class_id')->constrained('classes', 'class_id')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_profiles');
    }
};
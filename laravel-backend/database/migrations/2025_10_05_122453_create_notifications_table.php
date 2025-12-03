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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id('notification_id');
            $table->string('title', 200);
            $table->string('content', 500);
            $table->foreignId("class_id")->constrained("classes", "class_id")->onDelete("cascade");
            $table->foreignId('major_id')->constrained("majors", "major_id")->nullable();
            $table->string('teacher_id', 15);
            $table->foreign('teacher_id')->references('user_id')->on('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
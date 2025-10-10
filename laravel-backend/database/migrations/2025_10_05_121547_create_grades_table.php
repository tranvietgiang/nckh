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
        Schema::create('grades', function (Blueprint $table) {
            $table->id('grade_id');
            $table->foreignId("submission_id")->constrained("submissions", "submission_id")->onDelete("cascade");
            $table->foreignId("teacher_id")->constrained("users", "user_id")->onDelete("cascade");
            $table->double('score')->default(0);
            $table->text('feedback', 500)->nullable();
            $table->timestamp('graded_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('grades');
    }
};
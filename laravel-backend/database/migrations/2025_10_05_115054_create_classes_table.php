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
        Schema::create('classes', function (Blueprint $table) {
            $table->id('class_id');
            $table->string('class_name', 100)->charset('utf8mb4')->collation('utf8mb4_unicode_ci');
            $table->string('class_code', 20);
            $table->foreignId("teacher_id")->constrained("users", "user_id")->onDelete("cascade");
            $table->string('semester', 10)->charset('utf8mb4')->collation('utf8mb4_unicode_ci');
            $table->string('academic_year', 9)->charset('utf8mb4')->collation('utf8mb4_unicode_ci');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('classes');
    }
};
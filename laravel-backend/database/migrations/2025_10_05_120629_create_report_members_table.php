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
        Schema::create('report_members', function (Blueprint $table) {
            $table->id('report_member_id');
            $table->foreignId("report_id")->constrained("reports", "report_id")->onDelete("cascade");
            $table->string("student_id");
            $table->foreign('student_id')->references('user_id')->on('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('report_members');
    }
};
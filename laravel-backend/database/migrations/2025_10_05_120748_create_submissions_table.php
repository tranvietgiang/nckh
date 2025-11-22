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
        Schema::create('submissions', function (Blueprint $table) {
            $table->id('submission_id');
            $table->foreignId("report_id")->constrained("reports", "report_id")->onDelete("cascade");
            $table->string('student_id');
            $table->foreign("student_id")->references('user_id')->on("users")->onDelete("cascade");
            $table->string('version', 50);
            $table->enum('status', ['submitted', 'not_submitted', 'rejected'])->comment('Trạng thái từng phiên bản của đồ án ');
            $table->date('submission_time');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('submissions');
    }
};
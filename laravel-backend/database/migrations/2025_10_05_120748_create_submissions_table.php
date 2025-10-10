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
            $table->foreignId("student_id")->constrained("users", "user_id")->onDelete("cascade");
            $table->string('version', 50);
            $table->enum('status', ['submitted', 'graded', 'rejected'])->comment('Trạng thái từng phiên bản của đồ án ');
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
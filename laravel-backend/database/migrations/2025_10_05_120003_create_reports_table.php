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
        Schema::create('reports', function (Blueprint $table) {
            $table->id('report_id');
            $table->string('report_name', 150);
            $table->text('description', 1000)->nullable();
            $table->foreignId("class_id")->constrained("classes", "class_id")->onDelete("cascade");
            $table->string("teacher_id", 15);
            $table->foreign("teacher_id")->references("user_id")->on("users")->comment("Giáo viên nào nộp")->onDelete("cascade");
            $table->enum('status', ["open", "closed"])->default('open')->comment('Trạng thái của đồ án');
            $table->date('start_date');
            $table->date('end_date');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
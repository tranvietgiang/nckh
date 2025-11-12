<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class SubmissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Lấy tất cả report_id và student_id từ DB
        $reports = DB::table('reports')->pluck('report_id');
        $students = DB::table('users')->pluck('user_id');

        $statuses = ['submitted', 'graded', 'rejected'];

        // Tạo 100 bản ghi mẫu
        for ($i = 0; $i < 100; $i++) {
            DB::table('submissions')->insert([
                'report_id' => $reports->random(),       // chọn ngẫu nhiên report
                'student_id' => $students->random(),    // chọn ngẫu nhiên student
                'version' => 'v' . rand(1, 5),
                'status' => $statuses[array_rand($statuses)],
                'submission_time' => Carbon::now()->subDays(rand(0, 30))->toDateString(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $this->command->info("Seeder submissions chạy xong ✅");
    }
}
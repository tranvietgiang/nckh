<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SubmissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Lấy tất cả report_id
        $reports = DB::table('reports')->pluck('report_id')->toArray();

        // Lấy tất cả sinh viên
        $students = DB::table('users')
            ->where('role', 'student')
            ->pluck('user_id')
            ->toArray();

        $statuses = ['submitted', 'not_submitted', 'rejected'];
        $inserted = [];

        foreach ($students as $studentId) {
            // Shuffle report để đảm bảo không trùng cho cùng sinh viên
            $shuffledReports = $reports;
            shuffle($shuffledReports);

            // Chọn 1 report ngẫu nhiên cho sinh viên này
            $reportId = $shuffledReports[0];

            // Random ngày submission từ năm 2020 đến 2025
            $year = rand(2020, 2025);
            $month = rand(1, 12);
            $day = rand(1, 28); // tránh lỗi ngày > 28
            $submissionTime = Carbon::create($year, $month, $day)->toDateString();

            $inserted[] = [
                'report_id' => $reportId,
                'student_id' => $studentId,
                'version' => 'v' . rand(1, 5),
                'status' => $statuses[array_rand($statuses)],
                'submission_time' => $submissionTime,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        DB::table('submissions')->insert($inserted);

        $this->command->info("Seeder submissions chạy xong ✅ (submission_time random từ 2020 đến 2025)");
    }
}
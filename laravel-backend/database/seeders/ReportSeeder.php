<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportSeeder extends Seeder
{
    public function run(): void
    {
        $reports = [
            [
                'report_name' => 'Chuyên đề web 1',
                'class_id' => 1,
                'status' => 'submitted',
                'start_date' => '2025-01-10',
                'teacher_id' => 'gv001',
                'end_date' => '2025-02-20',
            ],
            [
                'report_name' => 'Chuyên đề photo 1',
                'class_id' => 2,
                'status' => 'graded',
                'teacher_id' => 'gv002',
                'start_date' => '2025-02-01',
                'end_date' => '2025-03-10',
            ],
        ];

        foreach ($reports as &$report) {
            $report['created_at'] = Carbon::now();
            $report['updated_at'] = Carbon::now();
        }

        DB::table('reports')->insert($reports);
    }
}
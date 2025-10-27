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
                'report_name' => 'Đồ án Quản lý sinh viên',
                'description' => 'Xây dựng hệ thống quản lý sinh viên sử dụng Laravel và MySQL.',
                'class_id' => 1,
                'status' => 'submitted',
                'start_date' => '2025-01-10',
                'end_date' => '2025-02-20',
            ],
            [
                'report_name' => 'Hệ thống bán hàng trực tuyến',
                'description' => 'Thiết kế website bán hàng có tích hợp thanh toán trực tuyến.',
                'class_id' => 2,
                'status' => 'graded',
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
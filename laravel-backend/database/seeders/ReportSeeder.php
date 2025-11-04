<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportSeeder extends Seeder
{
    public function run(): void
    {
        $classes = DB::table('classes')->get();
        $reports = [];

        foreach ($classes as $class) {
            $reports[] = [
                'report_name' => 'Báo cáo ' . $class->class_name,
                'class_id' => $class->class_id,
                'teacher_id' => $class->teacher_id,
                'status' => 'submitted',
                'start_date' => '2025-01-10',
                'end_date' => '2025-12-20',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ];
        }

        DB::table('reports')->insert($reports);
    }
}
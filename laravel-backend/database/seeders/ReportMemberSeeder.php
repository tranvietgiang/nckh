<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportMemberSeeder extends Seeder
{
    public function run(): void
    {
        $reports = DB::table('reports')->get();
        $students = DB::table('users')->where('role', 'student')->get();
        $reportMembers = [];

        foreach ($reports as $report) {
            // Lấy ngẫu nhiên 3 sinh viên
            $selectedStudents = $students->random(min(3, $students->count()));

            foreach ($selectedStudents as $index => $student) {
                $reportMembers[] = [
                    'report_id'     => $report->report_id,
                    'student_id'    => $student->user_id,
                    'report_m_role' => $index === 0 ? 'NT' : 'TV', // NT = Nhóm trưởng, TV = Thành viên
                    'rm_code'       => 'RM-' . strtoupper(uniqid()),
                    'created_at'    => Carbon::now(),
                    'updated_at'    => Carbon::now(),
                ];
            }
        }

        DB::table('report_members')->insert($reportMembers);
    }
}
<?php

namespace Database\Seeders;

use App\Models\report_member;
use Illuminate\Database\Seeder;
use App\Models\ReportMember;

class ReportMemberSeeder extends Seeder
{
    public function run(): void
    {
        // Nhóm 1
        // report_member::create([
        //     'rm_name' => 'Nhóm A',
        //     'report_id' => 1,
        //     'report_m_role' => 'NT',
        //     'student_id' => '23211TT1404',
        //     'rm_code' => 1
        // ]);

        report_member::create([
            'rm_name' => 'Nhóm A',
            'report_id' => 1,
            'report_m_role' => 'TV',
            'student_id' => '23211TT0068',
            'rm_code' => 1
        ]);

        // report_member::create([
        //     'rm_name' => 'Nhóm A',
        //     'report_id' => 1,
        //     'report_m_role' => 'TV',
        //     'student_id' => '22211TT2666',
        //     'rm_code' => 1
        // ]);

        // Nhóm 2
        report_member::create([
            'rm_name' => 'Nhóm B',
            'report_id' => 1,
            'report_m_role' => 'NT',
            'student_id' => '23211TT0403',
            'rm_code' => 2
        ]);

        report_member::create([
            'rm_name' => 'Nhóm B',
            'report_id' => 1,
            'report_m_role' => 'TV',
            'student_id' => '22211TT4827',
            'rm_code' => 2
        ]);

        // Nhóm 3
        report_member::create([
            'rm_name' => 'Nhóm C',
            'report_id' => 1,
            'report_m_role' => 'NT',
            'student_id' => '23211TT4312',
            'rm_code' => 3
        ]);

        // Nhóm 4
        report_member::create([
            'rm_name' => 'Nhóm D',
            'report_id' => 1,
            'report_m_role' => 'NT',
            'student_id' => '21211TT3802',
            'rm_code' => 4
        ]);

        // Nhóm 5
        report_member::create([
            'rm_name' => 'Nhóm E',
            'report_id' => 1,
            'report_m_role' => 'NT',
            'student_id' => '23211TT2984',
            'rm_code' => 5
        ]);
    }
}
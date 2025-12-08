<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Major;
use App\Models\Subject;
use App\Models\Classe;
use App\Models\user_profile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class FullSeeder extends Seeder
{
    public function run(): void
    {
        // -----------------------
        // 1. Tạo Majors
        // -----------------------
        $majors = [
            ['major_name' => 'Công nghệ thông tin', 'major_abbreviate' => 'TT'],
            ['major_name' => 'Thiết kế đồ họa', 'major_abbreviate' => 'DH'],
            ['major_name' => 'Ngôn ngữ tiếng Trung', 'major_abbreviate' => 'TQ'],
            ['major_name' => 'Ngôn ngữ tiếng Anh', 'major_abbreviate' => 'TA'],
        ];

        foreach ($majors as $m) {
            Major::updateOrCreate(['major_abbreviate' => $m['major_abbreviate']], $m);
        }

        // -----------------------
        // 2. Tạo Users (giảng viên + admin)
        // -----------------------
        $teachers = [
            ['user_id' => 'gv001', 'email' => 'gv001@tdc.edu.vn', 'password' => 'gv001', 'role' => 'teacher'],
            ['user_id' => 'gv002', 'email' => 'gv002@tdc.edu.vn', 'password' => 'gv002', 'role' => 'teacher'],
            ['user_id' => 'gv003', 'email' => 'gv003@tdc.edu.vn', 'password' => 'gv003', 'role' => 'teacher'],
            ['user_id' => 'gv004', 'email' => 'gv004@tdc.edu.vn', 'password' => 'gv004', 'role' => 'teacher'],
            ['user_id' => 'admin', 'email' => 'admin@tdc.edu.vn', 'password' => '1', 'role' => 'admin'],
        ];

        foreach ($teachers as $t) {
            User::updateOrCreate(
                ['user_id' => $t['user_id']],
                [
                    'email' => $t['email'],
                    'password' => Hash::make($t['password']),
                    'role' => $t['role'],
                ]
            );
        }

        // -----------------------
        // 3. Tạo Subjects (16 môn)
        // -----------------------
        $subjects = [
            // CNTT
            ['subject_name' => 'Mon-CNTT 1', 'subject_code' => 'TT01', 'major_id' => 1],
            ['subject_name' => 'Mon-CNTT 2', 'subject_code' => 'TT02', 'major_id' => 1],
            ['subject_name' => 'Mon-CNTT 3', 'subject_code' => 'TT03', 'major_id' => 1],
            ['subject_name' => 'Mon-CNTT 4', 'subject_code' => 'TT04', 'major_id' => 1],
            // Đồ họa
            ['subject_name' => 'Mon-DH 1', 'subject_code' => 'DH01', 'major_id' => 2],
            ['subject_name' => 'Mon-DH 2', 'subject_code' => 'DH02', 'major_id' => 2],
            ['subject_name' => 'Mon-DH 3', 'subject_code' => 'DH03', 'major_id' => 2],
            ['subject_name' => 'Mon-DH 4', 'subject_code' => 'DH04', 'major_id' => 2],
            // Tiếng Trung
            ['subject_name' => 'Mon-TQ 1', 'subject_code' => 'TQ01', 'major_id' => 3],
            ['subject_name' => 'Mon-TQ 2', 'subject_code' => 'TQ02', 'major_id' => 3],
            ['subject_name' => 'Mon-TQ 3', 'subject_code' => 'TQ03', 'major_id' => 3],
            ['subject_name' => 'Mon-TQ 4', 'subject_code' => 'TQ04', 'major_id' => 3],
            // Tiếng Anh
            ['subject_name' => 'Mon-TA 1', 'subject_code' => 'TA01', 'major_id' => 4],
            ['subject_name' => 'Mon-TA 2', 'subject_code' => 'TA02', 'major_id' => 4],
            ['subject_name' => 'Mon-TA 3', 'subject_code' => 'TA03', 'major_id' => 4],
            ['subject_name' => 'Mon-TA 4', 'subject_code' => 'TA04', 'major_id' => 4],
        ];

        foreach ($subjects as $s) {
            Subject::updateOrCreate(['subject_code' => $s['subject_code']], $s);
        }

        // -----------------------
        // 4. Tạo lớp + user_profile + report
        // -----------------------
        $teachersInfo = [
            ['user_id' => 'gv001', 'fullname' => 'Thầy A', 'birthdate' => '1985-10-15', 'phone' => '0123456799', 'major_id' => 1],
            ['user_id' => 'gv002', 'fullname' => 'Thầy B', 'birthdate' => '1988-02-10', 'phone' => '0123456678', 'major_id' => 2],
            ['user_id' => 'gv003', 'fullname' => 'Thầy C', 'birthdate' => '1990-09-01', 'phone' => '0123456778', 'major_id' => 3],
            ['user_id' => 'gv004', 'fullname' => 'Thầy D', 'birthdate' => '1990-09-01', 'phone' => '0123456788', 'major_id' => 4],
        ];

        foreach ($teachersInfo as $t) {
            $user_id = $t['user_id'];
            $major_id = $t['major_id'];

            // Lấy 4 môn đúng cho ngành
            $subjectsMajor = Subject::where('major_id', $major_id)
                ->orderBy('subject_id') // dùng subject_id đúng
                ->take(4)
                ->get();

            foreach ($subjectsMajor as $index => $subject) {
                $classNumber = $index + 1;

                // Tạo lớp
                $class = Classe::updateOrCreate(
                    ['class_code' => 'cls' . $user_id . $classNumber],
                    [
                        'class_name' => 'Class ' . $classNumber,
                        'teacher_id' => $user_id,
                        'semester' => '1',
                        'academic_year' => '2025-2026',
                        'major_id' => $major_id,
                        'subject_id' => $subject->subject_id,
                    ]
                );

                // Tạo user_profile
                user_profile::updateOrCreate(
                    ['user_id' => $user_id, 'class_id' => $class->class_id],
                    [
                        'fullname' => $t['fullname'],
                        'birthdate' => $t['birthdate'],
                        'phone' => $t['phone'],
                        'major_id' => $major_id,
                    ]
                );

                // Tạo report
                DB::table('reports')->updateOrInsert(
                    ['class_id' => $class->class_id],
                    [
                        'report_name' => 'Báo cáo ' . $class->class_name,
                        'teacher_id' => $user_id,
                        'status' => 'open',
                        'start_date' => '2025-01-10',
                        'end_date' => '2025-12-20',
                        'created_at' => Carbon::now(),
                        'updated_at' => Carbon::now(),
                    ]
                );
            }
        }
    }
}
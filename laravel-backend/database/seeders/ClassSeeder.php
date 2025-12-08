<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Classe;
use App\Models\Subject;
use App\Models\user_profile;
use App\Models\UserProfile;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ClassSeeder extends Seeder
{
    public function run(): void
    {
        $teachersInfo = [
            ['user_id' => 'gv001', 'fullname' => 'Thầy A', 'birthdate' => '1985-10-15', 'phone' => '0123456799', 'major_id' => 1],
            ['user_id' => 'gv002', 'fullname' => 'Thầy B', 'birthdate' => '1988-02-10', 'phone' => '0123456678', 'major_id' => 2],
            ['user_id' => 'gv003', 'fullname' => 'Thầy C', 'birthdate' => '1990-09-01', 'phone' => '0123456778', 'major_id' => 3],
            ['user_id' => 'gv004', 'fullname' => 'Thầy D', 'birthdate' => '1990-09-01', 'phone' => '0123456788', 'major_id' => 4],
        ];

        foreach ($teachersInfo as $t) {
            $user_id = $t['user_id'];
            $major_id = $t['major_id'];

            // Lấy danh sách 4 môn của ngành
            $subjects = Subject::where('major_id', $major_id)->limit(4)->get();

            if ($subjects->count() < 4) {
                throw new \Exception("Major_id $major_id chưa đủ 4 môn để tạo lớp.");
            }

            // Tạo 4 lớp + 4 user_profile + 4 report
            foreach ($subjects as $index => $subject) {
                $classNumber = $index + 1;

                // Tạo class
                $class = Classe::updateOrCreate(
                    ['class_code' => 'cls' . $user_id . $classNumber],
                    [
                        'class_name' => 'Class ' . $classNumber,
                        'teacher_id' => $user_id,
                        'semester' => '1',
                        'academic_year' => '2025-2026',
                        'major_id' => $major_id,
                        'subject_id' => $subject->id,
                    ]
                );

                // Tạo user_profile
                user_profile::updateOrCreate(
                    ['user_id' => $user_id, 'class_id' => $class->id],
                    [
                        'fullname' => $t['fullname'],
                        'birthdate' => $t['birthdate'],
                        'phone' => $t['phone'],
                        'major_id' => $major_id,
                    ]
                );

                // Tạo report
                DB::table('reports')->updateOrInsert(
                    ['class_id' => $class->id],
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
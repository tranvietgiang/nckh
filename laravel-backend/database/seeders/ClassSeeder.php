<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Classe;
use App\Models\Major;
use App\Models\user_profile;

class ClassSeeder extends Seeder
{
    public function run(): void
    {


        Major::create([
            'major_name' => 'Công nghệ thông tin',
            'major_abbreviate' => 'CNTT',
        ]);

        Major::create([
            'major_name' => 'Dồ hoạ',
            'major_abbreviate' => 'DH',
        ]);

        Classe::create([
            'class_name' => 'Chuyên đề web 1',
            'class_code' => '1',
            'teacher_id' => 'gv001',
            'semester' => '1',
            'academic_year' => '2025-2026',
            "major_id" => "1"
        ]);

        Classe::create([
            'class_name' => 'Đồ họa 1',
            'class_code' => '2',
            'teacher_id' => 'gv002',
            'semester' => '1',
            'academic_year' => '2025-2026',
            "major_id" => "1"
        ]);


        Classe::create([
            'class_name' => 'Đồ họa 1',
            'class_code' => '3',
            'teacher_id' => 'gv001',
            'semester' => '1',
            'academic_year' => '2025-2026',
            "major_id" => "2"
        ]);

        // Tạo giáo viên, gắn với lớp đầu tiên
        user_profile::create([
            'fullname' => 'Phan Thanh Nhuần',
            'birthdate' => '2025-10-15',
            'phone' => '012345678',
            'user_id' => 'gv001',
            'class_id' => 1,
            "major_id" => 1
        ]);

        user_profile::create([
            'fullname' => 'Phan Thanh Nhuần',
            'birthdate' => '15/10/2025',
            'phone' => '012345678',
            'user_id' => 'gv001',
            'class_id' => 1,
            "major_id" => 2
        ]);

        user_profile::create([
            'fullname' => 'Nguyễn văn A',
            'birthdate' => '15/10/2025',
            'phone' => '012345678',
            'user_id' => 'gv002',
            'class_id' => 2,
            "major_id" => 2
        ]);

        // Danh sách 10 lớp học
        $classes = [
            ['class_name' => 'Chuyên đề Web 1', 'class_code' => 'WEB1', 'semester' => '1'],
            ['class_name' => 'Chuyên đề Web 2', 'class_code' => 'WEB2', 'semester' => '2'],
            ['class_name' => 'Lập trình PHP cơ bản', 'class_code' => 'PHPB', 'semester' => '1'],
            ['class_name' => 'Lập trình PHP nâng cao', 'class_code' => 'PHPA', 'semester' => '2'],
            ['class_name' => 'Phát triển ứng dụng React', 'class_code' => 'REACT', 'semester' => '1'],
            ['class_name' => 'Cơ sở dữ liệu nâng cao', 'class_code' => 'DBA', 'semester' => '2'],
            ['class_name' => 'Lập trình Python cơ bản', 'class_code' => 'PY1', 'semester' => '1'],
            ['class_name' => 'Phân tích hệ thống', 'class_code' => 'SYS1', 'semester' => '2'],
            ['class_name' => 'Trí tuệ nhân tạo nhập môn', 'class_code' => 'AI1', 'semester' => '1'],
            ['class_name' => 'Phát triển phần mềm nhóm', 'class_code' => 'TEAM', 'semester' => '2'],
        ];

        foreach ($classes as $class) {
            Classe::create([
                'class_name' => $class['class_name'],
                'class_code' => $class['class_code'],
                'teacher_id' => 'gv001', 
                'semester' => $class['semester'],
                'academic_year' => '2025-2026',
                'major_id' => 1,
            ]);
        }
    }
}

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
            'major_abbreviate' => 'cntt',
        ]);

        Major::create([
            'major_name' => 'Dồ hoạ',
            'major_abbreviate' => 'dh',
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
            'fullname' => 'Nguyễn văn A',
            'birthdate' => '15/10/2025',
            'phone' => '012345678',
            'user_id' => 'gv002',
            'class_id' => 2,
            "major_id" => 2
        ]);

       
    }
}
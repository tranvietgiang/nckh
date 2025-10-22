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

        Classe::create([
            'class_name' => 'Chuyên đề web 1',
            'class_code' => '20',
            'teacher_id' => 'gv001',
            'semester' => '1',
            'academic_year' => '2025-2026',
            "major_id" => "1"
        ]);

        user_profile::create([
            'fullname' => 'Phan Thanh Nhuần',
            'birthdate' => '15/10/2025',
            'phone' => '012345678',
            'user_id' => 'gv001',
            'class_id' => 1,
            "major_id" => 1
        ]);
    }
}
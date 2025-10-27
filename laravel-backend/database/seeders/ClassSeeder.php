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
    }
}

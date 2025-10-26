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

        // Danh sách 10 lớp học
        $classes = [
            ['class_name' => 'Chuyên đề Web 1', 'class_code' => 'WEB1', 'semester' => '1'],
            ['class_name' => 'Chuyên đề Web 2', 'class_code' => 'WEB2', 'semester' => '2'],
            ['class_name' => 'CMS', 'class_code' => 'REACT', 'semester' => '1'],
            ['class_name' => 'Cơ sở dữ liệu nâng cao', 'class_code' => 'DBA', 'semester' => '2'],
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
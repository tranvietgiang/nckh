<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Classe;

class ClassSeeder extends Seeder
{
    public function run(): void
    {
        $classes = [
            ['class_name' => 'Class1', 'class_code' => 'cls01', 'teacher_id' => 'gv001', 'semester' => '1', 'academic_year' => '2025-2026', 'major_id' => 1, 'subject_id' => 1],
            ['class_name' => 'Class2', 'class_code' => 'cls02', 'teacher_id' => 'gv002', 'semester' => '1', 'academic_year' => '2025-2026', 'major_id' => 2, 'subject_id' => 2],
            ['class_name' => 'Class3', 'class_code' => 'cls03', 'teacher_id' => 'gv003', 'semester' => '1', 'academic_year' => '2025-2026', 'major_id' => 3, 'subject_id' => 3],
            ['class_name' => 'Class4', 'class_code' => 'cls04', 'teacher_id' => 'gv004', 'semester' => '1', 'academic_year' => '2025-2026', 'major_id' => 4, 'subject_id' => 4],
        ];

        foreach ($classes as $c) {
            Classe::updateOrCreate(['class_code' => $c['class_code']], $c);
        }
    }
}
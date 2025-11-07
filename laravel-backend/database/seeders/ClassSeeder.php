<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Classe;

class ClassSeeder extends Seeder
{
    public function run(): void
    {
        $classes = [
            ['class_name' => 'Web 1', 'class_code' => 'CD1', 'teacher_id' => 'gv001', 'semester' => '1', 'academic_year' => '2025-2026', 'major_id' => 1, 'subject_id' => 1],
            ['class_name' => 'Web 2', 'class_code' => 'CD2', 'teacher_id' => 'gv002', 'semester' => '2', 'academic_year' => '2025-2026', 'major_id' => 1, 'subject_id' => 2],
            ['class_name' => 'CMS', 'class_code' => 'CMS', 'teacher_id' => 'gv003', 'semester' => '2', 'academic_year' => '2025-2026', 'major_id' => 1, 'subject_id' => 3],
            ['class_name' => 'Đồ họa cơ bản', 'class_code' => 'DH1', 'teacher_id' => 'gv002', 'semester' => '1', 'academic_year' => '2025-2026', 'major_id' => 2, 'subject_id' => 5],
            ['class_name' => 'Thiết kế giao diện', 'class_code' => 'DH2', 'teacher_id' => 'gv001', 'semester' => '2', 'academic_year' => '2025-2026', 'major_id' => 2, 'subject_id' => 6],
        ];

        foreach ($classes as $c) {
            Classe::updateOrCreate(
                ['class_code' => $c['class_code']], // tránh trùng mã lớp
                $c
            );
        }
    }
}
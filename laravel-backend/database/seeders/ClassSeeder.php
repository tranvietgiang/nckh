<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Classe;

class ClassSeeder extends Seeder
{
    public function run(): void
    {
        $classes = [
            // === CNTT (5 lớp - dạy xen GV CNTT & Đồ họa) ===
            ['class_name' => 'Web 1', 'class_code' => 'CD1', 'teacher_id' => 'gv001', 'semester' => '1', 'academic_year' => '2025-2026', 'major_id' => 1],
            ['class_name' => 'Web 2', 'class_code' => 'CD2', 'teacher_id' => 'gv002', 'semester' => '2', 'academic_year' => '2025-2026', 'major_id' => 1],
            ['class_name' => 'cms', 'class_code' => 'cms', 'teacher_id' => 'gv003', 'semester' => '2', 'academic_year' => '2025-2026', 'major_id' => 1],

            // === Đồ họa (5 lớp - xen GV Đồ họa & CNTT) ===
            ['class_name' => 'Đồ họa cơ bản', 'class_code' => 'DH1', 'teacher_id' => 'gv002', 'semester' => '1', 'academic_year' => '2025-2026', 'major_id' => 2],
            ['class_name' => 'Thiết kế giao diện', 'class_code' => 'DH2', 'teacher_id' => 'gv001', 'semester' => '2', 'academic_year' => '2025-2026', 'major_id' => 2],

            // === Tiếng Trung (5 lớp - xen GV Trung & Anh) ===
            ['class_name' => 'Trung cơ bản 1', 'class_code' => 'TQ1', 'teacher_id' => 'gv005', 'semester' => '1', 'academic_year' => '2025-2026', 'major_id' => 3],
            ['class_name' => 'Trung cơ bản 2', 'class_code' => 'TQ2', 'teacher_id' => 'gv006', 'semester' => '2', 'academic_year' => '2025-2026', 'major_id' => 3],


            // === Tiếng Anh (5 lớp - xen GV Anh & Trung) ===
            ['class_name' => 'English Basic 1', 'class_code' => 'TA1', 'teacher_id' => 'gv006', 'semester' => '1', 'academic_year' => '2025-2026', 'major_id' => 4],
            ['class_name' => 'English Basic 2', 'class_code' => 'TA2', 'teacher_id' => 'gv005', 'semester' => '2', 'academic_year' => '2025-2026', 'major_id' => 4],

        ];

        foreach ($classes as $c) {
            Classe::updateOrCreate(['class_code' => $c['class_code']], $c);
        }
    }
}
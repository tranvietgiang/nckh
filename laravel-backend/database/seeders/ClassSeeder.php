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
            ['class_name' => 'Mobile', 'class_code' => 'MB1', 'teacher_id' => 'gv003', 'semester' => '1', 'academic_year' => '2025-2026', 'major_id' => 1],
            ['class_name' => 'CSDL', 'class_code' => 'CSDL1', 'teacher_id' => 'gv004', 'semester' => '2', 'academic_year' => '2025-2026', 'major_id' => 1],
            ['class_name' => 'Mạng máy tính', 'class_code' => 'MMT1', 'teacher_id' => 'gv001', 'semester' => '1', 'academic_year' => '2025-2026', 'major_id' => 1],

            // === Đồ họa (5 lớp - xen GV Đồ họa & CNTT) ===
            ['class_name' => 'Đồ họa cơ bản', 'class_code' => 'DH1', 'teacher_id' => 'gv002', 'semester' => '1', 'academic_year' => '2025-2026', 'major_id' => 2],
            ['class_name' => 'Thiết kế giao diện', 'class_code' => 'DH2', 'teacher_id' => 'gv001', 'semester' => '2', 'academic_year' => '2025-2026', 'major_id' => 2],
            ['class_name' => '3D Modeling', 'class_code' => 'DH3', 'teacher_id' => 'gv003', 'semester' => '1', 'academic_year' => '2025-2026', 'major_id' => 2],
            ['class_name' => 'Photoshop nâng cao', 'class_code' => 'DH4', 'teacher_id' => 'gv004', 'semester' => '2', 'academic_year' => '2025-2026', 'major_id' => 2],
            ['class_name' => 'Video Editing', 'class_code' => 'DH5', 'teacher_id' => 'gv002', 'semester' => '1', 'academic_year' => '2025-2026', 'major_id' => 2],

            // === Tiếng Trung (5 lớp - xen GV Trung & Anh) ===
            ['class_name' => 'Trung cơ bản 1', 'class_code' => 'TQ1', 'teacher_id' => 'gv005', 'semester' => '1', 'academic_year' => '2025-2026', 'major_id' => 3],
            ['class_name' => 'Trung cơ bản 2', 'class_code' => 'TQ2', 'teacher_id' => 'gv006', 'semester' => '2', 'academic_year' => '2025-2026', 'major_id' => 3],
            ['class_name' => 'Phiên dịch 1', 'class_code' => 'TQ3', 'teacher_id' => 'gv005', 'semester' => '1', 'academic_year' => '2025-2026', 'major_id' => 3],
            ['class_name' => 'Nghe nói Trung', 'class_code' => 'TQ4', 'teacher_id' => 'gv006', 'semester' => '2', 'academic_year' => '2025-2026', 'major_id' => 3],
            ['class_name' => 'Văn hóa Trung Hoa', 'class_code' => 'TQ5', 'teacher_id' => 'gv005', 'semester' => '1', 'academic_year' => '2025-2026', 'major_id' => 3],

            // === Tiếng Anh (5 lớp - xen GV Anh & Trung) ===
            ['class_name' => 'English Basic 1', 'class_code' => 'TA1', 'teacher_id' => 'gv006', 'semester' => '1', 'academic_year' => '2025-2026', 'major_id' => 4],
            ['class_name' => 'English Basic 2', 'class_code' => 'TA2', 'teacher_id' => 'gv005', 'semester' => '2', 'academic_year' => '2025-2026', 'major_id' => 4],
            ['class_name' => 'Business English', 'class_code' => 'TA3', 'teacher_id' => 'gv006', 'semester' => '1', 'academic_year' => '2025-2026', 'major_id' => 4],
            ['class_name' => 'Translation Skills', 'class_code' => 'TA4', 'teacher_id' => 'gv005', 'semester' => '2', 'academic_year' => '2025-2026', 'major_id' => 4],
            ['class_name' => 'IELTS Practice', 'class_code' => 'TA5', 'teacher_id' => 'gv006', 'semester' => '1', 'academic_year' => '2025-2026', 'major_id' => 4],
        ];

        foreach ($classes as $c) {
            Classe::updateOrCreate(['class_code' => $c['class_code']], $c);
        }
    }
}
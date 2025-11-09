<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Subject;

class SubjectSeeder extends Seeder
{
    public function run(): void
    {
        $subjects = [
            // === Ngành Công nghệ thông tin (major_id = 1) ===
            [
                'subject_name' => 'Lập trình C cơ bản',
                'subject_code' => 'TT101',
                'major_id'     => 1,
            ],
            [
                'subject_name' => 'Cấu trúc dữ liệu & Giải thuật',
                'subject_code' => 'TT102',
                'major_id'     => 1,
            ],
            [
                'subject_name' => 'Lập trình hướng đối tượng với Java',
                'subject_code' => 'TT103',
                'major_id'     => 1,
            ],
            [
                'subject_name' => 'Thiết kế Web cơ bản (HTML, CSS, JS)',
                'subject_code' => 'TT104',
                'major_id'     => 1,
            ],

            // === Ngành Thiết kế đồ họa (major_id = 2) ===
            [
                'subject_name' => 'Đồ họa cơ bản với Photoshop',
                'subject_code' => 'DH201',
                'major_id'     => 2,
            ],
            [
                'subject_name' => 'Thiết kế giao diện Web & App',
                'subject_code' => 'DH202',
                'major_id'     => 2,
            ],
            [
                'subject_name' => 'Mỹ thuật đa phương tiện',
                'subject_code' => 'DH203',
                'major_id'     => 2,
            ],

            // === Ngành Ngôn ngữ tiếng Trung (major_id = 3) ===
            [
                'subject_name' => 'Tiếng Trung cơ bản 1',
                'subject_code' => 'TQ301',
                'major_id'     => 3,
            ],
            [
                'subject_name' => 'Tiếng Trung cơ bản 2',
                'subject_code' => 'TQ302',
                'major_id'     => 3,
            ],
            [
                'subject_name' => 'Nghe – Nói tiếng Trung',
                'subject_code' => 'TQ303',
                'major_id'     => 3,
            ],

            // === Ngành Ngôn ngữ tiếng Anh (major_id = 4) ===
            [
                'subject_name' => 'English Basic 1',
                'subject_code' => 'TA401',
                'major_id'     => 4,
            ],
            [
                'subject_name' => 'English Basic 2',
                'subject_code' => 'TA402',
                'major_id'     => 4,
            ],
            [
                'subject_name' => 'English for Communication',
                'subject_code' => 'TA403',
                'major_id'     => 4,
            ],
        ];

        foreach ($subjects as $subject) {
            Subject::updateOrCreate(
                [
                    'subject_code' => $subject['subject_code'], // kiểm tra trùng theo mã môn
                ],
                $subject
            );
        }
    }
}
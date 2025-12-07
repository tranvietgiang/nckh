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
                'subject_name' => 'Mon-CNTT 1',
                'subject_code' => 'TT01',
                'major_id'     => 1,
            ],
            [
                'subject_name' => 'Mon-CNTT 2',
                'subject_code' => 'TT02',
                'major_id'     => 1,
            ],
            [
                'subject_name' => 'Mon-CNTT 3',
                'subject_code' => 'TT03',
                'major_id'     => 1,
            ],
            [
                'subject_name' => 'Mon-CNTT 3',
                'subject_code' => 'TT04',
                'major_id'     => 1,
            ],

            // === Ngành Thiết kế đồ họa (major_id = 2) ===
            [
                'subject_name' => 'Mon-DH 1',
                'subject_code' => 'DH01',
                'major_id'     => 2,
            ],
            [
                'subject_name' => 'Mon-DH 2',
                'subject_code' => 'DH02',
                'major_id'     => 2,
            ],
            [
                'subject_name' => 'Mon-DH 3',
                'subject_code' => 'DH03',
                'major_id'     => 2,
            ],

            // === Ngành Ngôn ngữ tiếng Trung (major_id = 3) ===
            [
                'subject_name' => 'Mon-TQ 1',
                'subject_code' => 'TQ01',
                'major_id'     => 3,
            ],
            [
                'subject_name' => 'Mon-TQ 2',
                'subject_code' => 'TQ02',
                'major_id'     => 3,
            ],
            [
                'subject_name' => 'Mon-TQ 3',
                'subject_code' => 'TQ03',
                'major_id'     => 3,
            ],

            // === Ngành Ngôn ngữ tiếng Anh (major_id = 4) ===
            [
                'subject_name' => 'Mon-TA 1',
                'subject_code' => 'TA01',
                'major_id'     => 4,
            ],
            [
                'subject_name' => 'Mon-TA 2',
                'subject_code' => 'TA02',
                'major_id'     => 4,
            ],
            [
                'subject_name' => 'Mon-TA 3',
                'subject_code' => 'TA03',
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
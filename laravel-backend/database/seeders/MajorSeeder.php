<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Major;

class MajorSeeder extends Seeder
{
    public function run(): void
    {
        $majors = [
            ['major_name' => 'Công nghệ thông tin', 'major_abbreviate' => 'TT'],
            ['major_name' => 'Thiết kế đồ họa', 'major_abbreviate' => 'DH'],
            ['major_name' => 'Ngôn ngữ tiếng Trung', 'major_abbreviate' => 'TQ'],
            ['major_name' => 'Ngôn ngữ tiếng Anh', 'major_abbreviate' => 'TA'],
        ];

        foreach ($majors as $m) {
            Major::updateOrCreate(['major_abbreviate' => $m['major_abbreviate']], $m);
        }
    }
}
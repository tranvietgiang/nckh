<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Classe;

class ClassSeeder extends Seeder
{
    public function run(): void
    {
        Classe::create([
            'class_name' => 'Chuyên đề web 2',
            'class_code' => '20',
            'teacher_id' => '23211TT1404',
            'semester' => '1',
            'academic_year' => '2025-2026',
        ]);
        Classe::create([
        'class_name' => 'Lập trình PHP nâng cao',
        'class_code' => '21',
        'teacher_id' => '23211TT1404',
        'semester' => '2',
        'academic_year' => '2025-2026',
    ]);
    }
}
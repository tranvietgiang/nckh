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
            'teacher_id' => 'gv001',
            'semester' => '1',
            'academic_year' => '2025-2026',
        ]);
    }
}
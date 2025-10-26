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

        Classe::create([
            'class_name' => 'Chuyên đề Web 1',
            'class_code' => 'WEB1',
            "teacher_id" => "gv001",
            "major_id" => 1,
            "semester" => 1,
            "academic_year" => '2025-2026'
        ]);

        Classe::create([
            'class_name' => 'Chuyên đề Web 1',
            'class_code' => 'WEB2',
            "teacher_id" => "gv002",
            "major_id" => 1,
            "semester" => 1,
            "academic_year" => '2025-2026'
        ]);

        Classe::create([
            'class_name' => 'DH1',
            'class_code' => 'dh1',
            "teacher_id" => "gv001",
            "major_id" => 2,
            "semester" => 1,
            "academic_year" => "2025-2026"
        ]);
    }
}
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Classe;
use App\Models\Major;

class MajorSeeder extends Seeder
{
    public function run(): void
    {
        Major::create([
            'major_name' => 'Công nghệ thông tin',
            'major_abbreviate' => 'cntt',
        ]);

        Major::create([
            'major_name' => 'Đồ họa',
            'major_abbreviate' => 'dh',
        ]);
    }
}
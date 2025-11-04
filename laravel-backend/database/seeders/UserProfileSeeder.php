<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\user_profile;

class UserProfileSeeder extends Seeder
{
    public function run(): void
    {
        // Tạo giáo viên, gắn với lớp đầu tiên
        user_profile::create([
            'fullname' => 'Phan Thanh Nhuần',
            'birthdate' => '2025-10-15',
            'phone' => '012345678',
            'user_id' => 'gv001',
            'class_id' => 1,
            "major_id" => 1
        ]);

        user_profile::create([
            'fullname' => 'Nguyễn văn A',
            'birthdate' => '15/10/2025',
            'phone' => '011345678',
            'user_id' => 'gv002',
            'class_id' => 2,
            "major_id" => 2
        ]);
    }
}
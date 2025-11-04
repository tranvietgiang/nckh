<?php

namespace Database\Seeders;

use App\Models\user_profile;
use Illuminate\Database\Seeder;
use App\Models\UserProfile;

class UserProfileSeeder extends Seeder
{
    public function run(): void
    {
        $teacherProfiles = [
            // === Phan Thanh Nhuần (gv001) - dạy 3 lớp ===
            ['fullname' => 'Phan Thanh Nhuần', 'birthdate' => '1985-10-15', 'phone' => '0901111111', 'user_id' => 'gv001', 'class_id' => 1, 'major_id' => 1],  // Web 1
            ['fullname' => 'Phan Thanh Nhuần', 'birthdate' => '1985-10-15', 'phone' => '0901111111', 'user_id' => 'gv001', 'class_id' => 5, 'major_id' => 1],  // Mạng máy tính
            ['fullname' => 'Phan Thanh Nhuần', 'birthdate' => '1985-10-15', 'phone' => '0901111111', 'user_id' => 'gv001', 'class_id' => 7, 'major_id' => 2],  // Thiết kế giao diện

            // === Nguyễn Văn B (gv002) - dạy 3 lớp ===
            ['fullname' => 'Nguyễn Văn B', 'birthdate' => '1988-02-10', 'phone' => '0902222222', 'user_id' => 'gv002', 'class_id' => 2, 'major_id' => 1],  // Web 2
            ['fullname' => 'Nguyễn Văn B', 'birthdate' => '1988-02-10', 'phone' => '0902222222', 'user_id' => 'gv002', 'class_id' => 6, 'major_id' => 2],  // Đồ họa cơ bản
            ['fullname' => 'Nguyễn Văn B', 'birthdate' => '1988-02-10', 'phone' => '0902222222', 'user_id' => 'gv002', 'class_id' => 10, 'major_id' => 2], // Video Editing

            // === Nguyễn Văn C (gv003) - dạy 2 lớp ===
            ['fullname' => 'Nguyễn Văn C', 'birthdate' => '1984-07-22', 'phone' => '0903333333', 'user_id' => 'gv003', 'class_id' => 3, 'major_id' => 1],  // Mobile
            ['fullname' => 'Nguyễn Văn C', 'birthdate' => '1984-07-22', 'phone' => '0903333333', 'user_id' => 'gv003', 'class_id' => 8, 'major_id' => 2],  // 3D Modeling

            // === Nguyễn Văn D (gv004) - dạy 2 lớp ===
            ['fullname' => 'Nguyễn Văn D', 'birthdate' => '1987-03-09', 'phone' => '0904444444', 'user_id' => 'gv004', 'class_id' => 4, 'major_id' => 1],  // CSDL
            ['fullname' => 'Nguyễn Văn D', 'birthdate' => '1987-03-09', 'phone' => '0904444444', 'user_id' => 'gv004', 'class_id' => 9, 'major_id' => 2],  // Photoshop nâng cao

            // === Trần Thị Mai (gv005) - dạy 4 lớp ===
            ['fullname' => 'Trần Thị Mai', 'birthdate' => '1990-09-01', 'phone' => '0905555555', 'user_id' => 'gv005', 'class_id' => 11, 'major_id' => 3], // Trung cơ bản 1
            ['fullname' => 'Trần Thị Mai', 'birthdate' => '1990-09-01', 'phone' => '0905555555', 'user_id' => 'gv005', 'class_id' => 13, 'major_id' => 3], // Phiên dịch 1
            ['fullname' => 'Trần Thị Mai', 'birthdate' => '1990-09-01', 'phone' => '0905555555', 'user_id' => 'gv005', 'class_id' => 15, 'major_id' => 3], // Văn hóa Trung Hoa
            ['fullname' => 'Trần Thị Mai', 'birthdate' => '1990-09-01', 'phone' => '0905555555', 'user_id' => 'gv005', 'class_id' => 17, 'major_id' => 4], // English Basic 2
            ['fullname' => 'Trần Thị Mai', 'birthdate' => '1990-09-01', 'phone' => '0905555555', 'user_id' => 'gv005', 'class_id' => 19, 'major_id' => 4], // Translation Skills

            // === Nguyễn Hồng Phúc (gv006) - dạy 4 lớp ===
            ['fullname' => 'Nguyễn Hồng Phúc', 'birthdate' => '1989-05-23', 'phone' => '0906666666', 'user_id' => 'gv006', 'class_id' => 12, 'major_id' => 3], // Trung cơ bản 2
            ['fullname' => 'Nguyễn Hồng Phúc', 'birthdate' => '1989-05-23', 'phone' => '0906666666', 'user_id' => 'gv006', 'class_id' => 14, 'major_id' => 3], // Nghe nói Trung
            ['fullname' => 'Nguyễn Hồng Phúc', 'birthdate' => '1989-05-23', 'phone' => '0906666666', 'user_id' => 'gv006', 'class_id' => 16, 'major_id' => 4], // English Basic 1
            ['fullname' => 'Nguyễn Hồng Phúc', 'birthdate' => '1989-05-23', 'phone' => '0906666666', 'user_id' => 'gv006', 'class_id' => 18, 'major_id' => 4], // Business English
            ['fullname' => 'Nguyễn Hồng Phúc', 'birthdate' => '1989-05-23', 'phone' => '0906666666', 'user_id' => 'gv006', 'class_id' => 20, 'major_id' => 4], // IELTS Practice
        ];

        foreach ($teacherProfiles as $profile) {
            user_profile::updateOrCreate(
                [
                    'user_id' => $profile['user_id'],
                    'class_id' => $profile['class_id'],
                ],
                $profile
            );
        }
    }
}
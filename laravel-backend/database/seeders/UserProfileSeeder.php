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
            // === gv001 - Phan Thanh Nhuần (CNTT) ===
            [
                'fullname'     => 'Phan Thanh Nhuần',
                'birthdate'    => '1985-10-15',
                'phone'        => '0901111111',
                'user_id'      => 'gv001',
                'class_id'     => 1, // Web 1
                'major_id'     => 1,
            ],
            [
                'fullname'     => 'Phan Thanh Nhuần',
                'birthdate'    => '1985-10-15',
                'phone'        => '0901111111',
                'user_id'      => 'gv001',
                'class_id'     => 5, // Thiết kế giao diện (Đồ họa)
                'major_id'     => 2,
            ],

            // === gv002 - Nguyễn Văn A (CNTT + Đồ họa) ===
            [
                'fullname'     => 'Nguyễn Văn A',
                'birthdate'    => '1988-02-10',
                'phone'        => '0902222222',
                'user_id'      => 'gv002',
                'class_id'     => 2, // Web 2
                'major_id'     => 1,
            ],
            [
                'fullname'     => 'Nguyễn Văn A',
                'birthdate'    => '1988-02-10',
                'phone'        => '0902222222',
                'user_id'      => 'gv002',
                'class_id'     => 4, // Đồ họa cơ bản
                'major_id'     => 2,
            ],

            // === gv003 - Nguyễn Văn B (CNTT) ===
            [
                'fullname'     => 'Nguyễn Văn B',
                'birthdate'    => '1984-07-22',
                'phone'        => '0903333333',
                'user_id'      => 'gv003',
                'class_id'     => 3, // CMS
                'major_id'     => 1,
            ],

            // === gv005 - Trần Thị Mai (Ngôn ngữ Trung + Anh) ===
            [
                'fullname'     => 'Trần Thị Mai',
                'birthdate'    => '1990-09-01',
                'phone'        => '0905555555',
                'user_id'      => 'gv005',
                'class_id'     => 7, // Trung cơ bản 1
                'major_id'     => 3,
            ],
            [
                'fullname'     => 'Trần Thị Mai',
                'birthdate'    => '1990-09-01',
                'phone'        => '0905555555',
                'user_id'      => 'gv005',
                'class_id'     => 9, // English Basic 2
                'major_id'     => 4,
            ],

            // === gv006 - Nguyễn Hồng Phúc (Ngôn ngữ Trung + Anh) ===
            [
                'fullname'     => 'Nguyễn Hồng Phúc',
                'birthdate'    => '1989-05-23',
                'phone'        => '0906666666',
                'user_id'      => 'gv006',
                'class_id'     => 6, // Trung cơ bản 2
                'major_id'     => 3,
            ],
            [
                'fullname'     => 'Nguyễn Hồng Phúc',
                'birthdate'    => '1989-05-23',
                'phone'        => '0906666666',
                'user_id'      => 'gv006',
                'class_id'     => 8, // English Basic 1
                'major_id'     => 4,
            ],
        ];

        foreach ($teacherProfiles as $profile) {
            user_profile::updateOrCreate(
                [
                    'user_id'  => $profile['user_id'],
                    'class_id' => $profile['class_id'],
                ],
                $profile
            );
        }
    }
}
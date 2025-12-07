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
                'fullname'     => 'Thay A',
                'birthdate'    => '1985-10-15',
                'phone'        => '0123456799',
                'user_id'      => 'gv001',
                'class_id'     => 1,
                'major_id'     => 1,
            ],


            // === gv002 - Nguyễn Văn A (CNTT + Đồ họa) ===
            [
                'fullname'     => 'Thay B',
                'birthdate'    => '1988-02-10',
                'phone'        => '0123456678',
                'user_id'      => 'gv002',
                'class_id'     => 2,
                'major_id'     => 2,
            ],


            // === gv004 - Trần Thị Mai (Anh) ===
            [
                'fullname'     => 'Thay C',
                'birthdate'    => '1990-09-01',
                'phone'        => '0123456778',
                'user_id'      => 'gv003',
                'class_id'     => 3,
                'major_id'     => 3,
            ],
            // === gv005 - Trần Thị Mai (Ngôn ngữ Trung) ===
            [
                'fullname'     => 'Thay D',
                'birthdate'    => '1990-09-01',
                'phone'        => '0123456788',
                'user_id'      => 'gv004',
                'class_id'     => 4,
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
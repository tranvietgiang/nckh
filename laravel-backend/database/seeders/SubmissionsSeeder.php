<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class SubmissionsSeeder extends Seeder
{
    public function run(): void
    {
        $studentIds = [
            '23211TT3144', '23211TT1404', '22211TT2666', '23211TT0403', '22211TT4827',
            '23211TT4312', '21211TT3802', '23211TT3424', '23211TT1158', '22211TT3455',
            '23211TT0068', '22211TT2183', '23211TT0659', '22211TT3957', '21211TT4824',
            '23211TT0087', '21211TT4493', '23211TT0774', '22211TT3655', '23211TT2438',
            '21211TT1402', '22211TT0255', '23211TT4636', '22211TT3094', '23211TT4524',
            '23211TT0564', '23211TT4445', '22211TT3477', '23211TT0653', '23211TT0388'
        ];

        $statuses = ['submitted', 'graded', 'rejected'];

        foreach ($studentIds as $studentId) {
            // ✅ Đảm bảo user tồn tại
            DB::table('users')->updateOrInsert(
                ['user_id' => $studentId],
                [
                    'email' => $studentId . '@example.com',
                    'password' => Hash::make('123456'),
                    'role' => 'student',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );

            // ✅ Tạo bản ghi submissions
            DB::table('submissions')->insert([
                'report_id' => rand(1, 5),
                'student_id' => $studentId,
                'version' => 'v' . rand(1, 3) . '.0',
                'status' => $statuses[array_rand($statuses)],
                'submission_time' => Carbon::now()->subDays(rand(0, 30))->format('Y-m-d'),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}

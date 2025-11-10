<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $teachers = [
            ['user_id' => 'gv001', 'email' => 'gv001@tdc.edu.vn', 'password' => 'gv001', 'role' => 'teacher'],
            ['user_id' => 'gv002', 'email' => 'gv002@tdc.edu.vn', 'password' => 'gv002', 'role' => 'teacher'],
            ['user_id' => 'gv003', 'email' => 'gv003@tdc.edu.vn', 'password' => 'gv003', 'role' => 'teacher'],
            ['user_id' => 'gv004', 'email' => 'gv004@tdc.edu.vn', 'password' => 'gv004', 'role' => 'teacher'],
            ['user_id' => 'gv005', 'email' => 'gv005@tdc.edu.vn', 'password' => 'gv005', 'role' => 'teacher'],
            ['user_id' => 'gv006', 'email' => 'gv006@tdc.edu.vn', 'password' => 'gv006', 'role' => 'teacher'],
            ['user_id' => 'admin', 'email' => 'admin@tdc.edu.vn', 'password' => '1', 'role' => 'admin'],
        ];

        foreach ($teachers as $teacher) {
            User::create([
                'user_id' => $teacher['user_id'],
                'email' => $teacher['email'],
                'password' => Hash::make($teacher['password']),
                'role' => $teacher['role'],
            ]);
        }

        User::create([
            'user_id' => '23211TT2222',
            'email' => 'wedgiang@gmail.com',
            'password' => Hash::make('23211TT2222'),
            'role' => 'student',
        ]);
    }
}
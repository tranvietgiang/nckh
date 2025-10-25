<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'user_id' => 'admin',
            'email' => 'admin@tdc.edu.vn',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
        ]);

        User::create([
            'user_id' => 'gv001',
            'email' => 'gv001@tdc.edu.vn',
            'password' => Hash::make('gv001'),
            'role' => 'teacher',
        ]);
        User::create([
            'user_id' => 'gv002',
            'email' => 'gv002@tdc.edu.vn',
            'password' => Hash::make('gv002'),
            'role' => 'teacher',
        ]);
        User::create([
            'user_id' => '23211TT0659',
            'email' => '23211TT0659@mail.tdc.edu.vn',
            'password' => Hash::make('123456'),
            'role' => 'student',
        ]);
    }
}
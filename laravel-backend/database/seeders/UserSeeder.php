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
            'password' => Hash::make('1'),
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
    }
}
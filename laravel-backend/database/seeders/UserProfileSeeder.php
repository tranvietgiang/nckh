<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\user_profile;

class user_profileSeeder extends Seeder
{
    public function run(): void
    {

        user_profile::create([
            'fullname' => 'Phan Thanh Nhuần',
            'birthdate' => '2005-02-10',
            'phone' => '0912345678',
            'user_id' => 'gv001',
            'class_id' => 1,
        ]);
    }
}
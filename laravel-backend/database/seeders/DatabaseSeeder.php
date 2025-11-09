<?php

namespace Database\Seeders;

use App\Models\Classe;
use App\Models\User;
use App\Models\user_profile;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {

        // User::create([
        //     'user_id' => '23211TT2222',
        //     'email' => 'wedgiang@gmail.com',
        //     'password' => Hash::make('23211TT2222'),
        //     'role' => 'student',
        // ]);

        $this->call([
            UserSeeder::class,
            MajorSeeder::class,
            SubjectSeeder::class,
            ClassSeeder::class,
            UserProfileSeeder::class,
            ReportSeeder::class,
            ReportMemberSeeder::class,
        ]);
    }
}
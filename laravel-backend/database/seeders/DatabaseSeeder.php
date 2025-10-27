<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\user_profile;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {

        $this->call([
            UserSeeder::class,
            MajorSeeder::class,
            ClassSeeder::class,
            UserProfileSeeder::class,
            ReportSeeder::class,
        ]);
    }
}
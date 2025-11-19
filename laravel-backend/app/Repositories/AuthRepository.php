<?php

namespace App\Repositories;

use App\Interface\AuthInterface;
use App\Models\User;

class AuthRepository implements AuthInterface
{
    public function findUser(string $username)
    {
        return User::where("user_id", $username)->first();
    }

    public function getUserProfile(string $username)
    {
        return User::select(
            'users.user_id as user_id',
            'users.role',
            'users.email',
            'users.created_at',
            'user_profiles.fullname',
            'user_profiles.phone',
            'user_profiles.class_id',
            'user_profiles.major_id'
        )
            ->leftJoin("user_profiles", "users.user_id", "=", "user_profiles.user_id")
            ->where('users.user_id', $username)
            ->first();
    }
}

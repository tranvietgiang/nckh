<?php

namespace App\Repositories;

use App\Models\User;
use Illuminate\Support\Collection;

class StudentRepository
{
    public function getProfileByRole(string $userId, string $role): mixed
    {
        if ($role === 'student') {
            return User::select('users.*', 'user_profiles.*', 'classes.*', 'majors.*')
                ->join('user_profiles', 'user_profiles.user_id', '=', 'users.user_id')
                ->join('classes', 'user_profiles.class_id', '=', 'classes.class_id')
                ->join('majors', 'user_profiles.major_id', '=', 'majors.major_id')
                ->where('users.user_id', $userId)
                ->where('users.role', $role)
                ->first();
        }

        if ($role === 'teacher') {
            return User::select('users.*', 'user_profiles.*', 'classes.*', 'majors.*')
                ->join('user_profiles', 'user_profiles.user_id', '=', 'users.user_id')
                ->join('classes', 'user_profiles.class_id', '=', 'classes.class_id')
                ->join('majors', 'user_profiles.major_id', '=', 'majors.major_id')
                ->where('users.user_id', $userId)
                ->where('users.role', $role)
                ->get();
        }

        if ($role === 'admin') {
            return User::select('users.*', 'user_profiles.*')
                ->leftJoin('user_profiles', 'user_profiles.user_id', '=', 'users.user_id')
                ->where('users.user_id', $userId)
                ->where('users.role', $role)
                ->first();
        }

        return null;
    }

    public function getStudentRepository(int $class_id, string $teacher_id)
    {
        return User::select(
            'users.*',
            'user_profiles.*',
            'classes.*',
            "majors.*"
        )
            ->leftJoin('user_profiles', 'users.user_id', '=', 'user_profiles.user_id')
            ->leftJoin('classes', 'user_profiles.class_id', '=', 'classes.class_id')
            ->leftJoin('majors', 'user_profiles.major_id', '=', 'majors.major_id')
            ->where('users.role', 'student')
            ->where("user_profiles.class_id", $class_id)
            ->where("classes.teacher_id", $teacher_id)
            ->get();
    }
}

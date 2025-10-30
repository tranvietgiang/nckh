<?php

namespace App\Repositories;

use App\Models\User;
use Illuminate\Support\Facades\DB;

class AdminRepository
{
    // 🧾 Lấy toàn bộ người dùng
    public function getAllUsers()
    {
        return User::all();
    }

    // 🗑️ Xóa người dùng theo ID
    public function deleteUserById($user_id)
    {
        $user = User::find($user_id);

        if (!$user) {
            return null;
        }

        $user->delete();
        return true;
    }

    // 📝 Cập nhật người dùng theo ID
    public function updateUserById($user_id, $data)
    {
        $user = User::find($user_id);

        if (!$user) {
            return null;
        }

        // Chỉ cập nhật những trường có trong $data
        $user->update(array_filter([
            'username' => $data['username'] ?? $user->username,
            'email'    => $data['email'] ?? $user->email,
            'role'     => $data['role'] ?? $user->role,
            'password' => isset($data['password']) ? bcrypt($data['password']) : $user->password,
        ]));

        return $user;
    }

    // 📋 Lấy danh sách báo cáo
    public function getAllReports()
    {
        return DB::table('submissions')
            ->join('users', 'submissions.student_id', '=', 'users.user_id')
            ->join('user_profiles', 'users.user_id', '=', 'user_profiles.user_id')
            ->select(
                'submissions.submission_id',
                'submissions.status',
                'submissions.submission_time',
                'user_profiles.fullname as student_name',
                'users.user_id as student_id'
            )
            ->orderByDesc('submissions.submission_time')
            ->get();
    }
}

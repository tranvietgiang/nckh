<?php

namespace App\Repositories;

use App\Helpers\AuthHelper;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Http\JsonResponse;

class StudentRepository
{
    /**
     * Lấy hồ sơ theo vai trò hiện tại của user đăng nhập
     *
     * @return JsonResponse
     */
    public function getProfile(): JsonResponse
    {
        $user_id = AuthHelper::isLogin();
        $role    = AuthHelper::getRole();

        $checkUser = User::where('user_id', $user_id)
            ->where('role', $role)
            ->exists();

        if (!$checkUser) {
            return response()->json(['message_error' => 'Người dùng này không tồn tại!'], 404);
        }

        // Sinh viên: trả về 1 bản ghi đầy đủ (user + profile + class + major)
        if ($role === 'student') {
            $dataProfile = User::select('users.*', 'user_profiles.*', 'classes.*', 'majors.*')
                ->join('user_profiles', 'user_profiles.user_id', '=', 'users.user_id')
                ->join('classes', 'user_profiles.class_id', '=', 'classes.class_id')
                ->join('majors', 'user_profiles.major_id', '=', 'majors.major_id')
                ->where('users.user_id', $user_id)
                ->where('users.role', $role)
                ->first();

            if (!$dataProfile) {
                return response()->json(['message_error' => 'Đã xảy ra lỗi khi lấy thông tin người dùng'], 404);
            }

            return response()->json($dataProfile, 200);
        }

        // Giảng viên: có thể thuộc nhiều lớp/ngành → gom và trả về summary
        if ($role === 'teacher') {
            $dataProfile = User::select('users.*', 'user_profiles.*', 'classes.*', 'majors.*')
                ->join('user_profiles', 'user_profiles.user_id', '=', 'users.user_id')
                ->join('classes', 'user_profiles.class_id', '=', 'classes.class_id')
                ->join('majors', 'user_profiles.major_id', '=', 'majors.major_id')
                ->where('users.user_id', $user_id)
                ->where('users.role', $role)
                ->get();

            if ($dataProfile->isEmpty()) {
                return response()->json(['message_error' => 'Đã xảy ra lỗi khi lấy thông tin người dùng'], 404);
            }

            $first = $dataProfile->first();

            $info = [
                'fullname' => $first->fullname,
                'user_id'  => $first->user_id,
                'email'    => $first->email,
                'phone'    => $first->phone,
                'birthdate' => $first->birthdate,
                'role'     => $first->role,
                'major'    => $dataProfile->pluck('major_name')->filter()->unique()->values(),
                'classes'  => $dataProfile->pluck('class_name')->filter()->unique()->values(),
            ];

            return response()->json($info, 200);
        }

        // Admin: chỉ cần thông tin user + profile
        if ($role === 'admin') {
            $dataProfile = User::select('users.*', 'user_profiles.*')
                ->join('user_profiles', 'user_profiles.user_id', '=', 'users.user_id')
                ->where('users.user_id', $user_id)
                ->where('users.role', $role)
                ->first();

            if (!$dataProfile) {
                return response()->json(['message_error' => 'Đã xảy ra lỗi khi lấy thông tin người dùng'], 404);
            }

            return response()->json($dataProfile, 200);
        }

        // Vai trò lạ/không hỗ trợ
        return response()->json(['message_error' => 'Vai trò không hợp lệ'], 422);
    }
}
<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

use function Laravel\Prompts\password;

class AuthController extends Controller
{
    public function authRole(Request $request)
    {
        $username = $request->input('username') ?? null;
        $password = $request->input('password') ?? null;

        if (!$username || !$password) {
            return response()->json(["message" => "Đăng nhập đã bị lỗi, reset lại(f5)"], 400);
        }

        $user = User::where('user_id', $username)->first();

        if (!$user || !Hash::check($password, $user->password)) {
            return response()->json(['message' => 'Tài khoản or mật khẩu không đúng'], 400);
        }

        // Tạo token (sanctum / personal token)
        $token = $user->createToken('api-token')->plainTextToken;
        // get info
        $userProfile = User::select(
            'users.user_id as user_id',   // ✅ alias rõ để không bị đè
            'users.role',
            'users.email',
            'users.created_at',
            'user_profiles.fullname',
            'user_profiles.phone',
            'user_profiles.class_id',
            'user_profiles.major_id'
        )
            ->leftJoin("user_profiles", "users.user_id", "=", "user_profiles.user_id")
            ->where('users.user_id', $username)->first();


        return response()->json([
            'user' => $userProfile,
            'token' => $token
        ]);
    }
}
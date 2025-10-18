<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

use function Laravel\Prompts\password;

class AuthController extends Controller
{
    //
    public function getUser()
    {

        $getUser = User::all();
        return response()->json($getUser);
    }
    public function destroy($user_id)
    {
        $user = User::find($user_id);

        if (!$user) {
            return response()->json(['message' => 'Người dùng không tồn tại'], 404);
        }

        $user->delete();

        return response()->json(['message' => 'Xóa thành công']);
    }


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

        return response()->json([
            'user' => $user,
            'token' => $token
        ]);
    }
}
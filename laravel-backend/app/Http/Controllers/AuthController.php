<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\AuthService;

class AuthController extends Controller
{
    public function authRole(Request $request, AuthService $service)
    {
        $username = $request->input('username');
        $password = $request->input('password');

        if (!$username || !$password) {
            return response()->json(["message" => "Đăng nhập đã bị lỗi, reset lại (F5)"], 400);
        }

        $result = $service->login($username, $password);

        if (!$result['success']) {
            return response()->json(['message' => $result['message']], 400);
        }

        return response()->json([
            'user'  => $result['user'],
            'token' => $result['token'],
        ]);
    }
}

<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Auth;

class AuthHelper
{
    /**
     * Kiểm tra trạng thái đăng nhập.
     * Nếu chưa đăng nhập: trả về response JSON (401)
     * Nếu đã đăng nhập: trả về user_id
     */
    public static function isLogin()
    {
        if (!Auth::check()) {
            // ❌ Nếu chưa đăng nhập → trả response lỗi
            return response()->json([
                "status" => false,
                "message_error" => "Vui lòng đăng nhập tài khoản!",
            ], 401);
        }

        // ✅ Nếu đăng nhập hợp lệ → trả user_id
        return Auth::id();
    }

    public static function getRole()
    {
        if (!Auth::check()) {
            // ❌ Nếu chưa đăng nhập → trả response lỗi
            return response()->json([
                "status" => false,
                "message_error" => "Vui lòng đăng nhập tài khoản!",
            ], 401);
        }

        // ✅ Nếu đăng nhập hợp lệ → trả user_id
        return Auth::user()->role;
    }


    public static function roleAmin()
    {
        if (!Auth::check()) {
            response()->json([
                "status" => false,
                "message_error" => "Vui lòng đăng nhập tài khoản!",
            ], 401)->send();
            exit;
        }

        if (Auth::user()->role !== "admin") {
            response()->json([
                "status" => false,
                "message_error" => "Bạn không có quyền!",
            ], 403)->send();
            exit;
        }


        return true;
    }


    public static function roleTeacher()
    {
        if (!Auth::check()) {
            response()->json([
                "status" => false,
                "message_error" => "Vui lòng đăng nhập tài khoản!",
            ], 401)->send();
            exit;
        }

        if (Auth::user()->role !== "teacher") {
            response()->json([
                "status" => false,
                "message_error" => "Bạn không có quyền!",
            ], 403)->send();
            exit;
        }

        return true;
    }
}
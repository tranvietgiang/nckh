<?php

namespace App\Http\Controllers;

use App\Models\Major;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MajorsController extends Controller
{
    //

    public function getMajors()
    {

        if (!Auth::check()) {
            return response()->json(["login" => "Bạn chưa đăng nhâp!"], 401);
        }

        $teacherId = Auth::id();

        if (!$teacherId) {
            return response()->json(["message_error" => "Lỗi dữ liệu!"], 402);
        }

        $getMajor = Major::select("majors.*", "user_profiles.*")
            ->join("user_profiles", "majors.major_id", "=", "user_profiles.major_id")
            ->where("user_profiles.user_id", $teacherId)
            ->get();

        if ($getMajor->count() > 0) {
            return response()->json($getMajor);
        }

        return response()->json(["message_error" => "Lỗi server"], 500);
    }
}
<?php

namespace App\Http\Controllers;

use App\Helpers\AuthHelper;
use App\Models\User;
use App\Models\user_profile;
use Illuminate\Http\Request;

class TeacherController extends Controller
{
    //

    public function getAllTeacher(Request $req)
    {
        AuthHelper::isLogin();

        $major = $req->input('major_id');

        if (!$major) {
            return response()->json(["message_error" => "Lỗi dữ liệu"], 404);
        }

        $getTeachers = User::select("user_profiles.*")
            ->join("user_profiles", "users.user_id", "=", "user_profiles.user_id")
            ->join("majors", "user_profiles.major_id", "=", "majors.major_id")
            ->where("user_profiles.major_id", $major)
            ->where("users.role", "teacher")
            ->get();

        if ($getTeachers->count() > 0) {
            return response()->json($getTeachers, 200);
        }

        return response()->json(["message_error" => "lỗi server"], 500);
    }
}
<?php

namespace App\Http\Controllers;

use App\Helpers\AuthHelper;
use App\Models\Major;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MajorsController extends Controller
{
    //

    public function getMajors()
    {
        $teacherId = AuthHelper::isLogin();

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

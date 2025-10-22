<?php

namespace App\Http\Controllers;

use App\Models\Major;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MajorsController extends Controller
{
    //

    public function getMajors(Request $request)
    {

        if (!Auth::check()) {
            return response()->json(["login" => "Bạn chưa đăng nhâp!"], 401);
        }

        $getMajor = Major::select("majors.*", "user_profiles.*")
            ->join("user_profiles", "majors.major_id", "=", "user_profiles.major_id")->first();

        if ($getMajor) {
            return response()->json($getMajor);
        }
    }
}
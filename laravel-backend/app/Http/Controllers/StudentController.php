<?php

namespace App\Http\Controllers;

use App\Imports\StudentsImport;
use App\Models\User;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class StudentController extends Controller
{
    //
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv'
        ]);

        $import = new StudentsImport();
        Excel::import($import, $request->file('file'));

        // Tổng sinh viên sau khi import
        $totalStudent = $this->fetchStudentsData()->count();

        return response()->json([
            'message' => 'Import hoàn tất!',
            'total_student' => $totalStudent,
            'success' => $import->success ?? 0,
            'failed'  => $import->failed ?? 0,
            'duplicates' => $import->duplicates ?? [],
        ]);
    }


    public function fetchStudentsData()
    {
        return User::select(
            'users.*',
            'user_profiles.*',
            'classes.*'
        )
            ->join('user_profiles', 'users.user_id', '=', 'user_profiles.user_id')
            ->join('classes', 'user_profiles.class_id', '=', 'classes.class_id')
            ->where('users.role', 'student')
            ->get();
    }

    public function getStudent()
    {
        $students = $this->fetchStudentsData();

        if ($students->count() >= 1) {
            return response()->json([
                "list_student" => $students,
                "total_student" => $students->count(),
            ]);
        }
    }


    // public function CheckUserExit()
    public function  getProfile(Request $request)
    {
        $role = $request->input('role') ?? null;
        $user_id = $request->input('user_id') ?? null;

        if (!$role || !$user_id) {
            return response()->json(["message_error" => "Thiếu dữ liệu role hoặc user_id"], 402);
        }


        $checkUser = User::where("user_id", $user_id)->where("role", $role)->exists();
        if (!$checkUser) {
            return response()->json(["message_error" => "người dùng này không tồn tại!"], 402);
        }


        if ($role === "student") {
            $dataProfile = User::select("users.*", "user_profiles.*", "classes.*")
                ->join("user_profiles", "user_profiles.user_id", "=", "users.user_id")
                ->join("classes", "user_profiles.class_id", "=", "classes.class_id")
                ->where("users.user_id", $user_id)
                ->where('users.role', $role)
                ->first();

            if (!$dataProfile) {
                return response()->json(["message_error" => "Đã xảy ra lỗi khi lấy thông tin người dùng"], 402);
            }
            return response()->json($dataProfile, 200);
        } else if ($role === "teacher") {
            $dataProfile = User::select("users.*", "user_profiles.*", "classes.*")
                ->join("user_profiles", "user_profiles.user_id", "=", "users.user_id")
                ->join("classes", "users.user_id", "=", "classes.teacher_id")
                ->where("users.user_id", $user_id)
                ->where('users.role', $role)
                ->get();

            if (!$dataProfile) {
                return response()->json(["message_error" => "Đã xảy ra lỗi khi lấy thông tin người dùng"], 402);
            }

            $Info = [
                "fullname" => $dataProfile[0]->fullname,
                "user_id" => $dataProfile[0]->user_id,
                "email" => $dataProfile[0]->email,
                "phone" => $dataProfile[0]->phone,
                "birthdate" => $dataProfile[0]->birthdate,
                "role" => $dataProfile[0]->role,
                // "nganh" => $dataProfile[0]->nganh,
                "classes" => $dataProfile->pluck('class_name')->unique()->values(),
            ];
            return response()->json($Info, 200);
        } else if ($role === "admin") {
        }
    }
}
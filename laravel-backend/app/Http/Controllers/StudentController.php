<?php

namespace App\Http\Controllers;

use App\Imports\StudentsImport;
use App\Models\Classe;
use App\Models\ImportError;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Validation\Rule;

class StudentController extends Controller
{
    //
    public function import(Request $request)
    {
        $validated = $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv',
            'class_id' => [
                'required',
                'integer',
                Rule::exists('classes', 'class_id')->where(function ($q) {
                    $q->where('teacher_id', Auth::id());
                }),
            ],
        ]);

        $classId   = (int) $validated['class_id'];
        $teacherId = Auth::id();

        // Tạo instance để lấy thống kê sau import
        $import = new StudentsImport(classId: $classId, teacherId: $teacherId);

        // Chỉ import 1 lần
        Excel::import($import, $validated['file']);

        $list_import_error = ImportError::where("class_id", $classId)
            ->where("teacher_id", $teacherId)->get();

        if ($list_import_error->count() > 0) {
            return response()->json([
                'message' => 'Import hoàn tất!',
                'total_student' => $import->totalStudent,
                'success' => $import->success ?? 0,
                'failed'  => $import->failed ?? 0,
                'list_import_error' => $list_import_error,
            ]);
        }

        return response()->json([
            'message' => 'Import hoàn tất!',
            'total_student' => $import->totalStudent,
            'success' => $import->success ?? 0,
            'failed'  => $import->failed ?? 0,
        ]);
    }



    public function getStudent($selectedClass)
    {
        $userId = Auth::id();
        if (!Auth::check()) {
            return response()->json(["message_error" => "Vui lòng đăng nhâp"], 401);
        }

        $students = User::select(
            'users.*',
            'user_profiles.*',
            'classes.*'
        )
            ->join('user_profiles', 'users.user_id', '=', 'user_profiles.user_id')
            ->join('classes', 'user_profiles.class_id', '=', 'classes.class_id')
            ->where('users.role', 'student')
            ->where("user_profiles.class_id", $selectedClass)
            ->where("classes.teacher_id", $userId)
            ->get();

        if ($students->count() > 0) {
            return response()->json([
                "list_student" => $students,
                "total_student" => $students->count(),
            ], 200);
        }

        return response()->json(["message_error" => "Lỗi phía serve"], 500);
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
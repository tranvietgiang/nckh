<?php

namespace App\Http\Controllers;

use App\Helpers\AuthHelper;
use App\Imports\StudentsImport;
use App\Models\Classe;
use App\Models\ImportError;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Validation\Rule;

class StudentController extends Controller
{
    //
    public function import(Request $request)
    {
        try {
            AuthHelper::isLogin();
            $validated = $request->validate([
                'file' => 'required|file|mimes:xlsx,xls,csv',
                'major_id' => 'required|integer',
                'teacher_id' => 'required|string',
                'class_id' => [
                    'required',
                    'integer',
                    Rule::exists('classes', 'class_id')->where(function ($q) use ($request) {
                        $q->where('teacher_id', $request->input('teacher_id'));
                    }),
                ],
            ]);

            $classId = (int) $validated['class_id'];
            $majorId = (int) $validated['major_id'];
            $teacherId = (string) $validated['teacher_id'];

            // Tạo instance để lấy thống kê sau import
            $import = new StudentsImport(
                classId: $classId,
                teacherId: $teacherId,
                majorId: $majorId
            );

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
        } catch (Exception $e) {
            return response()->json([
                'error'   => '❌ Import thất bại!',
                'message' => $e->getMessage(), // lấy nội dung lỗi cụ thể
            ], 400);
        }
    }



    public function getStudents($class_id, $teacher_id)
    {
        AuthHelper::isLogin();

        $students = User::select(
            'users.*',
            'user_profiles.*',
            'classes.*',
            "majors.*"
        )
            ->join('user_profiles', 'users.user_id', '=', 'user_profiles.user_id')
            ->join('classes', 'user_profiles.class_id', '=', 'classes.class_id')
            ->join('majors', "user_profiles.major_id", "=", "majors.major_id")
            ->where('users.role', 'student')
            ->where("user_profiles.class_id", $class_id)
            ->where("classes.teacher_id", $teacher_id)
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
        $user_id = AuthHelper::isLogin();

        if (!$role || !$user_id) {
            return response()->json(["message_error" => "Thiếu dữ liệu role hoặc user_id"], 402);
        }


        $checkUser = User::where("user_id", $user_id)->where("role", $role)->exists();
        if (!$checkUser) {
            return response()->json(["message_error" => "người dùng này không tồn tại!"], 402);
        }


        if ($role === "student") {
            $dataProfile = User::select("users.*", "user_profiles.*", "classes.*", "majors.*")
                ->join("user_profiles", "user_profiles.user_id", "=", "users.user_id")
                ->Join("classes", "user_profiles.class_id", "=", "classes.class_id")
                ->Join("majors", "user_profiles.major_id", "=", "majors.major_id")
                ->where("users.user_id", $user_id)
                ->where('users.role', $role)
                ->first();

            if (!$dataProfile) {
                return response()->json(["message_error" => "Đã xảy ra lỗi khi lấy thông tin người dùng"], 402);
            }
            return response()->json($dataProfile, 200);
        } else if ($role === "teacher") {
            $dataProfile = User::select("users.*", "user_profiles.*", "classes.*", "majors.*")
                ->join("user_profiles", "user_profiles.user_id", "=", "users.user_id")
                ->join("classes", "user_profiles.class_id", "=", "classes.class_id")
                ->Join("majors", "user_profiles.major_id", "=", "majors.major_id")
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
                "major" => $dataProfile->pluck('major_name')->unique()->values(),
                "classes" => $dataProfile->pluck('class_name')->unique()->values(),
            ];
            return response()->json($Info, 200);
        } else if ($role === "admin") {
            $dataProfile = User::select("users.*", "user_profiles.*")
                ->join("user_profiles", "user_profiles.user_id", "=", "users.user_id")
                ->where("users.user_id", $user_id)
                ->where('users.role', $role)
                ->first();

            if (!$dataProfile) {
                return response()->json(["message_error" => "Đã xảy ra lỗi khi lấy thông tin người dùng"], 402);
            }

            return response()->json($dataProfile, 200);
        }
    }
}
<?php

namespace App\Http\Controllers;

use App\Models\Classe;
use App\Models\user_profile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ClassController extends Controller
{
    //

    public function getClass()
    {
        $classes = Classe::all();
        return response()->json($classes);
    }

    //lấy lớp  học thấy  id giảng viên 
    public function getClassByTeacher($id)
    {
        $classes = Classe::where('teacher_id', $id)->get();

        return response()->json($classes);
    }

    // public function getStudentsByClass($classId)
    // {
    //     $students = user_profile::select(
    //         'user_profiles.fullname',
    //         'user_profiles.phone',
    //         'user_profiles.user_id',
    //         'users.email',
    //         'classes.class_name'
    //     )
    //         ->join('users', 'users.user_id', '=', 'user_profiles.user_id')
    //         ->join('classes', 'classes.class_id', '=', 'user_profiles.class_id')
    //         ->where('user_profiles.class_id', $classId)
    //         ->where('users.role', 'student')
    //         ->get();

    //     return response()->json($students);
    // }


 public function getStudentsByClass($classId)
{
    $students = \DB::table('user_profiles')
        ->join('users', 'users.user_id', '=', 'user_profiles.user_id')
        ->join('classes', 'classes.class_id', '=', 'user_profiles.class_id') // ✅ thêm dòng này
        ->leftJoin('reports', 'reports.class_id', '=', 'user_profiles.class_id')
        ->leftJoin('submissions', function ($join) {
            $join->on('submissions.student_id', '=', 'user_profiles.user_id')
                 ->on('submissions.report_id', '=', 'reports.report_id');
        })
        ->where('user_profiles.class_id', $classId)
        ->select(
            'user_profiles.user_id',
            'user_profiles.fullname',
            'users.email',
            'classes.class_name', // ✅ thêm dòng này
            \DB::raw('
                CASE
                    WHEN submissions.submission_id IS NULL THEN "Chưa nộp"
                    WHEN submissions.status = "submitted" THEN "Đã nộp"
                    WHEN submissions.status = "graded" THEN "Đã chấm"
                    WHEN submissions.status = "rejected" THEN "Bị từ chối"
                    ELSE "Không xác định"
                END AS status
            ')
        )
        ->groupBy(
            'user_profiles.user_id',
            'user_profiles.fullname',
            'users.email',
            'classes.class_name',
            'submissions.submission_id',
            'submissions.status'
        )
        ->get();

    return response()->json($students);
}


<<<<<<< HEAD
        return response()->json($students);
    }

    public function inertsClassNew(Request $request)
    {
        if (!Auth::check()) {
            return response()->json(["message_error" => "Vui lòng đăng nhập tài khoản!"], 401);
        }

        $data = $request->all() ?? [];
        $userId = Auth::id() ?? null;

        if (!is_array($data)) {
            response()->json([
                "message_error" => "Lỗi dữ liệu vui lòng tải lại trang!"
            ], 402);
        }

        $check = Classe::where("class_name", $data["class_name"])
            ->where("teacher_id", $userId)->exists();


        if ($check) {
            return response()->json(["message_error" => "Lớp này đã tồn tai!"], 402);
        }

        $class = Classe::create([
            "class_name" => $data["class_name"],
            "class_code" => $data["class_code"],
            "teacher_id" => $userId,
            "semester" => $data["semester"],
            "academic_year" => $data["academic_year"],
        ]);

        if ($class) {
            return response()->json(
                [
                    "success" => true,
                    "data_classes" => $class
                ],
                200
            );
        } else {
            return response()->json(
                [
                    "message_error" => "Tạo lớp mới không thành công!",
                ],
                402
            );
        }

        return response()->json([
            "message_error" => "Lỗi server vui lòng tải lại trang!"
        ], 500);
    }
}
=======
}
>>>>>>> feature-managerclass-pc

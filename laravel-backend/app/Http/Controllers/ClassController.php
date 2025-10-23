<?php

namespace App\Http\Controllers;

use App\Models\Classe;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Helpers\AuthHelper;
use App\Models\Major;

class ClassController extends Controller
{


    //

    public function getClass()
    {
        $classes = Classe::all();
        return response()->json($classes);
    }

    //lấy lớp  học thấy  id giảng viên 
    public function getClassByTeacher()
    {

        if (!Auth::check()) {
            return response()->json(["login" => "Bạn chưa login"], 401);
        }

        $teacherId = Auth::id();
        if (!$teacherId) {
            return response()->json(["message_error" => "Lỗi dữ  liệu"], 401);
        }

        $classes = Classe::where('teacher_id', $teacherId)->get();

        return response()->json($classes);
    }

    public function getStudentsByClass($classId)
    {
        $students = DB::table('user_profiles')

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
                DB::raw('
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


    public function getStudentClasses()
    {
        $studentId = Auth::id();

        try {
            $classes = DB::table('submissions as s')
                ->join('reports as r', 's.report_id', '=', 'r.report_id')
                ->join('classes as c', 'r.class_id', '=', 'c.class_id')
                ->where('s.student_id', $studentId)
                ->select('c.class_id', 'c.class_name', 'c.class_code', 'c.semester', 'c.academic_year')
                ->distinct()
                ->orderBy('c.class_name', 'asc')
                ->get();

            if ($classes->isEmpty()) {
                return response()->json(['error' => 'Không tìm thấy lớp nào cho sinh viên này.'], 404);
            }

            return response()->json($classes);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Lỗi truy xuất dữ liệu lớp.',
                'message' => $e->getMessage(),
            ], 500);
        }
    }


    public function inertsClassNew(Request $request)
    {
        $userId = AuthHelper::isLogin();

        $data = $request->all() ?? [];

        if (!is_array($data)) {
            response()->json([
                "message_error" => "Lỗi dữ liệu vui lòng tải lại trang!"
            ], 402);
        }

        $check = Classe::where("class_name", $data["class_name"])->where("class_code", $data["class_code"])
            ->where("teacher_id", $userId)->exists();

        $major = Major::where("major_id", $data["major_id"])->exists();

        if (!$major) {
            return response()->json(["message_error" => "Ngành này không tồn tại!"], 402);
        }

        if ($check) {
            return response()->json(["message_error" => "Lớp này đã tồn tai!"], 402);
        }

        $class = Classe::create([
            "class_name" => $data["class_name"],
            "class_code" => $data["class_code"],
            "teacher_id" => $userId,
            "semester" => $data["semester"],
            "academic_year" => $data["academic_year"],
            "major_id" => $data["major_id"]
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
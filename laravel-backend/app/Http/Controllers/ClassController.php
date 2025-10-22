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



    public function insertClassNew(Request $request)
    {
        $userId = AuthHelper::isLogin();

        $data = $request->all();

        if (
            empty($data["class_name"]) ||
            empty($data["class_code"]) ||
            empty($data["major_id"]) ||
            empty($data["semester"]) ||
            empty($data["academic_year"])
        ) {
            return response()->json([
                "status" => false,
                "message_error" => "Vui lòng nhập đầy đủ thông tin lớp học!"
            ], 402);
        }

        // 🔹 Kiểm tra ngành tồn tại
        $majorExists = Major::where("major_id", $data["major_id"])->exists();
        if (!$majorExists) {
            return response()->json([
                "status" => false,
                "message_error" => "Ngành học không tồn tại!"
            ]);
        }

        // 1️⃣ Cùng giảng viên + trùng tên lớp
        $sameTeacherAndName = Classe::where("teacher_id", $userId)
            ->where("class_name", $data["class_name"])
            ->exists();

        if ($sameTeacherAndName) {
            return response()->json([
                "status" => false,
                "message_error" => "Tên lớp này đã được bạn tạo trước đó!"
            ]);
        }

        // 2️⃣ Cùng giảng viên + trùng mã lớp
        $sameTeacherAndCode = Classe::where("teacher_id", $userId)
            ->where("class_code", $data["class_code"])
            ->exists();

        if ($sameTeacherAndCode) {
            return response()->json([
                "status" => false,
                "message_error" => "Mã lớp này đã tồn tại trong danh sách lớp của bạn!"
            ]);
        }

        // 3️⃣ Cùng ngành + trùng mã lớp
        $sameMajorAndCode = Classe::where("major_id", $data["major_id"])
            ->where("class_code", $data["class_code"])
            ->exists();

        if ($sameMajorAndCode) {
            return response()->json([
                "status" => false,
                "message_error" => "Mã lớp này đã tồn tại trong cùng ngành!"
            ]);
        }

        // ✅ Nếu mọi thứ hợp lệ → tiến hành tạo lớp
        try {
            $class = Classe::create([
                "class_name" => $data["class_name"],
                "class_code" => $data["class_code"],
                "teacher_id" => $userId,
                "semester" => $data["semester"],
                "academic_year" => $data["academic_year"],
                "major_id" => $data["major_id"]
            ]);

            return response()->json([
                "status" => true,
                "message" => "Tạo lớp học thành công!",
                "data_classes" => $class
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                "status" => false,
                "message_error" => "Lỗi server: " . $e->getMessage()
            ]);
        }
    }
}
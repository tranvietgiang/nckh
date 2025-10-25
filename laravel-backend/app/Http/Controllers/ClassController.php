<?php

namespace App\Http\Controllers;

use App\Models\Classe;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Helpers\AuthHelper;
use App\Models\Major;
use App\Http\Controllers\MajorsController;

class ClassController extends Controller
{

    public function getClass()
    {
        $classes = Classe::all();
        return response()->json($classes);
    }

    //lấy lớp  học thấy  id giảng viên 
    public function getClassByTeacher()
    {
        $teacherId = AuthHelper::isLogin();

        $classes = Classe::where('teacher_id', $teacherId)->get();

        if ($classes->count() > 0) {
            return response()->json($classes);
        }

        return response()->json([], 500);
    }

    //lấy lớp  học thấy  id giảng viên 
    public function getAllClassTeacher()
    {
        AuthHelper::isLogin();

        $classes = Classe::all();

        if ($classes->count() > 0) {
            return response()->json($classes);
        }

        return response()->json([], 500);
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

        $majorExists = Major::where("major_id", $data["major_id"])->exists();
        if (!$majorExists) {
            return response()->json([
                "status" => false,
                "message_error" => "Ngành học không tồn tại!"
            ]);
        }

        $sameTeacherAndName = Classe::where("teacher_id", $userId)
            ->where("class_name", $data["class_name"])
            ->exists();

        if ($sameTeacherAndName) {
            return response()->json([
                "status" => false,
                "message_error" => "Tên lớp này đã được bạn tạo trước đó!"
            ]);
        }

        $sameTeacherAndCode = Classe::where("teacher_id", $userId)
            ->where("class_code", $data["class_code"])
            ->exists();

        if ($sameTeacherAndCode) {
            return response()->json([
                "status" => false,
                "message_error" => "Mã lớp này đã tồn tại trong danh sách lớp của bạn!"
            ]);
        }

        $sameMajorAndCode = Classe::where("major_id", $data["major_id"])
            ->where("class_code", $data["class_code"])
            ->exists();

        if ($sameMajorAndCode) {
            return response()->json([
                "status" => false,
                "message_error" => "Mã lớp này đã tồn tại trong cùng ngành!"
            ]);
        }

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

    public function deleteClassNew($class_id)
    {
        $teacherId = AuthHelper::isLogin();

        $delete = Classe::where("class_id", $class_id)->where("teacher_id", $teacherId)->delete();
        if ($delete) {
            return response()->json([
                "status" => true,
            ], 200);
        }
    }
}
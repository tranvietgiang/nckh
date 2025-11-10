<?php

namespace App\Http\Controllers;

use App\Helpers\AuthHelper;
use App\Models\Classe;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use App\Imports\TeacherImport;
use App\Models\user_profile;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Services\TeacherService;
use Maatwebsite\Excel\Facades\Excel;


class TeacherController extends Controller
{
    protected $service;


    public function getAllTeacher(Request $req)
    {
        AuthHelper::isLogin();

        $majorId = $req->input('major_id');

        if (!$majorId) {
            return response()->json(["message_error" => "Thiếu mã ngành!"], 400);
        }

        $teachers = User::select(
            "users.user_id",
            "user_profiles.fullname",
            "user_profiles.phone",
            "user_profiles.birthdate",
            "user_profiles.major_id",
            "majors.major_name"
        )
            ->join("user_profiles", "users.user_id", "=", "user_profiles.user_id")
            ->join("majors", "user_profiles.major_id", "=", "majors.major_id")
            ->where("users.role", "teacher")
            ->where("user_profiles.major_id", $majorId)
            ->groupBy(
                "users.user_id",
                "user_profiles.fullname",
                "user_profiles.phone",
                "user_profiles.birthdate",
                "user_profiles.major_id",
                "majors.major_name"
            )
            ->get();

        if ($teachers->isEmpty()) {
            return response()->json(["message_error" => "Không tìm thấy giáo viên nào thuộc ngành này!"], 404);
        }

        return response()->json($teachers, 200);
    }


    public function getClassStatistics($class_id)
    {
        AuthHelper::isLogin();

        // ✅ 1. Kiểm tra lớp tồn tại
        $class = Classe::with('major')->find($class_id);
        if (!$class) {
            return response()->json(['message' => 'Không tìm thấy lớp!'], 404);
        }

        // ✅ 2. Lấy toàn bộ sinh viên thuộc lớp
        $students = DB::table('user_profiles')
            ->join('users', 'users.user_id', '=', 'user_profiles.user_id')
            ->where('user_profiles.class_id', $class_id)
            ->where('users.role', 'student')
            ->select('users.user_id', 'users.full_name')
            ->get();

        // ✅ 3. Lấy sinh viên đã nộp báo cáo
        $submittedIds = DB::table('submissions')
            ->join('reports', 'reports.report_id', '=', 'submissions.report_id')
            ->where('reports.class_id', $class_id)
            ->pluck('submissions.student_id')
            ->toArray();

        // ✅ 4. Thống kê số lượng bài
        $gradedCount = DB::table('submissions')
            ->join('reports', 'reports.report_id', '=', 'submissions.report_id')
            ->where('reports.class_id', $class_id)
            ->where('submissions.status', 'graded')
            ->count();

        $rejectedCount = DB::table('submissions')
            ->join('reports', 'reports.report_id', '=', 'submissions.report_id')
            ->where('reports.class_id', $class_id)
            ->where('submissions.status', 'rejected')
            ->count();

        // ✅ 5. Tính toán
        $total = $students->count();
        $submitted = count($submittedIds);
        $notSubmitted = $total - $submitted;

        // ✅ 6. Gắn trạng thái từng sinh viên
        $students = $students->map(function ($s) use ($submittedIds) {
            $s->submitted = in_array($s->user_id, $submittedIds);
            return $s;
        });

        // ✅ 7. Trả JSON cho frontend
        return response()->json([
            'class' => [
                'class_name' => $class->class_name,
                'major_name' => $class->major->major_name ?? 'Không xác định',
                'total_students' => $total,
                'submitted' => $submitted,
                'not_submitted' => $notSubmitted,
                'graded' => $gradedCount,
                'rejected' => $rejectedCount,
            ],
            'students' => $students,
        ]);
    }


    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls',
        ]);

        try {
            $import = new TeacherImport();
            $result = Excel::toCollection($import, $request->file('file'));

            // $result[0] là collection của sheet đầu tiên
            $data = $import->collection($result[0]);

            return response()->json([
                'message' => $data['failed'] === 0 ? '✅ Import hoàn tất!' : '⚠️ Import có lỗi!',
                'total' => $data['total'],
                'success' => $data['success'],
                'failed' => $data['failed'],
                'errors' => $data['errors'],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => '❌ Lỗi import: ' . $e->getMessage()
            ], 500);
        }
    }

}
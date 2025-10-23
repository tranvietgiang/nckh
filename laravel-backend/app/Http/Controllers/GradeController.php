<?php

namespace App\Http\Controllers;

use App\Models\Grade;
use App\Models\Submission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class GradeController extends Controller
{
    /**
     * Lấy danh sách điểm & phản hồi (có thông tin bài nộp và giảng viên)
     */
    public function index()
    {
        $grades = Grade::with(['submission', 'teacher'])
            ->select('grade_id', 'submission_id', 'teacher_id', 'score', 'feedback', 'graded_at')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $grades
        ]);
    }

    /**
     * Chấm điểm hoặc cập nhật điểm cho bài nộp
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'submission_id' => 'required|exists:submissions,submission_id',
            'teacher_id' => 'required|exists:users,user_id',
            'score' => 'required|numeric|min:0|max:10',
            'feedback' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Nếu đã chấm rồi thì update, chưa có thì tạo mới
        $grade = Grade::updateOrCreate(
            ['submission_id' => $request->submission_id],
            [
                'teacher_id' => $request->teacher_id,
                'score' => $request->score,
                'feedback' => $request->feedback,
                'graded_at' => Carbon::now(),
            ]
        );

        // Cập nhật trạng thái bài nộp thành 'graded'
        Submission::where('submission_id', $request->submission_id)
            ->update(['status' => 'graded']);

        return response()->json([
            'status' => 'success',
            'message' => 'Đã lưu điểm và phản hồi thành công!',
            'data' => $grade
        ]);
    }

    /**
     * Lấy chi tiết điểm của một bài nộp
     */
    public function show($submission_id)
    {
        $grade = Grade::where('submission_id', $submission_id)
            ->with(['submission', 'teacher'])
            ->first();

        if (!$grade) {
            return response()->json([
                'status' => 'not_found',
                'message' => 'Chưa có điểm cho bài nộp này.'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $grade
        ]);
    }

    public function gradingindex(Request $request)
    {
        $studentId = Auth::id();
        $classCode = $request->query('class');

        try {
            $query = DB::table('submissions as s')
                ->join('reports as r', 's.report_id', '=', 'r.report_id')
                ->leftJoin('grades as g', 's.submission_id', '=', 'g.submission_id') // ✅ SỬA Ở ĐÂY
                ->leftJoin('users as u', 'g.teacher_id', '=', 'u.user_id')
                ->leftJoin('user_profiles as up', 'u.user_id', '=', 'up.user_id')
                ->leftJoin('classes as c', 'r.class_id', '=', 'c.class_id') // ✅ Lớp gắn với báo cáo
                ->select(
                    'r.report_id',
                    'r.report_name as report_title',
                    's.submission_time as submission_date',
                    's.status',
                    'g.score',
                    'g.feedback',
                    'up.fullname as teacher_name',
                    'g.updated_at as graded_at',
                    'c.class_name'
                )
                ->where('s.student_id', $studentId);

            if (!empty($classCode)) {
                $query->where('c.class_name', $classCode);
            }

            $results = $query->orderBy('s.submission_time', 'desc')->get();

            if ($results->isEmpty()) {
                return response()->json(['error' => 'Không tìm thấy kết quả chấm điểm.'], 404);
            }

            return response()->json($results);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Lỗi truy xuất dữ liệu, vui lòng thử lại sau.',
                'message' => $e->getMessage(),
            ], 500);
        }
    }



    /**
     * Xem chi tiết 1 bài / báo cáo cụ thể
     */
    public function gradingshow($reportId)
    {
        $studentId = Auth::user()->user_id;

        try {
            $result = DB::table('reports as r')
                ->leftJoin('grades as g', 'r.report_id', '=', 'g.report_id')
                ->leftJoin('teachers as t', 'g.teacher_id', '=', 't.teacher_id')
                ->select(
                    'r.report_id',
                    'r.report_title',
                    'r.submission_date',
                    'r.status',
                    'g.score',
                    'g.feedback',
                    't.teacher_name',
                    'g.updated_at as graded_at'
                )
                ->where('r.student_id', $studentId)
                ->where('r.report_id', $reportId)
                ->first();

            if (!$result) {
                return response()->json(['error' => 'Không tìm thấy kết quả chấm điểm.'], 404);
            }

            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Lỗi truy xuất dữ liệu, vui lòng thử lại sau.'], 500);
        }
    }
}

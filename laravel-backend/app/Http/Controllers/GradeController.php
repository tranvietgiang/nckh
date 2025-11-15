<?php

namespace App\Http\Controllers;

use App\Helpers\AuthHelper;
use App\Models\Grade;
use App\Models\Submission;
use App\Services\GradeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use Illuminate\Container\Attributes\Auth;
use Illuminate\Support\Facades\DB;

class GradeController extends Controller
{
    protected $gradeService;

    public function __construct(GradeService $gradeService)
    {
        $this->gradeService = $gradeService;
    }

    /**
     * Lấy danh sách tất cả grades
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
    public function gradingAndFeedBack(Request $request)
    {
        // =======================
        // ⭐ 1. VALIDATE INPUT
        // =======================
        $request->validate([
            'submission_id' => 'required|exists:submissions,submission_id',
            'report_id' => 'required|exists:reports,report_id',
            'score' => 'required|numeric|min:0|max:10',
            'feedback' => 'nullable|string|max:500',
        ], [
            'submission_id.required' => 'Thiếu ID bài nộp.',
            'submission_id.exists' => 'Bài nộp không tồn tại.',
            'report_id.required' => 'Thiếu ID báo cáo.',
            'report_id.exists' => 'Báo cáo không tồn tại.',
            'score.required' => 'Vui lòng nhập điểm.',
            'score.numeric' => 'Điểm phải là số.',
            'score.min' => 'Điểm tối thiểu là 0.',
            'score.max' => 'Điểm tối đa là 10.',
            'feedback.max' => 'Phản hồi tối đa 500 ký tự.',
        ]);

        $teacherId = $request->user()->user_id;

        // =======================
        // ⭐ 2. KIỂM TRA QUYỀN CHẤM ĐIỂM
        // =======================
        $submissionCheck = DB::table('submissions')
            ->join('reports', 'submissions.report_id', '=', 'reports.report_id')
            ->join('classes', 'reports.class_id', '=', 'classes.class_id')
            ->where('submissions.submission_id', $request->submission_id)
            ->first();

        if (!$submissionCheck) {
            return response()->json([
                'status' => 'error',
                'message' => 'Không tìm thấy bài nộp.',
            ], 404);
        }

        // ❌ Kiểm tra bài nộp có đúng báo cáo không
        if ($submissionCheck->report_id != $request->report_id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Bài nộp không thuộc báo cáo này.',
            ], 403);
        }

        // ❌ Kiểm tra giáo viên có dạy lớp này không
        if ($submissionCheck->teacher_id != $teacherId) {
            return response()->json([
                'status' => 'error',
                'message' => 'Bạn không có quyền chấm bài của lớp này.',
            ], 403);
        }

        // =======================
        // ⭐ 3. LƯU / CẬP NHẬT ĐIỂM
        // =======================
        $grade = Grade::updateOrCreate(
            ['submission_id' => $request->submission_id],
            [
                'teacher_id' => $teacherId,
                'score' => $request->score,
                'feedback' => $request->feedback,
                'graded_at' => now(),
            ]
        );

        // =======================
        // ⭐ 4. CẬP NHẬT TRẠNG THÁI SUBMISSION
        // =======================
        Submission::where('submission_id', $request->submission_id)
            ->update(['status' => 'submitted']);

        return response()->json([
            'status' => 'success',
            'message' => 'Đã chấm điểm và gửi phản hồi thành công!',
            'data' => $grade
        ], 200);
    }



    /**
     * Lấy tất cả report đã chấm điểm của user đang login
     */
    public function getAllReportGraded()
    {
        $userId = AuthHelper::isLogin();

        $submissions = Submission::select('submissions.*', 'grades.score', 'grades.feedback', "subjects.subject_name", 'classes.semester as hoc_ky')
            ->leftJoin('grades', 'submissions.submission_id', '=', 'grades.submission_id')
            ->join('reports', 'submissions.report_id', '=', 'reports.report_id')
            ->join('classes', 'reports.class_id', '=', 'classes.class_id')
            ->join("subjects", "classes.subject_id", "=", "subjects.subject_id")
            ->where('submissions.student_id', $userId)
            ->where('grades.score', "!=", 0)
            ->get();

        if ($submissions->isEmpty()) {
            return response()->json([
                'status' => 'not_found',
                'message' => 'Không tìm thấy báo cáo đã chấm điểm'
            ], 404);
        }

        return response()->json($submissions, 200);
    }
}
<?php

namespace App\Http\Controllers;

use App\Helpers\AuthHelper;
use App\Models\Grade;
use App\Models\Submission;
use App\Services\GradeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

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
    public function store(Request $request)
    {
        $request->validate([
            'submission_id' => 'required|exists:submissions,submission_id',
            'score' => 'required|numeric|min:0|max:10',
            'feedback' => 'nullable|string|max:500',
        ]);

        // Lấy teacher_id từ user đang login
        $teacherId = $request->user()->user_id;

        $grade = Grade::updateOrCreate(
            ['submission_id' => $request->submission_id],
            [
                'teacher_id' => $teacherId,
                'score' => $request->score,
                'feedback' => $request->feedback,
                'graded_at' => Carbon::now(),
            ]
        );

        // Cập nhật trạng thái bài nộp
        Submission::where('submission_id', $request->submission_id)
            ->update(['status' => 'graded']);

        return response()->json([
            'status' => 'success',
            'message' => 'Đã lưu điểm và phản hồi thành công!',
            'data' => $grade
        ]);
    }

    /**
     * Lấy chi tiết điểm của một submission
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

    /**
     * Lấy tất cả report đã chấm điểm của user đang login
     */
    public function getAllReportGraded()
    {
        $userId = AuthHelper::isLogin();

        $submissions = Submission::select('submissions.*', 'grades.score', 'grades.feedback')
            ->leftJoin('grades', 'submissions.submission_id', '=', 'grades.submission_id')
            ->where('submissions.student_id', $userId)
            ->get();

        if ($submissions->isEmpty()) {
            return response()->json([
                'status' => 'not_found',
                'message' => 'Không tìm thấy báo cáo đã chấm điểm'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $submissions
        ], 200);
    }
}

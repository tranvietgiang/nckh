<?php

namespace App\Http\Controllers;

use App\Models\Grade;
use App\Models\Submission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

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
}

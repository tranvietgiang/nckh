<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\TeacherService;
use Illuminate\Support\Facades\Validator;

class TeacherScoringController extends Controller
{
    protected $teacherService;

    public function __construct(TeacherService $teacherService)
    {
        $this->teacherService = $teacherService;
    }

    /**
     * GET /teacher/subjects
     */
    public function getSubjects(Request $request)
    {
        $teacherId = $request->user()->user_id ?? null;

        if (!$teacherId) {
            return response()->json([], 200); // Trả về rỗng nếu không có teacherId
        }

        $subjects = $this->teacherService->getSubjects($teacherId);
        return response()->json($subjects);
    }

    /**
     * GET /teacher/classes/{subjectId}
     */
    public function getClasses($subjectId)
    {
        $subjectId = (int)$subjectId;
        if (!$subjectId) return response()->json([], 200);

        $classes = $this->teacherService->getClasses($subjectId);
        return response()->json($classes);
    }

    /**
     * GET /teacher/reports/{classId}
     */
    public function getReports($classId)
    {
        $classId = (int)$classId;
        if (!$classId) return response()->json([], 200);

        $reports = $this->teacherService->getReports($classId);
        return response()->json($reports);
    }

    /**
     * GET /teacher/submissions/{reportId}
     */
    public function getSubmissions($reportId)
    {
        $reportId = (int)$reportId;
        if (!$reportId) return response()->json([], 200);

        $subs = $this->teacherService->getSubmissions($reportId);
        return response()->json($subs);
    }

    /**
     * POST /grades
     * body: { submission_id, teacher_id, score, feedback }
     */
    public function storeGrade(Request $request)
    {
        // Validation
        $validator = Validator::make($request->all(), [
            'submission_id' => 'required|integer',
            'teacher_id'    => 'required|integer',
            'score'         => 'required|numeric|min:0|max:10',
            'feedback'      => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Dữ liệu không hợp lệ',
                'errors'  => $validator->errors()
            ], 422);
        }

        try {
            $data = $request->only('submission_id', 'teacher_id', 'score', 'feedback');
            $result = $this->teacherService->saveGrade($data);

            return response()->json([
                'message' => 'Đã chấm điểm thành công',
                'data'    => $result
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Có lỗi xảy ra khi chấm điểm',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
}

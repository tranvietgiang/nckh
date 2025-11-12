<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\TeacherService;
use Illuminate\Support\Facades\Auth;

class TeacherScoringController extends Controller
{
    protected $teacherService;

    public function __construct(TeacherService $teacherService)
    {
        $this->teacherService = $teacherService;
    }

    // Lấy danh sách môn học
    public function getSubjects()
    {
        $teacherId = (int) Auth::id(); // ép kiểu sang int
        $subjects = $this->teacherService->getSubjects($teacherId);
        return response()->json([
            'data' => $subjects
        ]);
    }

    // Lấy danh sách lớp theo môn
    public function getClasses($subjectId, Request $request)
    {
        $teacherId = (int) $request->user()->user_id; // hoặc $request->teacher_id nếu bạn đang truyền vào
        $classes = $this->teacherService->getClasses((int) $subjectId, $teacherId);

        return response()->json([
            'data' => $classes
        ]);
    }

    // Lấy danh sách báo cáo theo lớp
    public function getReports($classId, Request $request)
    {
        $teacherId = (int) $request->user()->user_id; // hoặc lấy từ token đăng nhập

        if (!$classId) {
            return response()->json([
                'data' => [],
                'message' => 'Thiếu class_id'
            ], 400);
        }

        $reports = $this->teacherService->getReports((int) $classId, $teacherId);

        return response()->json([
            'data' => $reports
        ]);
    }


    // Lấy submissions theo báo cáo
    public function getSubmissions(Request $request)
    {
        $teacherId = (int) Auth::id();
        $reportId = $request->query('report_id');

        if (!$reportId) {
            return response()->json(['data' => [], 'message' => 'Thiếu report_id'], 400);
        }

        $submissions = $this->teacherService->getSubmissions($reportId, $teacherId);
        return response()->json([
            'data' => $submissions
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Subject; // Import Model Subject
use App\Models\Classe; // Import Model Class (tên model của bạn có thể khác)
use App\Models\Report; // Import Model Report
use App\Models\Submission; // Import Model Submission
use Illuminate\Support\Facades\Auth;

class TeacherScoringController extends Controller
{
    /**
     * 1. Lấy các môn học mà giảng viên (đã đăng nhập) dạy
     */
    public function getSubjectsForTeacher(Request $request)
    {
        $teacher = $request->user(); // Lấy thông tin giảng viên đã xác thực
        
        // Giả sử giảng viên có 'major_id'
        // Chúng ta dùng 'major_id' của giảng viên để tìm các môn học
        if (!$teacher->major_id) {
            return response()->json(['error' => 'Không tìm thấy thông tin ngành của giảng viên'], 404);
        }

        $subjects = Subject::where('major_id', $teacher->major_id)->get();
        
        return response()->json($subjects);
    }

    /**
     * 2. Lấy các lớp học dựa trên môn học
     */
    public function getClassesForSubject(Request $request, $subject_id)
    {
        $teacher_id = $request->user()->id; // Lấy ID giảng viên

        // Lấy các lớp thuộc môn học VÀ do giảng viên này dạy
        $classes = Classe::where('subject_id', $subject_id)
                           // ->where('teacher_id', $teacher_id) // (Quan trọng: Mở comment này nếu bảng 'classes' có 'teacher_id')
                           ->get();

        return response()->json($classes);
    }

    /**
     * 3. Lấy các báo cáo dựa trên lớp học
     */
    public function getReportsForClass(Request $request, $class_id)
    {
        // (Chúng ta có thể check xem giảng viên có quyền xem lớp này không)
        $reports = Report::where('class_id', $class_id)->get();
        return response()->json($reports);
    }

    /**
     * 4. Lấy danh sách nộp bài dựa trên báo cáo
     */
    public function getSubmissionsForReport(Request $request, $report_id)
    {
        // Lấy submission kèm thông tin 'student'
        $submissions = Submission::with('student') // Giả sử có quan hệ 'student'
                                ->where('report_id', $report_id)
                                ->get();
                                
        // Xử lý lại dữ liệu để giống như code cũ của bạn (nếu cần)
        $formatted = $submissions->map(function($sub) {
            return [
                'submission_id' => $sub->submission_id,
                'student_id' => $sub->student->student_code ?? 'N/A', // Mã SV
                'student_name' => $sub->student->name ?? 'N/A', // Tên SV
                'submission_time' => $sub->created_at->format('Y-m-d H:i:s'),
                'status' => $sub->status,
                //...
            ];
        });

        return response()->json($formatted);
    }
}
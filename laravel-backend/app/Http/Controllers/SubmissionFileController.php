<?php

namespace App\Http\Controllers;

use App\Helpers\AuthHelper;
use App\Models\report_member;
use App\Models\submission_file;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SubmissionFileController extends Controller
{
    public function checkSubmitted()
    {
        $studentId = AuthHelper::isLogin();

        $data = DB::table('report_members as rm')

            // lấy thông tin report + class
            ->join('reports', 'rm.report_id', '=', 'reports.report_id')
            ->join('classes', 'reports.class_id', '=', 'classes.class_id')

            // lấy nhóm trưởng (NT) của nhóm
            ->leftJoin('report_members as leader', function ($join) {
                $join->on('leader.report_id', '=', 'rm.report_id')
                    ->on('leader.rm_code', '=', 'rm.rm_code')
                    ->where('leader.report_m_role', 'NT');
            })

            // lấy submission của nhóm trưởng
            ->leftJoin('submissions', 'submissions.student_id', '=', 'leader.student_id')

            // file submission
            ->leftJoin('submission_files', 'submission_files.submission_id', '=', 'submissions.submission_id')

            ->where('rm.student_id', $studentId)

            ->select(
                'rm.rm_code',
                'rm.rm_name',
                'reports.report_id',
                'reports.report_name',
                'reports.end_date',
                'classes.class_id',
                'classes.class_name',
                'submissions.submission_time',
                'submission_files.file_path',

                // status code
                DB::raw("
                CASE
                    WHEN submission_files.file_id IS NOT NULL THEN 'submitted'
                    ELSE 'pending'
                END AS status
            ")
            )

            ->orderBy('reports.report_id')
            ->get();

        if ($data->isEmpty()) {
            return response()->json([
                'message' => 'Sinh viên này chưa thuộc nhóm nào hoặc chưa có báo cáo.'
            ], 404);
        }

        return response()->json($data, 200);
    }

    public function getReportPendingGrading($reportId, $classId)
    {
        $teacherId = AuthHelper::isLogin();
        AuthHelper::roleTeacher();

        // Kiểm tra báo cáo có thuộc lớp + đúng giáo viên
        $report = DB::table('reports')
            ->join('classes', 'classes.class_id', '=', 'reports.class_id')
            ->where('reports.report_id', $reportId)
            ->where('reports.class_id', $classId)
            ->where('reports.teacher_id', $teacherId)
            ->first();

        if (!$report) {
            return response()->json([
                "message_error" => "Báo cáo không tồn tại hoặc không thuộc lớp này!"
            ], 404);
        }

        // Lấy danh sách nhóm + khoảng submission
        $data = DB::table('report_members as rm')

            // mặc định rm không có class_id → join qua report
            ->join('reports', 'reports.report_id', '=', 'rm.report_id')

            // join lớp để bảo đảm đúng class
            ->join('classes', 'classes.class_id', '=', 'reports.class_id')

            // nhóm trưởng
            ->leftJoin('report_members as leader', function ($join) {
                $join->on('leader.report_id', '=', 'rm.report_id')
                    ->on('leader.rm_code', '=', 'rm.rm_code')
                    ->where('leader.report_m_role', 'NT');
            })

            // sinh viên nhóm trưởng
            ->leftJoin('user_profiles as up', 'up.user_id', '=', 'leader.student_id')

            // submission mới nhất của nhóm trưởng
            ->leftJoin('submissions as s', function ($join) {
                $join->on('s.student_id', '=', 'leader.student_id');
            })

            // file mới nhất
            ->leftJoin('submission_files as sf', 'sf.submission_id', '=', 's.submission_id')

            // điểm
            ->leftJoin('grades as g', 'g.submission_id', '=', 's.submission_id')

            ->where('rm.report_id', $reportId)
            ->where('classes.class_id', $classId)

            ->select(
                'rm.rm_name',
                'leader.student_id',
                'up.fullname as student_name',

                DB::raw('MAX(s.submission_id) as submission_id'),
                DB::raw('MAX(s.submission_time) as submission_time'),
                DB::raw('MAX(sf.file_path) as file_path'),
                DB::raw('MAX(g.score) as score')
            )

            ->groupBy(
                'rm.rm_name',
                'leader.student_id',
                'up.fullname'
            )

            ->orderBy('rm.rm_name')
            ->get();

        return response()->json($data, 200);
    }
}
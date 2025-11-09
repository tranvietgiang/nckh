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
    //
    // public function getLatestSubmissionFile($studentIdLeader)
    // {
    //     try {
    //         AuthHelper::isLogin();

    //         $getSubmissionFile = submission_file::select(
    //             "submissions.*",
    //             "submission_files.*",
    //             "report_members.*"
    //         )
    //             ->join("submissions", "submission_files.submission_id", "=", "submissions.submission_id")
    //             ->join("reports", "submissions.report_id", "=", "reports.report_id")
    //             ->join("report_members", "reports.report_id", "=", "report_members.report_id")
    //             ->where("submission.student_id", $studentIdLeader)
    //             ->latest("submissions.submission_time")
    //             ->get();

    //         if ($getSubmissionFile) {
    //             return response()->json($getSubmissionFile, 200);
    //         }

    //         // Không có bài nộp nào
    //         return response()->json(['message' => 'Chưa có bài nộp nào'], 404);
    //     } catch (\Exception $e) {
    //         Log::error('❌ Lỗi lấy file submission: ' . $e->getMessage());
    //         return response()->json(['error' => '❌ Lỗi hệ thống khi truy vấn dữ liệu'], 500);
    //     }
    // }

    public function checkSubmitted()
    {

        $studentId = AuthHelper::isLogin();

        // Lấy tất cả nhóm mà sinh viên này tham gia
        $data = DB::table('report_members')
            ->select(
                'report_members.rm_code',
                'report_members.rm_name',
                'reports.report_id',
                'reports.report_name',
                'reports.teacher_id',
                'reports.end_date',
                'classes.class_id',
                'classes.class_name',
                'submission_files.file_path',
                'submissions.submission_time',
                DB::raw("CASE WHEN submission_files.file_id IS NOT NULL THEN 'submitted' ELSE 'pending' END AS status")
            )
            ->join('reports', 'report_members.report_id', '=', 'reports.report_id')
            ->join('classes', 'reports.class_id', '=', 'classes.class_id')
            ->leftJoin('submissions', function ($join) {
                $join->on('reports.report_id', '=', 'submissions.report_id');
            })
            ->leftJoin('submission_files', 'submissions.submission_id', '=', 'submission_files.submission_id')
            ->where('report_members.student_id', $studentId)
            ->orderBy('reports.report_id', 'asc')
            ->get();

        if ($data->isEmpty()) {
            return response()->json(['message' => 'Sinh viên này chưa thuộc nhóm nào hoặc chưa có báo cáo.'], 404);
        }

        return response()->json($data, 200);
    }
}
<?php

namespace App\Http\Controllers;

use App\Helpers\AuthHelper;
use App\Models\report_member;
use App\Models\submission_file;
use Illuminate\Http\Request;
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

    public function getGroupsByLeader($studentIdLeader)
    {

        try {
            AuthHelper::isLogin();

            $getSubmissionFile = submission_file::select(
                "submissions.*",
                "submission_files.*",
                "report_members.*"
            )
                ->join("submissions", "submission_files.submission_id", "=", "submissions.submission_id")
                ->join("reports", "submissions.report_id", "=", "reports.report_id")
                ->join("report_members", "reports.report_id", "=", "report_members.report_id")
                ->where("submissions.student_id", $studentIdLeader)
                ->latest("submissions.submission_time")
                ->first();

            if ($getSubmissionFile) {
                return response()->json($getSubmissionFile, 200);
            }

            return response()->json(['message' => 'Chưa có bài nộp nào'], 404);
        } catch (\Exception $e) {
            Log::error('❌ Lỗi lấy file submission: ' . $e->getMessage());
            return response()->json(['error' => '❌ Lỗi hệ thống khi truy vấn dữ liệu'], 500);
        }
    }
}
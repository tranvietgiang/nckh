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

            // 🔥 lấy nhóm trưởng (NT) của nhóm
            ->leftJoin('report_members as leader', function ($join) {
                $join->on('leader.report_id', '=', 'rm.report_id')
                    ->on('leader.rm_code', '=', 'rm.rm_code')
                    ->where('leader.report_m_role', 'NT');
            })

            // 🔥 lấy submission của nhóm trưởng
            ->leftJoin('submissions', 'submissions.student_id', '=', 'leader.student_id')

            // 🔥 file submission
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

                // 🔥 status code
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
}
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

        $data = DB::table('report_members')
            ->join('reports', 'report_members.report_id', '=', 'reports.report_id')
            ->join('classes', 'reports.class_id', '=', 'classes.class_id')

            // 🔥 lấy submission mới nhất
            ->leftJoin('submissions', function ($join) {
                $join->on('reports.report_id', '=', 'submissions.report_id')
                    ->whereRaw('submissions.submission_id = (
                    SELECT s2.submission_id 
                    FROM submissions s2 
                    WHERE s2.report_id = reports.report_id 
                    ORDER BY s2.submission_id DESC 
                    LIMIT 1
                )');
            })

            ->leftJoin('submission_files', 'submissions.submission_id', '=', 'submission_files.submission_id')

            ->where('report_members.student_id', $studentId)

            ->select(
                'report_members.rm_code',
                'report_members.rm_name',
                'reports.report_id',
                'reports.report_name',
                'reports.end_date',
                'classes.class_id',
                'classes.class_name',
                'submissions.submission_time',
                'submission_files.file_path',
                DB::raw("CASE WHEN submission_files.file_id IS NOT NULL 
                        THEN 'submitted' 
                        ELSE 'pending' 
                    END AS status")
            )

            ->orderBy('reports.report_id', 'asc')
            ->get();

        if ($data->isEmpty()) {
            return response()->json([
                'message' => 'Sinh viên này chưa thuộc nhóm nào hoặc chưa có báo cáo.'
            ], 404);
        }

        return response()->json($data, 200);
    }
}
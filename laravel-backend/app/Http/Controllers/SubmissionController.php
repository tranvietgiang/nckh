<?php

namespace App\Http\Controllers;

use App\Models\Report;
use Illuminate\Http\Request;
use App\Models\Submission;
use Illuminate\Support\Facades\DB;

class SubmissionController extends Controller
{
    public function indes()
    {
        $submissions = DB::table('submissions as s')
            ->join('users as u', 's.student_id', '=', 'u.user_id')
            ->join('user_profiles as up', 'u.user_id', '=', 'up.user_id')
            ->leftJoin('grades as g', 's.submission_id', '=', 'g.submission_id')
            ->select(
                's.submission_id',
                's.student_id',
                'up.fullname as student_name',
                's.submission_time',
                's.status',
                'g.score',
                'g.feedback'
            )
            ->get();

        return response()->json(['data' => $submissions]);
    }
    public function getSubmissionsByReport(Request $request)
    {
        $reportId = $request->query('report_id');

        if (!$reportId) {
            return response()->json([
                'data' => [],
                'message' => 'Thiếu report_id'
            ], 400);
        }

        // Lấy submissions và join bảng user_profiles
        $submissions = Submission::where('report_id', $reportId)
            ->join('user_profiles', 'submissions.student_id', '=', 'user_profiles.user_id')
            ->select(
                'submissions.submission_id',
                'submissions.student_id',
                'user_profiles.fullname as student_name',
                'submissions.submission_time',
                'submissions.status'
            )
            ->get();

        return response()->json([
            'data' => $submissions
        ]);
    }
}

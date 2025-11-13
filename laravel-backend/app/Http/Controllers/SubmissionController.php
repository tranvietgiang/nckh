<?php

namespace App\Http\Controllers;

use App\Helpers\AuthHelper;
use App\Models\Report;
use Illuminate\Http\Request;
use App\Models\Submission;
use Illuminate\Support\Facades\Auth;
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

        // Left join để luôn lấy submissions dù không có profile
        $submissions = Submission::where('report_id', $reportId)
            ->leftJoin('user_profiles', function ($join) {
                $join->on('submissions.student_id', '=', DB::raw('CAST(user_profiles.user_id AS CHAR)'));
            })
            ->select(
                'submissions.submission_id',
                'submissions.student_id',
                DB::raw('COALESCE(user_profiles.fullname, submissions.student_id) as student_name'),
                'submissions.submission_time',
                'submissions.status'
            )
            ->get();

        return response()->json([
            'data' => $submissions
        ]);
    }


    public function getSubmissionsByMajorClassSubjectTeacher($selectedMajor, $selectedSubject, $selectedClass, $selectedYear, $selectedReportId)
    {
        // Xác thực vai trò giáo viên
        AuthHelper::roleTeacher();
        $teacherId = Auth::id();

        $submissions = DB::table('submissions')
            ->join('reports', 'submissions.report_id', '=', 'reports.report_id')
            ->join('report_members', 'reports.report_id', '=', 'report_members.report_id')
            ->join('classes', 'reports.class_id', '=', 'classes.class_id')
            ->join('subjects', 'classes.subject_id', '=', 'subjects.subject_id')
            ->join('majors', 'classes.major_id', '=', 'majors.major_id')
            ->join('grades', 'submissions.submission_id', '=', 'grades.submission_id')
            ->join('submission_files', 'submissions.submission_id', '=', 'submission_files.submission_id')
            ->where('majors.major_id', $selectedMajor)
            ->where('subjects.subject_id', $selectedSubject)
            ->where('classes.class_id', $selectedClass)
            ->where('classes.academic_year', $selectedYear)
            ->where('submissions.report_id', $selectedReportId)
            ->where('classes.teacher_id', $teacherId)
            ->where('grades.score', 0)
            ->whereColumn('submissions.student_id', 'report_members.student_id')
            ->select('submissions.*', "report_members.rm_name", "grades.score", "submission_files.file_path")
            ->get();

        return response()->json($submissions, 200);
    }
}
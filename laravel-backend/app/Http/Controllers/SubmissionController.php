<?php

namespace App\Http\Controllers;

use App\Models\Report;
use Illuminate\Http\Request;
use App\Models\Submission;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Services\SubmissionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class SubmissionController extends Controller
{
    protected $submissionService;

    public function __construct(SubmissionService $submissionService)
    {
        $this->submissionService = $submissionService;
    }
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
        // 1. [SỬA LỖI] Lấy cả report_id và year
        $reportId = $request->query('report_id');
        $year = $request->query('year') ? (int) $request->query('year') : null;

        if (!$reportId) {
            return response()->json([
                'data' => [],
                'message' => 'Thiếu report_id'
            ], 400);
        }

        // 2. [SỬA LỖI LẦN NÀY] Chỉ định rõ bảng 'submissions.report_id'
        $query = Submission::where('submissions.report_id', $reportId)
            ->join('reports', 'submissions.report_id', '=', 'reports.report_id')
            ->leftJoin('user_profiles', function ($join) {
                $join->on('submissions.student_id', '=', DB::raw('CAST(user_profiles.user_id AS CHAR)'));
            });

        // 3. Thêm bộ lọc NĂM
        if ($year) {
            $query->whereYear('submissions.submission_time', $year);
        }

        // 4. Lấy kết quả
        $submissions = $query->select(
                'reports.report_name', // Lấy tên báo cáo
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
    public function getSubmissionsForReport(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'report_id' => 'required',
            'year' => 'nullable|integer|digits:4' // 'year' là tùy chọn
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        $reportId = $request->input('report_id');
        // [SỬA LỖI] Lấy 'year' (nếu có), nếu không thì là null
        $year = $request->input('year') ? (int) $request->input('year') : null;

        // [SỬA LỖI] Truyền cả $reportId và $year vào Service
        $result = $this->submissionService->getSubmissionsByReportId($reportId, $year);

        if ($result['success']) {
            return response()->json(['data' => $result['data']], 200);
        } else {
            return response()->json(['message' => $result['message']], 500);
        }
    }

    /**
     * Xử lý API GET /nhhh/submission/reports (Flow 2)
     * Đây là hàm xử lý khi bạn CHỈ chọn Năm
     */
    public function getReportsByYear(Request $request)
    {

        $validator = Validator::make($request->all(), [
            'year' => 'required|integer|digits:4', // 'year' là bắt buộc
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        $year = (int) $request->input('year');

        // Gọi hàm service tương ứng
        $result = $this->submissionService->getSubmissionsByYear($year);

        if ($result['success']) {
            return response()->json(['data' => $result['data']], 200);
        } else {
            return response()->json(['message' => $result['message']], 500);
        }
    }

}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Report;

class ReportController extends Controller
{
    public function getReportsByClass(Request $request)
    {
        $classId = $request->query('class_id');

        $reports = Report::where('class_id', $classId)
            ->withCount('submissions') // số lượng bài nộp
            ->get(['id as report_id', 'name as report_name']); // đổi theo tên field bạn muốn trả

        return response()->json([
            'data' => $reports
        ]);
    }
}

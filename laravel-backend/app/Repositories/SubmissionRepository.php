<?php

namespace App\Repositories;

use App\Models\Submission;
use Illuminate\Support\Facades\DB;

class SubmissionRepository
{
    /**
     * [SỬA LỖI] Query cho Flow 1 (Lỗi của bạn nằm ở đây)
     * @param string $reportId
     * @param int|null $year   <-- [SỬA LỖI] Nhận thêm $year (có thể null)
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getSubmissionsByReportId(string $reportId, ?int $year)
    {
        dd($year);
        // 1. Bắt đầu xây dựng query
        $query = Submission::join('users', 'submissions.student_id', '=', 'users.user_id')
            ->join('reports', 'submissions.report_id', '=', 'reports.report_id')
            ->where('submissions.report_id', $reportId); // Luôn lọc theo report_id

        // 2. [ĐÂY LÀ SỬA LỖI QUAN TRỌNG NHẤT]
        // Nếu $year có giá trị (không phải null), thì thêm điều kiện lọc
        if ($year) {
            $query->whereYear('submissions.submission_time', $year);
        }
        dd($query->toSql(), $query->getBindings());
        // 3. Thực thi query và lấy các cột cần thiết
        // (Bạn phải join với 'reports' và 'users' để lấy tên)
        return $query->select(
                'reports.report_name',
                'submissions.submission_id',
                'submissions.student_id',
                'users.name as student_name', // Giả sử cột tên là 'name'
                'submissions.status',
                'submissions.submission_time'
            )
            ->get();
    }


    /**
     * Query cho Flow 2 (Hàm này đã đúng từ trước)
     * @param int $year
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getSubmissionsByYear(int $year)
    {
        return Submission::join('users', 'submissions.student_id', '=', 'users.user_id')
            ->join('reports', 'submissions.report_id', '=', 'reports.report_id')
            ->whereYear('submissions.submission_time', $year) // Lọc theo năm
            ->select(
                'reports.report_name',
                'submissions.submission_id',
                'submissions.student_id',
                'users.name as student_name', // Giả sử cột tên là 'name'
                'submissions.status',
                'submissions.submission_time'
            )
            ->get();
    }
}
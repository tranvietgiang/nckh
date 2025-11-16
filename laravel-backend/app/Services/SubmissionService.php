<?php

namespace App\Services;

use App\Repositories\SubmissionRepository;
use Exception;
use Illuminate\Support\Facades\Log;

class SubmissionService
{
    protected $submissionRepository;

    public function __construct(SubmissionRepository $submissionRepository)
    {
        $this->submissionRepository = $submissionRepository;
    }

    /**
     * [SỬA LỖI] Service cho Flow 1
     * @param string $reportId
     * @param int|null $year   <-- [SỬA LỖI] Nhận thêm $year (có thể null)
     * @return array
     */
    public function getSubmissionsByReportId(string $reportId, ?int $year)
    {
        try {
            // [SỬA LỖI] Truyền $year xuống Repository
            $submissions = $this->submissionRepository->getSubmissionsByReportId($reportId, $year);
            
            return ['success' => true, 'data' => $submissions];
        } catch (Exception $e) {
            Log::error('Lỗi khi lấy submissions theo report_id: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Lỗi máy chủ'];
        }
    }

    /**
     * Service cho Flow 2
     * @param int $year
     * @return array
     */
    public function getSubmissionsByYear(int $year)
    {
        try {
            $submissions = $this->submissionRepository->getSubmissionsByYear($year);
            
            return ['success' => true, 'data' => $submissions];
        } catch (Exception $e) {
            Log::error('Lỗi khi lấy submissions theo năm: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Lỗi máy chủ'];
        }
    }
}
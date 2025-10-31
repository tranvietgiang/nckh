<?php

namespace App\Services;

use App\Repositories\ErrorImportRepository;

class ErrorImportService
{
    public function __construct(protected ErrorImportRepository $repo) {}

    public function getStudentErrors(array $params): array
    {
        $classId   = (int)($params['class_id']   ?? 0);
        $teacherId = (string)($params['teacher_id'] ?? '');
        $majorId   = (int)($params['major_id']   ?? 0);

        if (!$classId || !$teacherId || !$majorId) {
            return ['success' => false, 'code' => 422, 'message' => 'Dữ liệu không hợp lệ'];
        }

        $rows = $this->repo->getStudentErrors($classId, $teacherId, $majorId);

        if ($rows->isEmpty()) {
            return ['success' => false, 'code' => 404, 'message' => 'Không có lỗi import của sinh viên'];
        }

        return ['success' => true, 'code' => 200, 'data' => $rows];
    }
}

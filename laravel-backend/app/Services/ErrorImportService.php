<?php

namespace App\Services;

use App\Repositories\ErrorImportRepository;

class ErrorImportService
{
    public function __construct(protected ErrorImportRepository $repo)
    {
        $this->repo = $repo;
    }

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
            return ['success' => false, 'message_error' => 'Không có lỗi import của sinh viên'];
        }

        return ['success' => true, "data" => $rows];
    }

    public function deleteErrorImportStudent(array $params): array
    {
        $classId   = (int)($params['class_id'] ?? 0);
        $teacherId = (string)($params['teacher_id'] ?? '');
        $majorId   = (int)($params['major_id'] ?? 0);

        if (!$classId || !$teacherId || !$majorId) {
            return [
                'success' => false,
                'message' => 'Thiếu dữ liệu cần thiết!'
            ];
        }

        $deleted = $this->repo->deleteErrorImportStudent($classId, $teacherId, $majorId);

        if ($deleted > 0) {
            return [
                'success' => true,
            ];
        }

        return [
            'success' => false,
            'message_error' => 'Không có bản ghi nào để xóa.'
        ];
    }
}

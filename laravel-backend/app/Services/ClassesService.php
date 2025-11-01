<?php

namespace App\Services;

use App\Repositories\ClassesRepository;

class ClassesService
{

    public function __construct(protected ClassesRepository $repo) {}

    public function deleteByClass(array $params): array
    {
        $classId   = (int)($params['class_id'] ?? 0);
        $teacherId = (string)($params['teacher_id'] ?? '');

        if (!$classId || !$teacherId) {
            return [
                'success' => false,
                'code' => 422,
                'message_error' => 'Dữ liệu không hợp lệ'
            ];
        }

        $deleted = $this->repo->deleteByClass($classId, $teacherId);

        if ($deleted === 0) {
            return [
                'success' => false,
                'message_error' => 'Không thể xóa lớp (còn sinh viên hoặc lớp không tồn tại)'
            ];
        }

        return [
            'success' => true,
            'message_error' => 'Xóa lớp thành công',
        ];
    }
}
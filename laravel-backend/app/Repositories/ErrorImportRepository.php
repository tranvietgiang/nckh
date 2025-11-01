<?php

namespace App\Repositories;

use App\Models\ImportError;
use Illuminate\Support\Collection;

class ErrorImportRepository
{
    /**
     * @return Collection<ImportError>
     */
    public function getStudentErrors(int $classId, string $teacherId, int $majorId): Collection
    {
        return ImportError::query()
            ->where('class_id', $classId)
            ->where('teacher_id', $teacherId)
            ->where('major_id', $majorId)
            ->where('typeError', 'student')
            ->get();
    }

    public function deleteErrorImportStudent(int $classId, string $teacherId, int $majorId): int
    {
        if ($classId && $teacherId && $majorId) {
            return ImportError::where('class_id', $classId)
                ->where('teacher_id', $teacherId)
                ->where('major_id', $majorId)
                ->delete();
        }

        return 0;
    }
}
<?php

namespace App\Repositories;

use App\Models\Classe;
use App\Models\User;
use App\Models\user_profile;
use App\Models\Major;
use App\Models\Subject;
use App\Models\Report;
use App\Models\Submission;
use Illuminate\Support\Facades\DB;

class TeacherRepository
{
    /**
     * Lấy danh sách môn học của giáo viên
     */
    public function getSubjectsByTeacherId(string $teacherId)
    {
        return Subject::whereHas('classes', function ($q) use ($teacherId) {
            $q->where('teacher_id', $teacherId);
        })->get();
    }

    /**
     * Lấy danh sách lớp theo môn và giáo viên
     */
    public function getClassesBySubjectId(int $subjectId, string $teacherId)
    {
        return Classe::where('subject_id', $subjectId)
            ->where('teacher_id', $teacherId)
            ->get();
    }

    /**
     * Lấy danh sách báo cáo theo lớp và giáo viên
     */
    public function getReportsByClassId(int $classId, string $teacherId)
    {
        return Report::where('class_id', $classId)
            ->whereHas('classe', function ($q) use ($teacherId) {
                $q->where('teacher_id', $teacherId);
            })
            ->get();
    }

    /**
     * Lấy submissions theo báo cáo và giáo viên
     */
    public function getSubmissionsByReportId(int $reportId, string $teacherId)
    {
        return Submission::where('report_id', $reportId)
            ->whereHas('report', function ($q) use ($teacherId) {
                $q->whereHas('classe', function ($q2) use ($teacherId) {
                    $q2->where('teacher_id', $teacherId);
                });
            })
            ->get();
    }
}

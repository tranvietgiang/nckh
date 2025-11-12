<?php

namespace App\Services;

use App\Repositories\TeacherRepository;

class TeacherService
{
    protected $teacherRepo;

    public function __construct(TeacherRepository $teacherRepo)
    {
        $this->teacherRepo = $teacherRepo;
    }

    public function getSubjects(int $teacherId)
    {
        return $this->teacherRepo->getSubjectsByTeacherId($teacherId);
    }

    public function getClasses(int $subjectId, int $teacherId)
    {
        return $this->teacherRepo->getClassesBySubjectId($subjectId, $teacherId);
    }

    public function getReports(int $classId, int $teacherId)
    {
        return $this->teacherRepo->getReportsByClassId($classId, $teacherId);
    }

    public function getSubmissions(int $reportId, int $teacherId)
    {
        return $this->teacherRepo->getSubmissionsByReportId($reportId, $teacherId);
    }
}

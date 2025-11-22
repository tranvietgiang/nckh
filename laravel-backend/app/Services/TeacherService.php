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

    public function getSubjects(string $teacherId)
    {
        return $this->teacherRepo->getSubjectsByTeacherId($teacherId);
    }

    public function getClasses(int $subjectId, string $teacherId)
    {
        return $this->teacherRepo->getClassesBySubjectId($subjectId, $teacherId);
    }

    public function getReports(int $classId, string $teacherId)
    {
        return $this->teacherRepo->getReportsByClassId($classId, $teacherId);
    }

    public function getSubmissions(int $reportId, string $teacherId)
    {
        return $this->teacherRepo->getSubmissionsByReportId($reportId, $teacherId);
    }
}

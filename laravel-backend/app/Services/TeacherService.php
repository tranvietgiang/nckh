<?php

namespace App\Services;

use App\Models\Submission;
use App\Repositories\TeacherRepository;
use DB;

class TeacherService
{
    protected $repo;

    public function __construct(TeacherRepository $repo)
    {
        $this->repo = $repo;
    }

    public function getSubjects($teacherId)
    {
        if (!$teacherId) return collect();
        return $this->repo->getSubjectsByTeacherId((int)$teacherId);
    }

    public function getClasses($subjectId)
    {
        return $this->repo->getClassesBySubjectId((int)$subjectId);
    }

    public function getReports($classId)
    {
        return $this->repo->getReportsByClassId((int)$classId);
    }

    public function getSubmissions($reportId)
    {
        return $this->repo->getSubmissionsByReportId((int)$reportId);
    }
    public function saveGrade(array $data)
    {
        return DB::transaction(function () use ($data) {
            $submission = Submission::findOrFail($data['submission_id']);
            $submission->score = $data['score'];
            $submission->feedback = $data['feedback'];
            $submission->teacher_id = $data['teacher_id'];
            $submission->status = 'graded';
            $submission->save();

            return $submission;
        });
    }
}

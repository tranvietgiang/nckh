<?php

namespace App\Services;

use App\Repositories\GradeRepository;

class GradeService
{
    protected $gradeRepo;

    public function __construct(GradeRepository $gradeRepo)
    {
        $this->gradeRepo = $gradeRepo;
    }

    public function storeGrade(array $data)
    {
        return $this->gradeRepo->create($data);
    }
}

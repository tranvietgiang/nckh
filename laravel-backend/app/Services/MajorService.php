<?php

namespace App\Services;

use App\Repositories\MajorRepository;

class MajorService
{
    protected $majorRepo;

    public function __construct(MajorRepository $majorRepo)
    {
        $this->majorRepo = $majorRepo;
    }

    public function getMajors()
    {
        $majors = $this->majorRepo->getAll();

        if ($majors->count() > 0) {
            return $majors;
        }

        return [
            'success' => false,
            'message' => 'Không có dữ liệu ngành học'
        ];
    }
}

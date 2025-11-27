<?php

namespace App\Repositories;

use App\Models\Grade;

class GradeRepository
{
    public function create(array $data)
    {
        return Grade::create($data);
    }
}

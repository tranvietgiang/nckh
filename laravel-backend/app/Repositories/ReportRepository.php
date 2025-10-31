<?php

namespace App\Repositories;

use App\Models\Report;

class ReportRepository
{
    public function create(array $data)
    {
        return Report::create($data);
    }

    public function getAllByClass($classId)
    {
        return Report::where('class_id', $classId)->get();
    }
}
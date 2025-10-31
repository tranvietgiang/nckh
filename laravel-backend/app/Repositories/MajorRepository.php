<?php

namespace App\Repositories;

use App\Helpers\AuthHelper;
use App\Models\Major;

class MajorRepository
{
    public function getAll()
    {
        return Major::all();
    }
}

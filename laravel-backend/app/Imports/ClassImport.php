<?php

namespace App\Imports;

use App\Models\Classe;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class ClassImport implements ToModel, WithHeadingRow
{
    public function model(array $row)
    {
        // Bỏ qua dòng trống
        if (empty($row[0]) || empty($row[1])) {
            return null;
        }

        return new Classe([
            'class_name'     => $row[0],
            'class_code'     => $row[1],
            'teacher_id'     => $row[2],
            'major_id'       => $row[3],
            'semester'       => $row[4],
            'academic_year'  => $row[5],
        ]);
    }

}

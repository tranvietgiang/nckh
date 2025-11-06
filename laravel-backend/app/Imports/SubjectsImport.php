<?php

namespace App\Imports;

use App\Models\Subject;
use App\Models\ImportError;
use App\Models\Major;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class SubjectImport implements ToCollection, WithHeadingRow
{
    public $success = 0;
    public $failed = 0;
    public $totalSubjects = 0;

    public function collection(Collection $rows)
    {
        foreach ($rows as $row) {
            $this->totalSubjects++;

            $subjectName = trim((string)($row['ten_mon'] ?? ''));
            $majorName = trim((string)($row['nganh'] ?? ''));

            // Kiểm tra dữ liệu thiếu
            if (empty($subjectName) || empty($majorName)) {
                ImportError::create([
                    'typeError' => 'subject',
                    'fullname' => $subjectName ?: 'Không có tên môn',
                    'email' => $majorName ?: 'Không có ngành',
                    'reason' => 'Thiếu dữ liệu tên môn hoặc ngành'
                ]);
                $this->failed++;
                continue;
            }

            // Kiểm tra ngành tồn tại
            $major = Major::where('major_name', $majorName)->first();
            if (!$major) {
                ImportError::create([
                    'typeError' => 'subject',
                    'fullname' => $subjectName,
                    'email' => $majorName,
                    'reason' => 'Ngành không tồn tại trong hệ thống'
                ]);
                $this->failed++;
                continue;
            }

            // Tạo môn học
            Subject::create([
                'subject_name' => $subjectName,
                'major_id' => $major->major_id,
            ]);

            $this->success++;
        }
    }
}
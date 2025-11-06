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

            $subjectName = strtoupper(trim((string)($row['ten_mon'] ?? '')));
            $subjectCode = strtoupper(trim((string)($row['ma_mom'] ?? '')));
            $majorName   = strtoupper(trim((string)($row['ten_nganh'] ?? '')));

            // 🟡 Kiểm tra thiếu dữ liệu
            if (empty($subjectName) || empty($majorName)) {
                ImportError::create([
                    'typeError' => 'subject',
                    'fullname'  => $subjectName ?: 'Không có tên môn',
                    'email'     => $majorName ?: 'Không có ngành',
                    'reason'    => 'Thiếu dữ liệu tên môn hoặc ngành'
                ]);
                $this->failed++;
                continue;
            }

            // 🔍 Kiểm tra ngành tồn tại (theo tên hoặc viết tắt)
            $major = Major::where('major_name', 'LIKE', "%{$majorName}%")
                ->orWhere('major_abbreviate', strtoupper($majorName))
                ->first();

            if (!$major) {
                ImportError::create([
                    'typeError' => 'subject',
                    'fullname'  => $subjectName,
                    'email'     => $majorName,
                    'reason'    => 'Ngành không tồn tại trong hệ thống'
                ]);
                $this->failed++;
                continue;
            }

            // ✅ Tạo môn học
            Subject::create([
                'subject_name' => $subjectName,
                'subject_code' => $subjectCode,
                'major_id'     => $major->major_id,
            ]);

            $this->success++;
        }
    }
}
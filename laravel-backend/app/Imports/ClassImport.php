<?php

namespace App\Imports;

use App\Models\Classe;
use App\Models\User;
use App\Models\Major;
use App\Models\ImportError;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class ClassImport implements ToCollection, WithHeadingRow
{
    public $success = 0;
    public $failed = 0;
    public $totalClass = 0;

    public function collection(Collection $rows)
    {
        if ($rows->isEmpty()) {
            throw new \Exception("❌ File Excel không có dữ liệu!");
        }

        foreach ($rows as $row) {
            $this->totalClass++;

            $className = trim((string)($row['ten_lop'] ?? ''));
            $classCode = strtoupper(trim((string)($row['ma_lop'] ?? '')));
            $teacherId = trim((string)($row['giao_vien'] ?? ''));
            $majorRaw  = trim((string)($row['nganh'] ?? ''));
            $semester  = trim((string)($row['hoc_ky'] ?? ''));
            $academic  = trim((string)($row['nam_hoc'] ?? ''));

            // Xác định major_id (cho phép nhập ID hoặc tên ngành)
            $major = is_numeric($majorRaw)
                ? Major::find($majorRaw)
                : Major::where('major_name', 'LIKE', "%$majorRaw%")->first();

            if (!$major) {
                $this->failed++;
                ImportError::create([
                    'user_id'    => $teacherId,
                    'reason'     => "Không tìm thấy ngành: $majorRaw",
                    'major_id'   => null,
                    'teacher_id' => $teacherId,
                ]);
                continue;
            }

            // Kiểm tra giáo viên
            $teacher = User::where('user_id', $teacherId)->where('role', 'teacher')->first();
            if (!$teacher) {
                $this->failed++;
                ImportError::create([
                    'user_id'    => null,
                    'reason'     => "Không tìm thấy giáo viên: $teacherId",
                    'major_id'   => $major->major_id,
                    'teacher_id' => $teacherId,
                ]);
                continue;
            }

            // Kiểm tra trùng mã lớp
            $exists = Classe::where('class_code', $classCode)->exists();
            if ($exists) {
                $this->failed++;
                ImportError::create([
                    'user_id'    => $teacherId,
                    'reason'     => "Trùng mã lớp: $classCode",
                    'major_id'   => $major->major_id,
                    'teacher_id' => $teacherId,
                ]);
                continue;
            }

            try {
                DB::transaction(function () use ($className, $classCode, $teacherId, $major, $semester, $academic) {
                    Classe::create([
                        'class_name'     => $className,
                        'class_code'     => $classCode,
                        'teacher_id'     => $teacherId,
                        'major_id'       => $major->major_id,
                        'semester'       => $semester ?: '1',
                        'academic_year'  => $academic ?: date('Y') . '-' . (date('Y') + 1),
                    ]);
                });

                $this->success++;
            } catch (\Throwable $e) {
                $this->failed++;
                ImportError::create([
                    'user_id'    => $teacherId,
                    'reason'     => 'Lỗi hệ thống: ' . $e->getMessage(),
                    'major_id'   => $major->major_id,
                    'teacher_id' => $teacherId,
                ]);
            }
        }
    }
}
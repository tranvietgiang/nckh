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

    protected ?string $teacherId;
    protected ?int $majorId;

    public function __construct(?string $teacherId = null, ?int $majorId = null)
    {
        $this->teacherId = $teacherId;
        $this->majorId   = $majorId;

        $majorExist = Major::where('major_id', $this->majorId)->exists();
        $teacherExist = User::where('user_id', $this->teacherId)
            ->where('role', 'teacher')
            ->exists();

        if (!$majorExist) {
            throw new \Exception("❌ Không tìm thấy ngành học hợp lệ!");
        }

        if (!$teacherExist) {
            throw new \Exception("❌ Không tìm thấy giảng viên hợp lệ!");
        }
    }

    public function collection(Collection $rows)
    {
        if ($rows->isEmpty()) {
            throw new \Exception("❌ File Excel không có dữ liệu!");
        }

        foreach ($rows as $row) {
            $this->totalClass++;

            $className = trim((string)($row['ten_lop'] ?? ''));
            $classCode = strtoupper(trim((string)($row['ma_lop'] ?? '')));
            $semester  = trim((string)($row['hoc_ky'] ?? ''));
            $academic  = trim((string)($row['nam_hoc'] ?? ''));

            if (empty($className) || empty($classCode)) {
                $this->failed++;
                ImportError::create([
                    'user_id'    => $this->teacherId,
                    'fullname'   => null,
                    'email'      => null,
                    'reason'     => 'Thiếu tên lớp hoặc mã lớp',
                    'major_id'   => $this->majorId,
                    'teacher_id' => $this->teacherId,
                ]);
                continue;
            }

            // Kiểm tra trùng mã lớp
            $exists = Classe::where('class_code', $classCode)->exists();
            if ($exists) {
                $this->failed++;
                ImportError::create([
                    'user_id'    => $this->teacherId,
                    'fullname'   => null,
                    'email'      => null,
                    'reason'     => "Trùng mã lớp: $classCode",
                    'major_id'   => $this->majorId,
                    'teacher_id' => $this->teacherId,
                ]);
                continue;
            }

            try {
                DB::transaction(function () use ($className, $classCode, $semester, $academic) {
                    Classe::create([
                        'class_name'     => $className,
                        'class_code'     => $classCode,
                        'teacher_id'     => $this->teacherId,
                        'major_id'       => $this->majorId,
                        'semester'       => $semester ?: '1',
                        'academic_year'  => $academic ?: date('Y') . '-' . (date('Y') + 1),
                    ]);
                });

                $this->success++;
            } catch (\Throwable $e) {
                $this->failed++;
                ImportError::create([
                    'user_id'    => $this->teacherId,
                    'fullname'   => null,
                    'email'      => null,
                    'reason'     => 'Lỗi hệ thống khi lưu DB: ' . $e->getMessage(),
                    'major_id'   => $this->majorId,
                    'teacher_id' => $this->teacherId,
                ]);
            }
        }
    }
}

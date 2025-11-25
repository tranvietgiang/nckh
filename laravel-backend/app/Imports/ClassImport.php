<?php

namespace App\Imports;

use App\Models\Classe;
use App\Models\User;
use App\Models\Major;
use App\Models\Subject;
use App\Models\ImportError;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class ClassImport implements ToCollection, WithHeadingRow
{
    public $successList = [];
    public $errors = [];
    public $success = 0;
    public $failed = 0;
    public $totalClass = 0;

    public function collection(Collection $rows)
    {
        if ($rows->isEmpty()) {
            throw new \Exception("❌ File Excel không có dữ liệu!");
        }

        // CHUẨN HÓA HEADER TIẾNG VIỆT → KEY CHUẨN
        $headerMap = [
            'tên_lớp' => 'ten_lop',
            'ten_lop' => 'ten_lop',

            'mã_lớp' => 'ma_lop',
            'ma_lop' => 'ma_lop',

            'giáo_viên' => 'giao_vien',
            'giao_vien' => 'giao_vien',

            'ngành' => 'nganh',
            'nganh' => 'nganh',

            'môn_học' => 'mon_hoc',
            'mon_hoc' => 'mon_hoc',

            'học_kỳ' => 'hoc_ky',
            'hoc_ky' => 'hoc_ky',

            'năm_học' => 'nam_hoc',
            'nam_hoc' => 'nam_hoc',
        ];

        // Convert key tiếng Việt → key chuẩn
        $rows = $rows->map(function ($row) use ($headerMap) {
            $new = [];
            foreach ($row as $key => $value) {
                $k = mb_strtolower(trim($key));
                $new[$headerMap[$k] ?? $k] = $value;
            }
            return $new;
        });

        foreach ($rows as $index => $row) {
            $this->totalClass++;

            $className  = trim((string)($row['ten_lop'] ?? ''));
            $classCode  = strtoupper(trim((string)($row['ma_lop'] ?? '')));
            $teacherId  = trim((string)($row['giao_vien'] ?? ''));
            $majorRaw   = trim((string)($row['nganh'] ?? ''));
            $subjectRaw = trim((string)($row['mon_hoc'] ?? ''));
            $semester   = trim((string)($row['hoc_ky'] ?? ''));
            $academic   = trim((string)($row['nam_hoc'] ?? ''));

            // 1) Tìm major_id
            $major = is_numeric($majorRaw)
                ? Major::find($majorRaw)
                : Major::where('major_name', 'LIKE', "%$majorRaw%")->first();

            if (!$major) {
                $this->failed++;
                ImportError::create([
                    'reason' => "Không tìm thấy ngành: $majorRaw",
                    'major_id' => null,
                    'teacher_id' => $teacherId ?: null,
                ]);
                $this->errors[] = [
                    'row' => $index + 1,
                    'error' => "Không tìm thấy ngành: $majorRaw"
                ];
                continue;
            }

            // 2) Tìm subject_id
            $subject = is_numeric($subjectRaw)
                ? Subject::find($subjectRaw)
                : Subject::where('subject_name', 'LIKE', "%$subjectRaw%")->first();

            if (!$subject) {
                $this->failed++;
                ImportError::create([
                    'reason' => "Không tìm thấy môn học: $subjectRaw",
                    'major_id' => $major->major_id,
                    'teacher_id' => $teacherId ?: null,
                ]);
                $this->errors[] = [
                    'row' => $index + 1,
                    'error' => "Không tìm thấy môn học: $subjectRaw"
                ];
                continue;
            }

            // 3) Kiểm tra giáo viên
            $teacher = User::where('user_id', $teacherId)
                ->where('role', 'teacher')
                ->first();

            if (!$teacher) {
                $this->failed++;
                ImportError::create([
                    'reason' => "Không tìm thấy giáo viên: $teacherId",
                    'major_id' => $major->major_id,
                    'teacher_id' => $teacherId ?: null,
                ]);
                $this->errors[] = [
                    'row' => $index + 1,
                    'error' => "Không tìm thấy giáo viên: $teacherId"
                ];
                continue;
            }

            // 4) Kiểm tra trùng mã lớp
            if (Classe::where('class_code', $classCode)->exists()) {
                $this->failed++;
                ImportError::create([
                    'reason' => "Trùng mã lớp: $classCode",
                    'major_id' => $major->major_id,
                    'teacher_id' => $teacherId ?: null,
                ]);
                $this->errors[] = [
                    'row' => $index + 1,
                    'error' => "Trùng mã lớp: $classCode"
                ];
                continue;
            }

            // 5) Lưu lớp
            try {
                DB::transaction(function () use ($className, $classCode, $teacherId, $major, $subject, $semester, $academic) {
                    Classe::create([
                        'class_name' => $className,
                        'class_code' => $classCode,
                        'teacher_id' => $teacherId,
                        'major_id' => $major->major_id,
                        'subject_id' => $subject->subject_id,
                        'semester' => $semester ?: '1',
                        'academic_year' => $academic ?: date('Y') . '-' . (date('Y') + 1),
                    ]);
                });

                $this->success++;
                $this->successList[] = $row;
            } catch (\Throwable $e) {
                $this->failed++;
                ImportError::create([
                    'reason' => "Lỗi hệ thống: " . $e->getMessage(),
                    'major_id' => $major->major_id,
                    'teacher_id' => $teacherId ?: null,
                ]);
                $this->errors[] = [
                    'row' => $index + 1,
                    'error' => "Lỗi hệ thống: " . $e->getMessage()
                ];
            }
        }
    }
}

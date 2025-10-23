<?php

namespace App\Imports;

use App\Models\User;
use App\Models\user_profile;
use App\Models\ImportError;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use PhpOffice\PhpSpreadsheet\Shared\Date;

class StudentsImport implements ToCollection, WithHeadingRow
{
    public $success = 0;
    public $failed = 0;
    public $totalStudent = 0;

    protected ?int $classId;
    protected ?string $teacherId;

    public function __construct(?int $classId = null, ?string $teacherId = null)
    {
        $this->classId   = $classId;
        $this->teacherId = $teacherId;
    }

    public function collection(Collection $rows)
    {
        foreach ($rows as $row) {
            $this->totalStudent++;

            // --- Lấy dữ liệu ---
            $msv       = strtoupper(trim((string)($row['msv'] ?? '')));
            $class     = strtoupper(trim((string)($row['lop_sv'] ?? '')));
            $ten       = trim((string)($row['ten'] ?? ''));
            $birthdate = trim((string)($row['ngay_sinh'] ?? ''));
            $phone     = trim((string)($row['phone'] ?? ''));
            $email     = strtolower(trim((string)($row['email'] ?? '')));
            $major     = strtolower(trim((string)($row['nganh'] ?? '')));

            // --- Chuẩn hóa ngày ---
            if (is_numeric($birthdate)) {
                try {
                    $birthdate = Date::excelToDateTimeObject($birthdate)->format('d/m/Y');
                } catch (\Throwable $e) {
                    $birthdate = null;
                }
            }

            // --- Thiếu dữ liệu cơ bản ---
            if (empty($msv) || empty($email) || empty($ten)) {
                $this->failed++;
                ImportError::create([
                    'user_id'    => $msv,
                    'fullname'       => $ten,
                    'email'      => $email,
                    'reason'     => 'Thiếu thông tin bắt buộc (MSV / Tên / Email)',
                    'class_id'   => $this->classId,
                    'teacher_id' => $this->teacherId,
                ]);
                continue;
            }

            // --- Kiểm tra ngành & mã SV ---
            $mapMajor = [
                'cntt' => 'TT',
                'dh'   => 'DH',
                'kt'   => 'KT',
            ];

            $expectedPrefix = $mapMajor[$major] ?? null;

            if ($expectedPrefix && !str_contains($msv, $expectedPrefix)) {
                $this->failed++;
                ImportError::create([
                    'user_id'    => $msv,
                    'name'       => $ten,
                    'email'      => $email,
                    'reason'     => "MSSV không khớp ngành (MSSV: $msv - Ngành: $major)",
                    'class_id'   => $this->classId,
                    'teacher_id' => $this->teacherId,
                ]);
                continue;
            }

            // --- Kiểm tra trùng MSSV hoặc email ---
            $exists = User::where('user_id', $msv)
                ->orWhere('email', $email)
                ->exists();

            if ($exists) {
                $this->failed++;
                ImportError::create([
                    'user_id'    => $msv,
                    'name'       => $ten,
                    'email'      => $email,
                    'reason'     => 'Trùng MSSV hoặc Email',
                    'class_id'   => $this->classId,
                    'teacher_id' => $this->teacherId,
                ]);
                continue;
            }

            // --- Tạo sinh viên ---
            try {
                DB::transaction(function () use ($msv, $ten, $email, $phone, $major, $class, $birthdate) {
                    User::create([
                        'user_id'  => $msv,
                        'email'    => $email,
                        'password' => Hash::make($msv),
                        'role'     => 'student',
                    ]);

                    user_profile::create([
                        'fullname'      => $ten,
                        'birthdate'     => $birthdate,
                        'phone'         => $phone,
                        'major'         => $major,
                        'class_student' => $class,
                        'class_id'      => $this->classId,
                        'user_id'       => $msv,
                    ]);
                });

                $this->success++;
            } catch (\Throwable $e) {
                $this->failed++;
                ImportError::create([
                    'user_id'    => $msv,
                    'name'       => $ten,
                    'email'      => $email,
                    'reason'     => 'Lỗi hệ thống khi lưu DB: ' . $e->getMessage(),
                    'class_id'   => $this->classId,
                    'teacher_id' => $this->teacherId,
                ]);
            }
        }
    }
}

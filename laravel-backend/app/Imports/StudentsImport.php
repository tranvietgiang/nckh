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

            $msv       = trim((string)($row['msv'] ?? ''));
            $class       = trim((string)($row['lop_sv'] ?? ''));
            $ten       = trim((string)($row['ten'] ?? ''));
            $birthdate = trim((string)($row['ngay_sinh'] ?? ''));
            $phone     = trim((string)($row['phone'] ?? ''));
            $email     = trim((string)($row['email'] ?? ''));
            $major     = trim((string)($row['nganh'] ?? ''));
            if ($major === "cntt") {

                if (is_numeric($birthdate)) {
                    $birthdate = Date::excelToDateTimeObject($birthdate)->format('d/m/Y');
                }

                if (!str_contains($msv, 'TT')) {
                    $this->failed++;
                    continue;
                }
            }

            // ❌ Trường hợp thiếu dữ liệu
            if (empty($msv) || empty($email) || empty($ten)) {
                $this->failed++;
                ImportError::create([
                    'user_id'    => $msv,
                    'name'       => $ten,
                    'email'      => $email,
                    'reason'     => 'Thiếu thông tin bắt buộc (MSV / Tên / Email)',
                    'class_id'   => $this->classId,
                    'teacher_id' => $this->teacherId,
                ]);
                continue;
            }

            // ❌ Trường hợp trùng MSSV hoặc email
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

            // ✅ Tạo sinh viên mới
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
        }
    }
}
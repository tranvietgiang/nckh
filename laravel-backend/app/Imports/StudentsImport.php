<?php

namespace App\Imports;

use App\Models\Classe;
use App\Models\User;
use App\Models\user_profile;
use App\Models\ImportError;
use App\Models\Major;
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
    protected ?int $majorId;

    public function __construct(?int $classId = null, ?string $teacherId = null, ?int $majorId = null)
    {
        $this->classId   = $classId;
        $this->teacherId = $teacherId;
        $this->majorId   = $majorId;
    }

    public function collection(Collection $rows)
    {
        $major = Major::find($this->majorId);
        $majorExist   = !!$major;
        $teacherExist = user_profile::where("user_id", $this->teacherId)->exists();
        $classExist   = Classe::where("class_id", $this->classId)->exists();

        if (!$majorExist || !$teacherExist || !$classExist) {
            throw new \Exception("❌ Lỗi server!");
            // throw new \Exception("❌ Lỗi server! Thiếu thông tin ngành/lớp/giảng viên.");
        }

        // Kiểm tra giáo viên có dạy lớp và ngành đó không
        $teacherValid = user_profile::select("user_profiles.user_id")
            ->join("classes", "classes.teacher_id", "=", "user_profiles.user_id")
            ->join("majors", "classes.major_id", "=", "majors.major_id")
            ->where("user_profiles.user_id", $this->teacherId)
            ->where("classes.class_id", $this->classId)
            ->where("majors.major_id", $this->majorId)
            ->exists();

        if (!$teacherValid) {
            throw new \Exception("❌ Giáo viên không dạy lớp này hoặc lớp không thuộc ngành đã chọn!");
        }

        // Xác định mã viết tắt ngành (VD: CNTT → TT, Đồ họa → DH)
        $mapMajor = [
            'cntt' => 'TT',
            'dh'   => 'DH',
        ];

        $abbr = $mapMajor[strtolower($major->major_abbreviate ?? '')] ?? null;

        if (!$abbr) {
            throw new \Exception("❌ Không xác định được mã ngành để kiểm tra MSSV!");
        }

        foreach ($rows as $row) {
            $this->totalStudent++;

            $msv       = strtoupper(trim((string)($row['msv'] ?? '')));
            $class     = strtoupper(trim((string)($row['lop_sv'] ?? '')));
            $ten       = trim((string)($row['ten'] ?? ''));
            $birthdate = trim((string)($row['ngay_sinh'] ?? ''));
            $phone     = trim((string)($row['phone'] ?? ''));
            $email     = strtolower(trim((string)($row['email'] ?? '')));

            // --- Chuẩn hóa ngày sinh ---
            if (is_numeric($birthdate)) {
                try {
                    $birthdate = Date::excelToDateTimeObject($birthdate)->format('d/m/Y');
                } catch (\Throwable $e) {
                    $birthdate = null;
                }
            }

            // --- Kiểm tra thiếu dữ liệu ---
            if (empty($msv) || empty($email) || empty($ten)) {
                $this->failed++;
                ImportError::create([
                    'user_id'    => $msv,
                    'fullname'   => $ten,
                    'email'      => $email,
                    'reason'     => 'Thiếu thông tin bắt buộc (MSV / Tên / Email)',
                    'class_id'   => $this->classId,
                    'teacher_id' => $this->teacherId,
                ]);
                continue;
            }

            // --- Kiểm tra MSSV khớp ngành ---
            if (!str_contains($msv, $abbr)) {
                $this->failed++;
                ImportError::create([
                    'user_id'    => $msv,
                    'fullname'   => $ten,
                    'email'      => $email,
                    'reason'     => "MSSV không khớp ngành (MSSV: $msv - Ngành: {$major->major_name}, yêu cầu chứa: {$abbr})",
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
                    'fullname'   => $ten,
                    'email'      => $email,
                    'reason'     => 'Trùng MSSV hoặc Email',
                    'class_id'   => $this->classId,
                    'teacher_id' => $this->teacherId,
                ]);
                continue;
            }

            // --- Tạo sinh viên ---
            try {
                DB::transaction(function () use ($msv, $ten, $email, $phone, $class, $birthdate) {
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
                        'major_id'      => $this->majorId,
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
                    'fullname'   => $ten,
                    'email'      => $email,
                    'reason'     => 'Lỗi hệ thống khi lưu DB: ' . $e->getMessage(),
                    'class_id'   => $this->classId,
                    'teacher_id' => $this->teacherId,
                ]);
            }
        }
    }
}
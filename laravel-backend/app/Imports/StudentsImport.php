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
    protected ?int $subjectId;
    protected ?string $academic_year;
    protected ?string $semester;

    public function __construct(
        ?int $classId = null,
        ?string $teacherId = null,
        ?int $majorId = null,
        ?int $subjectId = null,
        ?string $academic_year = null,
        ?string $semester = null,
    ) {
        $this->classId   = $classId;
        $this->teacherId = $teacherId;
        $this->majorId   = $majorId;
        $this->subjectId = $subjectId;
        $this->academic_year   = $academic_year;
        $this->semester   = $semester;

        // Kiểm tra thông tin đầu vào
        $majorExist  = Major::where('major_id', $this->majorId)->exists();
        if (!$majorExist) throw new \Exception("❌ Lỗi server! Ngành không tồn tại.");

        $teacherExist = user_profile::where('user_id', $this->teacherId)
            ->where('major_id', $this->majorId)
            ->exists();
        if (!$teacherExist) throw new \Exception("❌ Lỗi server! Giảng viên không dạy ngành này.");

        $classExist   = Classe::where('class_id', $this->classId)
            ->where('teacher_id', $this->teacherId)
            ->where('major_id', $this->majorId)
            ->exists();
        if (!$classExist) throw new \Exception("❌ Lỗi server! Lớp không thuộc giáo viên hoặc ngành này.");

        $checkStudentCount = DB::table("user_profiles")
            ->where("class_id", $this->classId)
            ->count();

        if ($checkStudentCount > 40) throw new \Exception("❌ Số sinh viên quá nhiều không thể import nửa!");
    }

    public function collection(Collection $rows)
    {
        if ($rows->isEmpty()) {
            throw new \Exception("❌ File Excel không có dữ liệu!");
        }

        $major = Major::find($this->majorId);
        if (!$major) throw new \Exception("❌ Không tìm thấy ngành học tương ứng!");

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

        $abbr = strtoupper($major->major_abbreviate ?? '');

        foreach ($rows as $row) {
            $this->totalStudent++;

            $msv       = strtoupper(trim((string)($row['msv'] ?? '')));
            $class     = strtoupper(trim((string)($row['lop_sv'] ?? '')));
            $ten       = trim((string)($row['ten'] ?? ''));
            $birthdate = trim((string)($row['ngay_sinh'] ?? ''));
            $phone     = trim((string)($row['phone'] ?? ''));
            $email     = strtolower(trim((string)($row['email'] ?? '')));


            if (is_numeric($birthdate)) {
                try {
                    $birthdate = Date::excelToDateTimeObject($birthdate)->format('d/m/Y');
                } catch (\Throwable $e) {
                    $birthdate = null;
                }
            }

            // ❌ Thiếu thông tin
            if (empty($msv) || empty($email) || empty($ten)) {
                $this->logError($msv, $ten, $email, 'Thiếu thông tin bắt buộc (MSV / Tên / Email)');
                continue;
            }

            // ⚠️ Kiểm tra định dạng email
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $this->logError($msv, $ten, $email, 'Email không hợp lệ');
                continue;
            }

            // ⚠️ Kiểm tra định dạng MSSV (chỉ cho phép chữ hoa và số)
            if (!preg_match('/^[0-9A-Z]+$/', $msv)) {
                $this->logError($msv, $ten, $email, 'MSSV không hợp lệ (chỉ chứa chữ hoa và số)');
                continue;
            }

            // ⚠️ Kiểm tra MSSV khớp ngành (chuyển hết sang chữ hoa)
            if ($abbr && !str_contains($msv, $abbr)) {
                $this->logError($msv, $ten, $email, "MSSV không khớp ngành ({$major->major_name} - yêu cầu chứa: {$abbr})");
                continue;
            }



            try {
                // Kiểm tra MSSV đã tồn tại trong CÙNG NGÀNH chưa
                $existingStudentInMajor =
                    user_profile::where('user_id', $msv)
                    ->where('class_id', $this->classId)
                    ->where('major_id', $this->majorId)
                    ->exists();

                if ($existingStudentInMajor) {
                    $this->logError($msv, $ten, $email, "sinh viên này đã tồn tại trong lớp.");
                    continue;
                }

                $checkSVTogether = DB::table("user_profiles")
                    ->join("classes", "user_profiles.class_id", "=", "classes.class_id")
                    ->join("subjects", "classes.subject_id", "=", "subjects.subject_id")
                    ->where("user_profiles.user_id", $msv)
                    ->where("subjects.subject_id", $this->subjectId)
                    ->where("classes.academic_year", $this->academic_year)
                    ->where("classes.semester", $this->semester)
                    ->exists();

                if ($checkSVTogether) {

                    $this->logError(
                        $msv,
                        $ten,
                        $email,
                        "Sinh viên này đã học môn này trong cùng năm và kỳ!"
                    );

                    continue;
                }



                DB::transaction(function () use ($msv, $ten, $email, $phone, $class, $birthdate) {

                    // Kiểm tra xem có user nào đã dùng email/sdt này chưa
                    $conflict = User::where(function ($q) use ($email) {
                        $q->where('email', $email);
                    })
                        ->where('user_id', '!=', $msv)
                        ->exists();

                    if ($conflict) {
                        throw new \Exception("Email hoặc số điện thoại đã được dùng bởi MSSV khác.");
                    }


                    // Nếu user chưa tồn tại thì tạo mới
                    $user = User::where('user_id', $msv)->first();

                    if (!$user) {
                        $user = User::create([
                            'user_id'  => $msv,
                            'email'    => $email,
                            'password' => Hash::make($msv),
                            'role'     => 'student',
                        ]);
                    }

                    // Nếu profile chưa có lớp/ngành này thì thêm mới
                    $existsProfile = user_profile::where('user_id', $msv)
                        ->where('class_id', $this->classId)
                        ->where('major_id', $this->majorId)
                        ->exists();

                    if (!$existsProfile) {
                        user_profile::create([
                            'fullname'      => $ten,
                            'birthdate'     => $birthdate,
                            'phone'         => $phone,
                            'major_id'      => $this->majorId,
                            'class_student' => $class,
                            'class_id'      => $this->classId,
                            'user_id'       => $msv,
                        ]);
                    }
                });

                $this->success++;
            } catch (\Throwable $e) {
                $this->logError($msv, $ten, $email, 'Lỗi hệ thống khi lưu DB: ' . $e->getMessage());
            }
        }
    }

    /**
     * Ghi log lỗi ImportError thống nhất format
     */
    private function logError($msv, $ten, $email, $reason)
    {
        $this->failed++;
        ImportError::create([
            'user_id'    => $msv,
            'fullname'   => $ten,
            'email'      => $email,
            'reason'     => $reason,
            'major_id'   => $this->majorId,
            'class_id'   => $this->classId,
            'teacher_id' => $this->teacherId,
            'typeError'  => 'student',
        ]);
    }
}
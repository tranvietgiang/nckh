<?php

namespace App\Imports;

use App\Models\Classe;
use App\Models\ImportError;
use App\Models\Report;
use App\Models\report_member;
use App\Models\Major;
use App\Models\user_profile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class GroupsImport implements ToCollection, WithHeadingRow
{
    public $success = 0;
    public $failed = 0;
    public $totalGroup = 0;
    protected bool $isValid = true;

    protected ?int $reportId;
    protected ?string $teacherId;
    protected ?int $classId;
    protected ?int $majorId;

    public function __construct($reportId = null, ?string $teacherId = null, $classId = null, $majorId = null)
    {
        // ✅ Ép kiểu an toàn
        $this->reportId  = is_numeric($reportId) ? (int) $reportId : null;
        $this->teacherId = $teacherId;
        $this->classId   = is_numeric($classId) ? (int) $classId : null;
        $this->majorId   = is_numeric($majorId) ? (int) $majorId : null;

        // 🚨 Nếu thiếu thông tin thì đánh dấu lỗi và không dừng hẳn
        if (!$this->reportId || !$this->classId || !$this->majorId || empty($this->teacherId)) {
            $this->isValid = false;
            $this->logError('N/A', 'Lỗi server');
            return;
        }

        // 🧠 Kiểm tra tồn tại
        $majorExist = Major::where('major_id', $this->majorId)->exists();
        $classExist = Classe::where('class_id', $this->classId)->where('major_id', $this->majorId)->exists();
        $teacherExist = user_profile::where('user_id', $this->teacherId)->where('major_id', $this->majorId)->exists();
        $teacherClassExist = Classe::where('class_id', $this->classId)
            ->where('teacher_id', $this->teacherId)
            ->where('major_id', $this->majorId)
            ->exists();
        $reportExist = Report::where('report_id', $this->reportId)
            ->where('class_id', $this->classId)
            ->exists();

        if (!$majorExist || !$classExist || !$teacherExist || !$teacherClassExist || !$reportExist) {
            $this->isValid = false;

            $reason = "❌ Dữ liệu đầu vào không hợp lệ:";
            if (!$majorExist) $reason .= " Ngành không tồn tại;";
            if (!$classExist) $reason .= " Lớp không thuộc ngành;";
            if (!$teacherExist) $reason .= " Giảng viên không thuộc ngành;";
            if (!$teacherClassExist) $reason .= " Giảng viên không dạy lớp;";
            if (!$reportExist) $reason .= " Báo cáo không tồn tại hoặc không thuộc lớp;";

            $this->logError('N/A', trim($reason, ';'));
        }
    }

    public function collection(Collection $rows)
    {
        // 🚫 Nếu thông tin đầu vào sai thì không import dòng nào
        if (!$this->isValid) {
            $this->failed = $this->totalGroup = 0;
            return;
        }

        if ($rows->isEmpty()) {
            $this->logError('N/A', "❌ File Excel không có dữ liệu nhóm!");
            return;
        }

        foreach ($rows as $row) {
            $this->totalGroup++;

            $row = collect($row)
                ->mapWithKeys(fn($v, $k) => [trim(strtolower($k)) => is_string($v) ? trim($v) : $v])
                ->toArray();

            $name_group = strtoupper((string)($row['ten_nhom'] ?? ''));
            $role_group = strtoupper((string)($row['vai_tro'] ?? ''));
            $group_code = strtoupper((string)($row['chung_nhom'] ?? ''));
            $student_id = strtoupper((string)($row['sinh_vien'] ?? ''));

            if (empty($name_group) || empty($role_group) || empty($group_code) || empty($student_id)) {
                $this->logError($student_id, 'Thiếu thông tin bắt buộc (Tên nhóm / Vai trò / Mã nhóm / Sinh viên)');
                continue;
            }

            // ❌ Sinh viên không thuộc lớp
            $isStudentInClass = Classe::select("users.user_id")
                ->join("user_profiles", "classes.class_id", "=", "user_profiles.class_id")
                ->join("users", "user_profiles.user_id", "=", "users.user_id")
                ->where("users.role", "student")
                ->where("classes.class_id", $this->classId)
                ->where("user_profiles.user_id", $student_id)
                ->exists();

            if (!$isStudentInClass) {
                $this->logError($student_id, "Sinh viên {$student_id} không thuộc lớp này");
                continue;
            }

            // ❌ Một nhóm chỉ có 1 trưởng nhóm
            $hasLeader = report_member::where('report_id', $this->reportId)
                ->where('rm_code', $group_code)
                ->where('report_m_role', 'NT')
                ->exists();

            if ($hasLeader && $role_group === 'NT') {
                $this->logError($student_id, "Nhóm {$group_code} đã có trưởng nhóm rồi!");
                continue;
            }

            // ❌ Trùng sinh viên trong cùng báo cáo
            $existsMember = report_member::where('report_id', $this->reportId)
                ->where('student_id', $student_id)
                ->exists();

            if ($existsMember) {
                $this->logError($student_id, "Sinh viên {$student_id} đã thuộc nhóm khác trong báo cáo này!");
                continue;
            }

            // ✅ Thêm hợp lệ
            try {
                DB::transaction(function () use ($name_group, $role_group, $group_code, $student_id) {
                    report_member::create([
                        'rm_name'        => $name_group,
                        'report_id'      => $this->reportId,
                        'report_m_role'  => $role_group,
                        'student_id'     => $student_id,
                        'rm_code'        => $group_code,
                    ]);
                });
                $this->success++;
            } catch (\Throwable $th) {
                $this->logError($student_id, 'Lỗi hệ thống khi lưu DB: ' . $th->getMessage());
            }
        }
    }

    private function logError($studentId, $reason)
    {
        $this->failed++;
        ImportError::create([
            'user_id'    => $studentId,
            'fullname'   => null,
            'email'      => null,
            'reason'     => $reason,
            'major_id'   => $this->majorId,
            'class_id'   => $this->classId,
            'teacher_id' => $this->teacherId,
            'typeError'  => 'group',
        ]);
    }
}
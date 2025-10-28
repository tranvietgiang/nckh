<?php

namespace App\Imports;

use App\Models\Classe;
use App\Models\ImportError;
use App\Models\Report;
use App\Models\report_member;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class GroupsImport implements ToCollection, WithHeadingRow
{
    public $success = 0;
    public $failed = 0;
    public $totalGroup = 0;

    protected ?int $reportId;
    protected ?string $teacherId;
    protected ?int $classId;
    protected ?int $majorId;

    public function __construct(?int $reportId = null, ?string $teacherId = null, ?int $classId = null, ?int $majorId = null)
    {
        $this->reportId = $reportId;
        $this->teacherId = $teacherId;
        $this->classId = $classId;
        $this->majorId = $majorId;
    }

    public function collection(Collection $rows)
    {
        if (!Classe::where("teacher_id", $this->teacherId)->exists()) {
            throw new \Exception("Giảng viên không dạy lớp này!");
        }

        if (!Report::where("report_id", $this->reportId)->exists()) {
            throw new \Exception("Báo cáo này không tồn tại");
        }

        foreach ($rows as $row) {
            $this->totalGroup++;

            $name_group = trim((string)($row['ten nhom'] ?? ''));
            $role_group = trim((string)($row['vai tro'] ?? ''));
            $grouping   = trim((string)($row['chung nhom'] ?? ''));
            $student_id = trim((string)($row['sinh vien'] ?? ''));


            $checkSVinClass = Classe::select("users.role", "users.user_id", "user_profiles.user_id")
                ->join("user_profiles", "classes.class_id", "=", "user_profiles.class_id")
                ->join("users", "user_profiles.user_id", "=", "users.user_id")
                ->where("users.role", "student")
                ->where("classes.class_id", $this->classId)
                ->where("user_profiles.user_id", $student_id)
                ->exists();

            if ($checkSVinClass) {
                $this->failed++;
                ImportError::create([
                    'user_id'    => $student_id,
                    'fullname'   => $name_group,
                    'reason'     => 'Sinh viên này không tồn tại trong lớp',
                    'major_id' => $this->majorId,
                    'class_id'   => $this->classId,
                    'teacher_id' => $this->teacherId,
                    'typeError'  => 'group',
                ]);
                continue;
            }

            // ❌ Thiếu dữ liệu
            if (empty($name_group) || empty($role_group) || empty($grouping) || empty($student_id)) {
                $this->failed++;
                ImportError::create([
                    'user_id'    => $student_id,
                    'fullname'   => $name_group,
                    'reason'     => 'Thiếu thông tin bắt buộc (Tên nhóm / Vai trò / Chung nhóm / Sinh viên)',
                    'major_id' => $this->majorId,
                    'class_id'   => $this->classId,
                    'teacher_id' => $this->teacherId,
                    'typeError'  => 'group',
                ]);
                continue;
            }

            // ❌ Kiểm tra trùng trưởng nhóm
            $exists = report_member::where('report_id', $this->reportId)
                ->where('report_m_role', 'Trưởng nhóm')
                ->where('rm_code', $grouping)
                ->exists();

            if ($exists && strtolower($role_group) == 'nt') {
                $this->failed++;
                ImportError::create([
                    'user_id'    => $student_id,
                    'fullname'   => $name_group,
                    'reason'     => 'Một nhóm chỉ được có 1 trưởng nhóm',
                    'major_id' => $this->majorId,
                    'class_id'   => $this->classId,
                    'teacher_id' => $this->teacherId,
                    'typeError'  => 'group',
                ]);
                continue;
            }

            // ✅ Tạo nhóm thành viên
            DB::transaction(function () use ($name_group, $role_group, $grouping, $student_id) {
                report_member::create([
                    'rm_name'        => $name_group,
                    'report_id'      => $this->reportId,
                    'report_m_role'  => $role_group,
                    'student_id'     => $student_id,
                    'rm_code'        => $grouping,
                ]);
            });

            $this->success++;
        }
    }
}
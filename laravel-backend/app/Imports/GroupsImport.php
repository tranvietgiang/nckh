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
        if (!Classe::where("class_id", $this->classId)
            ->where("teacher_id", $this->teacherId)
            ->exists()) {
            throw new \Exception("Giảng viên không dạy lớp này!");
        }

        if (!Report::where("report_id", $this->reportId)->exists()) {
            throw new \Exception("Báo cáo này không tồn tại!");
        }

        foreach ($rows as $row) {
            $this->totalGroup++;

            // Làm sạch key và value
            $row = collect($row)
                ->mapWithKeys(function ($v, $k) {
                    $key = trim(strtolower($k));
                    $val = is_string($v) ? trim($v) : $v;
                    return [$key => $val];
                })
                ->toArray();

            $name_group = strtoupper((string)($row['ten_nhom'] ?? ''));
            $role_group = strtoupper((string)($row['vai_tro'] ?? ''));
            $grouping   = strtoupper((string)($row['chung_nhom'] ?? ''));
            $student_id = strtoupper((string)($row['sinh_vien'] ?? ''));

            // ❌ Thiếu dữ liệu
            if (empty($name_group) || empty($role_group) || empty($grouping) || empty($student_id)) {
                $this->failed++;
                ImportError::create([
                    'user_id'    => $student_id,
                    'fullname'   => $name_group,
                    'reason'     => 'Thiếu thông tin bắt buộc (Tên nhóm / Vai trò / Chung nhóm / Sinh viên)',
                    'major_id'   => $this->majorId,
                    'class_id'   => $this->classId,
                    'teacher_id' => $this->teacherId,
                    'typeError'  => 'group',
                ]);
                continue;
            }

            // ❌ Sinh viên không thuộc lớp
            $checkSVinClass = Classe::select("users.user_id")
                ->join("user_profiles", "classes.class_id", "=", "user_profiles.class_id")
                ->join("users", "user_profiles.user_id", "=", "users.user_id")
                ->where("users.role", "student")
                ->where("classes.class_id", $this->classId)
                ->where("user_profiles.user_id", $student_id)
                ->exists();

            if (!$checkSVinClass) {
                $this->failed++;
                ImportError::create([
                    'user_id'    => $student_id,
                    'fullname'   => $name_group,
                    'reason'     => 'Sinh viên này không tồn tại trong lớp',
                    'major_id'   => $this->majorId,
                    'class_id'   => $this->classId,
                    'teacher_id' => $this->teacherId,
                    'typeError'  => 'group',
                ]);
                continue;
            }

            // ❌ Trùng trưởng nhóm
            $exists = report_member::where('report_id', $this->reportId)
                ->where('report_m_role', 'Trưởng nhóm')
                ->where('rm_code', $grouping)
                ->exists();

            if ($exists && $role_group === 'NT') {
                $this->failed++;
                ImportError::create([
                    'user_id'    => $student_id,
                    'fullname'   => $name_group,
                    'reason'     => 'Một nhóm chỉ được có 1 trưởng nhóm',
                    'major_id'   => $this->majorId,
                    'class_id'   => $this->classId,
                    'teacher_id' => $this->teacherId,
                    'typeError'  => 'group',
                ]);
                continue;
            }

            // ✅ Thêm thành viên hợp lệ
            try {
                report_member::create([
                    'rm_name'        => $name_group,
                    'report_id'      => $this->reportId,
                    'report_m_role'  => $role_group,
                    'student_id'     => $student_id,
                    'rm_code'        => $grouping,
                ]);
                $this->success++;
            } catch (\Throwable $th) {
                $this->failed++;
                ImportError::create([
                    'user_id'    => $student_id,
                    'fullname'   => $name_group,
                    'reason'     => 'Lỗi khi ghi dữ liệu: ' . $th->getMessage(),
                    'major_id'   => $this->majorId,
                    'class_id'   => $this->classId,
                    'teacher_id' => $this->teacherId,
                    'typeError'  => 'group',
                ]);
            }
        }
    }
}
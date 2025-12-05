<?php

namespace App\Repositories;

use App\Models\Classe;
use App\Models\Major;
use App\Models\Subject;
use Illuminate\Support\Facades\DB;

class SubjectRepository
{
    protected $table = 'subjects';

    public function getAll()
    {
        return DB::table($this->table)
            ->join("majors", "subjects.major_id", "=", "majors.major_id")
            ->select(
                'subjects.subject_id',
                'subjects.subject_name',
                'subjects.subject_code',
                'subjects.major_id',
                'majors.major_name',
                'majors.major_abbreviate',
                'subjects.created_at',
                'subjects.updated_at'
            )
            ->orderByDesc('subjects.created_at')
            ->get();
    }


    public function existsSameNameCodeMajor($name, $code, $majorId)
    {
        return Subject::where('subject_name', $name)
            ->where('subject_code', $code)
            ->where('major_id', $majorId)
            ->exists();
    }

    public function existsNameOnly($name, $majorId)
    {
        return Subject::where('subject_name', $name)
            ->where('major_id', $majorId)
            ->exists();
    }

    public function existsCodeOnly($code, $majorId)
    {
        return Subject::where('subject_code', $code)
            ->where('major_id', $majorId)
            ->exists();
    }


    public function subjectNotExist($id)
    {
        return Subject::where('subject_id', $id)
            ->exists();
    }

    public function updateToggleId($id, array $data)
    {

        // Lấy bản ghi hiện tại từ DB
        $subject = Subject::where("subject_id", $id)->first();

        if (!$subject) {
            return ['success' => false, 'message_error' => 'Môn học không tồn tại!'];
        }

        // return [
        //     'success' => false,
        //     'fe' => $data['updated_at'],
        //     'db' => $subject->updated_at->format('Y-m-d H:i:s'),
        // ];

        if ($subject->updated_at != $data['updated_at']) {
            return [
                'success' => false,
                'message_error' => 'Vui lòng tải lại trang trước khi cập nhật!'
            ];
        }
        return ['success' => true];
    }

    public function createSubject(array $data)
    {
        return Subject::create([
            'subject_name' => trim($data['subject_name']),
            'subject_code' => strtoupper(trim($data['subject_code'])),
            'major_id'     => $data['major_id'],
        ]);
    }

    public function updateNotChange($id, array $data)
    {
        return Subject::where("subject_id", $id)
            ->where('subject_name', $data['subject_name'])
            ->where('subject_code', $data['subject_code'])
            ->where('major_id', $data['major_id'])->exists();
    }

    public function validateData(array $data)
    {
        // Kiểm tra dữ liệu bắt buộc
        if (empty($data['subject_name'])) {
            return ['success' => false, 'message_error' => 'Tên môn học không được để trống!'];
        }

        if (empty($data['subject_code'])) {
            return ['success' => false, 'message_error' => 'Mã môn học không được để trống!'];
        }

        if (empty($data['major_id'])) {
            return ['success' => false, 'message_error' => 'Vui lòng chọn ngành!'];
        }

        // Kiểm tra độ dài tên môn học
        if (strlen($data['subject_name']) < 5 || strlen($data['subject_name']) > 100) {
            return ['success' => false, 'message_error' => 'Tên môn học phải dài từ 5 đến 100 ký tự!'];
        }

        // Kiểm tra độ dài mã môn học
        if (strlen($data['subject_code']) < 3 || strlen($data['subject_code']) > 50) {
            return ['success' => false, 'message_error' => 'Mã môn học phải dài từ 3 đến 50 ký tự!'];
        }

        // Regex tên môn học (cho phép tiếng Việt, không ký tự đặc biệt)
        if (!preg_match('/^[A-Za-z0-9ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯàáâãèéêìíòóôõùúăđĩũơưĂÂÊÔƠƯáàảãạâầấẩẫậăằắẳẵặéèẻẽẹêềếểễệíìỉĩịóòỏõọôồốổỗộơờớởỡợúùủũụưừứửữựỳýỷỹỵ\s_-]+$/u', $data['subject_name'])) {
            return ['success' => false, 'message_error' => 'Tên môn học không được chứa ký tự đặc biệt!'];
        }

        // Regex mã môn học (KHÔNG dấu, không ký tự đặc biệt)
        if (!preg_match('/^[A-Za-z0-9_-]+$/', $data['subject_code'])) {
            return ['success' => false, 'message_error' => 'Mã môn học không được chứa ký tự đặc biệt hoặc dấu tiếng Việt!'];
        }

        // Kiểm tra ngành có tồn tại không
        if (!Major::where('major_id', $data['major_id'])->exists()) {
            return ['success' => false, 'message_error' => 'Ngành học không tồn tại!'];
        }

        return ['success' => true];
    }

    public function updateSubject($id, array $data)
    {
        return DB::table($this->table)
            ->where('subject_id', $id)
            ->update([
                'subject_name' => $data['subject_name'],
                'subject_code' => $data['subject_code'],
                'major_id' => $data['major_id'],
                'updated_at' => now(),
            ]);
    }

    public function ExistsSubjectInClass($id)
    {
        return DB::table("subjects")
            ->join("classes", "subjects.subject_id", "classes.subject_id")
            ->where("classes.subject_id", $id)->exists();
    }

    public function canDeleteSubject(int $subjectId): array
    {
        // 1) Lấy tất cả lớp thuộc môn học này
        $classes = DB::table('classes')
            ->where('subject_id', $subjectId)
            ->pluck('class_id');

        // Không có lớp → xoá được
        if ($classes->isEmpty()) {
            return ['success' => true];
        }

        // 2) Kiểm tra lớp có sinh viên hay không
        $hasStudents = DB::table('user_profiles')
            ->whereIn('class_id', $classes)
            ->exists();

        if ($hasStudents) {
            return [
                'success' => false,
                'message_error' => 'Không thể xoá môn học vì có lớp thuộc môn này đang có sinh viên!'
            ];
        }

        // Nếu có lớp nhưng không có sinh viên → Cảnh báo
        return [
            'success' => false,
            'message_error' => 'Không thể xoá môn học vì đang được sử dụng trong lớp học!'
        ];
    }

    public function deleteSubject($id)
    {
        return DB::table($this->table)
            ->where('subject_id', $id)
            ->delete();
    }
}
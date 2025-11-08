<?php

namespace App\Services;

use App\Models\Classe;
use App\Models\Major;
use App\Models\Subject;
use App\Repositories\ClassesRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ClassesService
{
    public function __construct(protected ClassesRepository $repo) {}

    public function deleteByClass(array $params): array
    {
        $classId   = (int)($params['class_id'] ?? 0);
        $teacherId = (string)($params['teacher_id'] ?? '');

        if (!$classId || !$teacherId) {
            return [
                'success' => false,
                'code' => 422,
                'message_error' => 'Dữ liệu không hợp lệ'
            ];
        }

        $deleted = $this->repo->deleteByClass($classId, $teacherId);

        if ($deleted === 0) {
            return [
                'success' => false,
                'message_error' => 'Không thể xóa lớp (còn sinh viên hoặc lớp không tồn tại)'
            ];
        }

        return [
            'success' => true,
            'message_error' => 'Xóa lớp thành công',
        ];
    }

    public function insertClassesService(array $data): array
    {
        // 1Validate dữ liệu đầu vào
        $validator = Validator::make($data, [
            'class_name'    => 'required|string|max:255',
            'class_code'    => 'required|string|max:50',
            'major_id'      => 'required|integer',
            'teacher_id'    => 'required|string',
            'subject_id'    => 'required|integer',
            'semester'      => 'required|string|max:50',
            'academic_year' => 'required|string|max:50',
        ]);

        if ($validator->fails()) {
            return [
                'success' => false,
                'message_error' => 'Vui lòng nhập đầy đủ thông tin lớp học!',
                'errors' => $validator->errors(),
            ];
        }

        // 2 Kiểm tra ngành
        if (!Major::where('major_id', $data['major_id'])->exists()) {
            return ['success' => false, 'message_error' => 'Ngành học không tồn tại!'];
        }

        // 3 Kiểm tra môn học
        if (!Subject::where('subject_id', $data['subject_id'])->exists()) {
            return ['success' => false, 'message_error' => 'Môn học không tồn tại!'];
        }

        // 4Kiểm tra môn học có thuộc ngành đó không
        $checkSubjectExistsMajor = DB::table('subjects')
            ->join('majors', 'subjects.major_id', '=', 'majors.major_id')
            ->where('subjects.subject_id', $data['subject_id'])
            ->exists();

        if (!$checkSubjectExistsMajor) {
            return ['success' => false, 'message_error' => 'Không tồn tại ngành của môn học này!'];
        }

        //5 kiểm tra trùng dữ liệu
        $sameTeacherAndName = Classe::where('teacher_id', $data['teacher_id'])
            ->where('class_name', $data['class_name'])
            ->exists();

        if ($sameTeacherAndName) {
            return ['success' => false, 'message_error' => 'Tên lớp này đã được bạn tạo trước đó!'];
        }

        $sameTeacherAndCode = Classe::where('teacher_id', $data['teacher_id'])
            ->where('class_code', $data['class_code'])
            ->exists();

        if ($sameTeacherAndCode) {
            return ['success' => false, 'message_error' => 'Mã lớp này đã tồn tại trong danh sách lớp của bạn!'];
        }

        $sameMajorAndCode = Classe::where('major_id', $data['major_id'])
            ->where('class_code', $data['class_code'])
            ->exists();

        if ($sameMajorAndCode) {
            return ['success' => false, 'message_error' => 'Mã lớp này đã tồn tại trong cùng ngành!'];
        }

        // Tạo lớp
        try {
            $class = $this->repo->insertClassesRepository($data);

            return [
                'success' => true,
                'message_success' => 'Tạo lớp học thành công!',
                'data_classes' => $class,
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message_error' => 'Lỗi server khi tạo lớp!',
            ];
        }
    }
}
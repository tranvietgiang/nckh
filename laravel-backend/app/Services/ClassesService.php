<?php

namespace App\Services;

use App\Models\Classe;
use App\Models\Major;
use App\Models\Subject;
use App\Models\User;
use App\Models\user_profile;
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
            'class_name' => [
                'required',
                'string',
                'max:10',
                'regex:/^[A-Za-zÀ-ỹ0-9 _-]{1,10}$/u',   // <-- ĐÃ SỬA
            ],
            'class_code' => [
                'required',
                'string',
                'max:10',
                'regex:/^[A-Za-z0-9_-]{1,10}$/',
            ],
            'major_id'      => 'required|integer',
            'teacher_id'    => 'required|string',
            'subject_id'    => 'required|integer',
            'semester'      => 'required|string|max:10',
            'academic_year' => 'required|string|max:20|regex:/^\d{4}\s*-\s*\d{4}$/',
        ], [
            // class_name
            'class_name.required' => 'Tên lớp không được để trống.',
            'class_name.max' => 'Tên lớp vượt quá :max ký tự.',
            'class_name.regex' => 'Tên lớp chỉ được chứa chữ, số, khoảng trắng và dấu - hoặc _.',

            // class_code
            'class_code.required' => 'Mã lớp không được để trống.',
            'class_code.max' => 'Mã lớp vượt quá :max ký tự.',
            'class_code.regex' => 'Mã lớp chỉ được chứa chữ cái, số và dấu - hoặc _, không khoảng trắng.',

            // major_id
            'major_id.required' => 'Vui lòng chọn ngành.',
            'major_id.integer' => 'Ngành phải là số nguyên.',

            // teacher_id
            'teacher_id.required' => 'Thiếu thông tin giảng viên.',

            // subject_id
            'subject_id.required' => 'Vui lòng chọn môn học.',
            'subject_id.integer' => 'Môn học không hợp lệ.',

            // semester
            'semester.required' => 'Học kỳ không được để trống.',
            'semester.max' => 'Học kỳ vượt quá :max ký tự.',

            // academic_year
            'academic_year.required' => 'Năm học không được để trống.',
            'academic_year.max' => 'Năm học vượt quá :max ký tự.',
            'academic_year.regex' => 'Năm học phải có dạng 2024 - 2025.',
        ]);


        if ($validator->fails()) {
            return [
                'success' => false,
                'message_error' => $validator->errors()->first(),
            ];
        }
        // Kiểm tra năm học hợp lệ (2024 - 2025)
        if (!empty($data['academic_year'])) {
            [$start, $end] = array_map('trim', explode('-', $data['academic_year']));

            if ($end <= $start) {
                return [
                    'success' => false,
                    'message_error' => 'Năm sau phải lớn hơn năm trước.',
                ];
            }
        }

        //  Kiểm tra ngành
        if (!Major::where('major_id', $data['major_id'])->exists()) {
            return ['success' => false, 'message_error' => 'Ngành học không hợp lệ!'];
        }

        //  Kiểm tra ngành
        if (!Major::where('major_id', $data['major_id'])->exists()) {
            return ['success' => false, 'message_error' => 'Ngành học không hợp lệ!'];
        }

        // Kiểm tra giáo viên
        if (!Classe::where('teacher_id', $data['teacher_id'])->exists()) {
            return ['success' => false, 'message_error' => 'Giảng viên không hợp lệ!'];
        }

        // Kiểm tra môn học
        if (!Subject::where('subject_id', $data['subject_id'])->exists()) {
            return ['success' => false, 'message_error' => 'Môn học không hợp lệ!'];
        }

        $arrSemester =  ["1", "2", "Hè"];
        if (!in_array($data['semester'], $arrSemester)) {
            return ['success' => false, 'message_error' => 'Học kỳ không hợp lệ!'];
        }

        if (!preg_match('/^\d{4}-\d{4}$/', $data['academic_year'])) {
            return ['success' => false, 'message_error' => 'Năm học không hợp lệ!'];
        }

        // Kiểm tra môn học có thuộc ngành đó không
        $checkSubjectExistsMajor = DB::table('subjects')
            ->join('majors', 'subjects.major_id', '=', 'majors.major_id')
            ->where('subjects.subject_id', $data['subject_id'])
            ->exists();

        if (!$checkSubjectExistsMajor) {
            return ['success' => false, 'message_error' => 'Không tồn tại ngành của môn học này!'];
        }

        // kiểm tra trùng dữ liệu
        $sameTeacherAndName = DB::table("classes")
            ->join("subjects", "classes.subject_id", "subjects.subject_id")
            ->where('classes.teacher_id', $data['teacher_id'])
            ->where('classes.class_name', $data['class_name'])
            ->where('classes.subject_id', $data['subject_id'])
            ->exists();

        if ($sameTeacherAndName) {
            return ['success' => false, 'message_error' => 'Lớp này đã có môn học trước đó'];
        }

        // kiểm tra trùng dữ liệu
        $sameTeacherAndSemester = DB::table("classes")
            ->join("subjects", "classes.subject_id", "subjects.subject_id")
            ->where('classes.teacher_id', $data['teacher_id'])
            ->where('classes.semester', $data['semester'])
            ->where('classes.subject_id', $data['subject_id'])
            ->exists();

        if ($sameTeacherAndSemester) {
            return ['success' => false, 'message_error' => 'Giảng viên đã dạy lớp này ở kì này!'];
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

            $inFoTeacher = user_profile::where('user_id', $data['teacher_id'])->first();
            $this->repo->createInfTeacher([
                'fullname'   => $inFoTeacher->fullname,
                'birthdate'  => $inFoTeacher->birthdate,
                'phone'      => $inFoTeacher->phone,
                'class_id'   => $class->class_id,
                'teacher_id' => $data['teacher_id'],
                'major_id'   => $data['major_id'],
            ]);

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
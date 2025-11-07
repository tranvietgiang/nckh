<?php

namespace App\Http\Controllers;

use App\Models\Classe;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Helpers\AuthHelper;
use App\Models\Major;
use App\Http\Controllers\MajorsController;
use Illuminate\Support\Facades\Auth;
use App\Models\user_profile;
use App\Imports\ClassImport;
use App\Models\Subject;
use App\Models\User;
use App\Services\ClassesService;
use Maatwebsite\Excel\Facades\Excel;


class ClassController extends Controller
{

    protected $classesService;
    // Service được inject tự động qua constructor
    public function __construct(ClassesService $classesService)
    {
        $this->classesService = $classesService;
    }

    public function getClassByTeacher()
    {
        AuthHelper::roleAmin();
        return Classe::getByTeacher();
    }


    //lấy lớp  học thấy  id giảng viên 
    public function getAllClassTeacher()
    {
        AuthHelper::roleAmin();

        $classes = Classe::all();

        if ($classes->count() > 0) {
            return response()->json($classes);
        }

        return response()->json([], 500);
    }

    public function getStudentsByClass($classId)
    {

        return user_profile::getStudentsByClass($classId);
    }

    // return \App\Models\user_profile::getStudentsByClass($classId);



    public function insertClassNew(Request $request)
    {
        AuthHelper::roleAmin();

        $data = $request->all();

        if (
            empty($data["class_name"]) ||
            empty($data["class_code"]) ||
            empty($data["major_id"])   ||
            empty($data["teacher_id"]) ||
            empty($data["subject_id"]) ||
            empty($data["semester"])   ||
            empty($data["academic_year"])
        ) {
            return response()->json([
                "status" => false,
                "message_error" => "Vui lòng nhập đầy đủ thông tin lớp học!"
            ], 402);
        }

        $majorExists = Major::where("major_id", $data["major_id"])->exists();
        if (!$majorExists) {
            return response()->json([
                "status" => false,
                "message_error" => "Ngành học không tồn tại!"
            ]);
        }

        $sameTeacherAndName = Classe::where("teacher_id", $data["teacher_id"])
            ->where("class_name", $data["class_name"])
            ->exists();

        if ($sameTeacherAndName) {
            return response()->json([
                "status" => false,
                "message_error" => "Tên lớp này đã được bạn tạo trước đó!"
            ]);
        }

        $sameSubjectAndName = Subject::where("subject_id", $data["subject_id"])->exists();

        if (!$sameSubjectAndName) {
            return response()->json([
                "status" => false,
                "message_error" => "môn học này không tồn tại!"
            ]);
        }

        $checkSubjectExistsMajor = DB::table("subjects")
            ->join("majors", "subjects.major_id", "=", "majors.major_id")
            ->where("subject_id", $data["subject_id"])->exists();

        if (!$checkSubjectExistsMajor) {
            return response()->json([
                "status" => false,
                "message_error" => "Không tồn tại ngành của môn học này!"
            ]);
        }

        $sameTeacherAndCode = Classe::where("teacher_id", $data["teacher_id"])
            ->where("class_code", $data["class_code"])
            ->exists();

        if ($sameTeacherAndCode) {
            return response()->json([
                "status" => false,
                "message_error" => "Mã lớp này đã tồn tại trong danh sách lớp của bạn!"
            ]);
        }

        $sameMajorAndCode = Classe::where("major_id", $data["major_id"])
            ->where("class_code", $data["class_code"])
            ->exists();

        if ($sameMajorAndCode) {
            return response()->json([
                "status" => false,
                "message_error" => "Mã lớp này đã tồn tại trong cùng ngành!"
            ]);
        }

        try {
            $class = Classe::create([
                "class_name" => $data["class_name"],
                "class_code" => $data["class_code"],
                "teacher_id" => $data["teacher_id"],
                "subject_id" => $data["subject_id"],
                "semester" => $data["semester"],
                "academic_year" => $data["academic_year"],
                "major_id" => $data["major_id"]
            ]);

            return response()->json([
                "status" => true,
                "message" => "Tạo lớp học thành công!",
                "data_classes" => $class
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                "status" => false,
                "message_error" => "Lỗi server"
            ], 500);
        }
    }

    public function deleteClass($class_id, $teacherId)
    {

        AuthHelper::roleAmin();

        $result = $this->classesService->deleteByClass([
            'class_id'   => $class_id,
            'teacher_id' => $teacherId,
        ]);

        return response()->json($result, $result['success'] ? 200 : 400);
    }

    public function getClassOfTeacher($selectedMajor)
    {
        $useId = AuthHelper::isLogin();

        $getClasses = Classe::query()
            ->select(
                'classes.class_id as class_id_teacher',
                'classes.class_name',
                'majors.major_id',
                'majors.major_name',
                'majors.major_abbreviate'
            )
            ->join('majors', 'classes.major_id', '=', 'majors.major_id')
            ->where('classes.teacher_id', $useId)
            ->where('classes.major_id', $selectedMajor)
            ->groupBy('classes.class_id', 'classes.class_name', 'majors.major_id', 'majors.major_name', 'majors.major_abbreviate')
            ->get();


        if ($getClasses->count() > 0) {
            return response()->json($getClasses);
        }

        return response()->json(['message' => 'Không tìm thấy lớp'], 404);
    }

    // public function getClassGroups($majorId)
    // {
    //     $getClassByTeacher = Classe::where("major_id", $majorId)->get();

    //     if ($getClassByTeacher->count() > 0) {
    //         return response()->json($getClassByTeacher, 200);
    //     }

    //     return response()->json(['message' => 'Không tìm thấy lớp'], 404);
    // }

    public function import(Request $request)
    {
        try {
            $file = $request->file('file');

            if (!$file) {
                return response()->json([
                    'message' => '❌ Không có file tải lên!'
                ], 400);
            }

            // Gọi import KHÔNG cần truyền thêm teacherId hoặc majorId
            $import = new ClassImport();
            Excel::import($import, $file);

            return response()->json([
                'message' => '✅ Import lớp học hoàn tất!',
                'success' => $import->success,
                'failed' => $import->failed,
                'total' => $import->totalClass,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => '❌ Lỗi khi import lớp học: ' . $e->getMessage(),
            ], 500);
        }
    }

    // public function allClassId(){
    //     $getAllClassId = Classe::where()
    // }
}
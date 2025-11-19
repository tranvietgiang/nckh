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
use Illuminate\Http\Response;
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

    public function getAllClassAdmin(Request $request)
    {
        // AuthHelper::roleAmin(); // tạm comment
        $majorId = $request->query('major_id');
        $classes = $majorId ? Classe::where('major_id', $majorId)->get() : Classe::all();
        return response()->json($classes);
    }


    public function getStudentsByClass($classId)
    {

        return user_profile::getStudentsByClass($classId);
    }

    // return \App\Models\user_profile::getStudentsByClass($classId);



    public function insertClassNew(Request $request)
    {
        AuthHelper::roleAmin();

        $result = $this->classesService->insertClassesService($request->all());

        return response()->json($result, $result['success'] ? 200 : 400);
    }

    public function deleteClass($class_id, $teacherId)
    {

        AuthHelper::roleAmin();

        $result = $this->classesService->deleteByClass([
            'class_id' => $class_id,
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
                'classes.class_code',
                'majors.major_id',
                'majors.major_name',
                'majors.major_abbreviate',
                'classes.semester',
                'classes.academic_year'
            )
            ->join('majors', 'classes.major_id', '=', 'majors.major_id')
            ->where('classes.teacher_id', $useId)
            // ❌ BỎ LỌC major_id nếu bạn muốn lấy tất cả lớp của giảng viên
            // ->where('classes.major_id', $selectedMajor)
            ->get();

        if ($getClasses->count() > 0) {
            return response()->json($getClasses);
        }

        return response()->json(['message' => 'Không tìm thấy lớp'], 404);
    }

    public function getClassGroups($majorId)
    {
        $getClassByTeacher = Classe::where("major_id", $majorId)->get();

        if ($getClassByTeacher->count() > 0) {
            return response()->json($getClassByTeacher, 200);
        }

        return response()->json(['message' => 'Không tìm thấy lớp'], 404);
    }

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

    public function getYearsByClass()
    {
        AuthHelper::roleTeacher();

        $years = Classe::select('academic_year')
            ->distinct()
            ->orderBy('academic_year', 'desc')
            ->get();

        if ($years->count() > 0) {
            return response()->json($years, 200);
        }

        return response()->json([], 500);
    }

    public function getCountClassStudentLearn()
    {
        $userId = AuthHelper::isLogin();

        $getCountClass = user_profile::select()
            ->join("classes", "user_profiles.class_id", "=", "classes.class_id")
            ->where("user_profiles.user_id", $userId)
            ->count();

        if ($getCountClass > 0) {
            return response()->json($getCountClass, 200);
        }

        return response()->json([], 500);
    }

    public function getCountClassesTeachingByTeacher()
    {
        $teacherId = AuthHelper::isLogin();
        AuthHelper::roleTeacher();

        $count = DB::table("classes")
            ->join("user_profiles", "classes.teacher_id", "=", "user_profiles.user_id")
            ->join("subjects", "classes.subject_id", "=", "subjects.subject_id")
            ->join("majors", "subjects.major_id", "=", "majors.major_id")
            ->join("users", "user_profiles.user_id", "=", "users.user_id")
            ->where("users.user_id", $teacherId)
            ->where("users.role", "teacher")
            ->distinct("classes.class_id")->count("classes.class_id");


        if ($count === 0) {
            return Response()->json(["message_err" => "error not classes teaching"], 500);
        }
        return Response()->json($count, 200);
    }
}

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

    public function getClassOfTeacher()
    {
        $useId = AuthHelper::isLogin();

        $getClasses = Classe::query()
            ->select(
                'classes.class_id as class_id_teacher',
                'classes.class_name',
                'subjects.subject_name',
                'classes.academic_year',
                'classes.semester'
            )
            ->join('subjects', 'classes.subject_id', '=', 'subjects.subject_id')
            ->where('classes.teacher_id', $useId)
            ->distinct("classes.class_id_teacher")
            ->get();

        if ($getClasses->count() > 0) {
            return response()->json($getClasses);
        }

        return response()->json(['message' => 'Không tìm thấy lớp'], 404);
    }
    public function getClassOfTeacherByMajor($selectedMajor)
    {
        $useId = AuthHelper::isLogin();

        $getClasses = Classe::query()
            ->join('majors', 'classes.major_id', '=', 'majors.major_id')
            ->join('subjects', 'classes.subject_id', '=', 'subjects.subject_id')
            ->where('classes.teacher_id', $useId)
            ->where('classes.major_id', $selectedMajor)
            ->select(
                'classes.class_id',
                'classes.class_name',
                'subjects.subject_name'
            )
            ->orderBy('classes.class_name')
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
            $request->validate([
                'file' => 'required|mimes:xlsx,xls',
            ]);

            $file = $request->file('file');
            $import = new ClassImport();
            Excel::import($import, $file);

            return response()->json([
                'message' => '✅ Import lớp học hoàn tất!',
                'success' => $import->success,
                'failed' => $import->failed,
                'total' => $import->totalClass,
                'successList' => $import->successList,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => '❌ Lỗi hệ thống khi import: ' . $e->getMessage(),
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

    public function getClassByTeachingTeacher()
    {
        $teacherId = AuthHelper::isLogin();
        AuthHelper::roleTeacher();

        $classes = DB::table('classes')
            ->join('subjects', 'classes.subject_id', '=', 'subjects.subject_id')
            ->join('majors', 'classes.major_id', '=', 'majors.major_id')
            ->where('classes.teacher_id', $teacherId)
            ->select(
                'classes.class_id',
                'classes.class_name',
                'classes.class_code',
                'classes.semester',
                'classes.academic_year',
                'subjects.subject_id',
                'subjects.subject_name',
                'majors.major_name',
                'majors.major_abbreviate'
            )
            ->orderBy('classes.class_name')
            ->orderBy('subjects.subject_name')
            ->get();

        if ($classes->isEmpty()) {
            return response()->json(["message_err" => "error not classes teaching"], 404);
        }

        return response()->json($classes, 200);
    }
}
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

    // public function allClassId(){
    //     $getAllClassId = Classe::where()
    // }
}
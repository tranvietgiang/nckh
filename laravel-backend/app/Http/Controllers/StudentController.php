<?php

namespace App\Http\Controllers;

use App\Helpers\AuthHelper;
use App\Imports\StudentsImport;
use App\Models\Classe;
use App\Models\ImportError;
use App\Models\User;
use App\Services\StudentService;
use Exception;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Validation\Rule;

class StudentController extends Controller
{

    public function __construct(protected StudentService $studentService) {}

    public function import(Request $request)
    {
        try {
            AuthHelper::isLogin();
            $validated = $request->validate([
                'file' => 'required|file|mimes:xlsx,xls,csv',
                'major_id' => 'required|integer',
                'teacher_id' => 'required|string',
                'class_id' => [
                    'required',
                    'integer',
                    Rule::exists('classes', 'class_id')->where(function ($q) use ($request) {
                        $q->where('teacher_id', $request->input('teacher_id'));
                    }),
                ],
            ]);

            $classId = (int) $validated['class_id'];
            $majorId = (int) $validated['major_id'];
            $teacherId = (string) $validated['teacher_id'];

            // Tạo instance để lấy thống kê sau import
            $import = new StudentsImport(
                classId: $classId,
                teacherId: $teacherId,
                majorId: $majorId
            );

            // Chỉ import 1 lần
            Excel::import($import, $validated['file']);

            $list_import_error = ImportError::where("class_id", $classId)
                ->where("teacher_id", $teacherId)->get();

            if ($list_import_error->count() > 0) {
                return response()->json([
                    'message' => 'Import hoàn tất!',
                    'total_student' => $import->totalStudent,
                    'success' => $import->success ?? 0,
                    'failed'  => $import->failed ?? 0,
                    'list_import_error' => $list_import_error,
                ]);
            }

            return response()->json([
                'message' => 'Import hoàn tất!',
                'total_student' => $import->totalStudent,
                'success' => $import->success ?? 0,
                'failed'  => $import->failed ?? 0,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error'   => '❌ Import thất bại!',
                'message' => $e->getMessage(), // lấy nội dung lỗi cụ thể
            ], 400);
        }
    }


    public function getStudents($class_id, $teacher_id)
    {
        AuthHelper::isLogin();

        $result = $this->studentService->getStudentService($class_id, $teacher_id);

        return response()->json($result, $result['success'] ? 200 : 404);
    }


    public function displayInfo()
    {
        $userId = AuthHelper::isLogin();
        $role   = AuthHelper::getRole();

        $result = $this->studentService->getProfile($userId, $role);

        return response()->json($result, $result['success'] ? 200 : 404);
    }
}
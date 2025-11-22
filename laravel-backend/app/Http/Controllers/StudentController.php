<?php

namespace App\Http\Controllers;

use App\Helpers\AuthHelper;
use App\Imports\StudentsImport;
use App\Models\Classe;
use App\Models\ImportError;
use App\Models\User;
use App\Models\user_profile;
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
                'teacher_id' => 'required|string|max:20',
                'subject_id' => 'required|integer',
                'academic_year' => 'required|string|max:20',
                'semester' => 'required|string|max:20',
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
            $subjectId = (int) $validated['subject_id'];
            $academic_year = (string) $validated['academic_year'];
            $semester = (string) $validated['semester'];

            // Tạo instance để lấy thống kê sau import
            $import = new StudentsImport(
                classId: $classId,
                teacherId: $teacherId,
                majorId: $majorId,
                subjectId: $subjectId,
                academic_year: $academic_year,
                semester: $semester,
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
                'error'   => '❌ Import thất bại!, vui lòng liên hệ admin',
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

    public function meilisearchStudent(Request $r)
    {
        $q = trim($r->query('q', ''));
        $classId   = $r->query('class_id');
        $majorId   = $r->query('major_id');
        $teacherId = $r->query('teacher_id');

        if ($q === '') return response()->json([]);

        $builder = user_profile::search($q)
            // CHỈ LẤY SV
            ->query(function ($eloquent) use ($classId, $majorId, $teacherId) {
                $eloquent->whereHas('user', function ($u) {
                    $u->where('role', 'student');
                });

                if ($classId) {
                    $eloquent->where('class_id', $classId);
                }

                if ($majorId) {
                    $eloquent->where('major_id', $majorId);
                }

                // nếu teacher_id là giáo viên của lớp
                if ($teacherId) {
                    $eloquent->whereHas('class', function ($c) use ($teacherId) {
                        $c->where('teacher_id', $teacherId);
                    });
                }
            });

        return response()->json($builder->get());
    }
}
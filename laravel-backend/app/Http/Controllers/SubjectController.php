<?php

namespace App\Http\Controllers;

use App\Helpers\AuthHelper;
use App\Imports\SubjectImport;
use App\Models\Subject;
use App\Services\SubjectService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;

class SubjectController extends Controller
{
    protected $subjectService;

    public function __construct(SubjectService $subjectService)
    {
        $this->subjectService = $subjectService;
    }

    // 🟢 Lấy danh sách
    public function indexSubject()
    {
        $result = $this->subjectService->getAllSubjects();
        return response()->json($result, 200);
    }
    // 🟢 Lấy danh sách
    public function getSubjectByMajor($idMajor)
    {
        $result = DB::table("subjects")
            ->join("majors", "subjects.major_id", "majors.major_id")
            ->where("majors.major_id", $idMajor)->get();
        if ($result->count() > 0) {
            return response()->json($result, 200);
        }
    }
    public function getSubject($id)
    {
        AuthHelper::roleAmin();
        $subject = Subject::with('major')->find($id);

        if (!$subject) {
            return response()->json(['message_error' => 'Không tìm thấy môn học!'], 404);
        }

        return response()->json($subject, 200);

        return response()->json(['message_error' => 'Lỗi server!'], 500);
    }


    // 🟢 Thêm môn học
    public function storeSubject(Request $request)
    {
        AuthHelper::roleAmin();

        $result = $this->subjectService->createSubject($request->all());
        $code = $result['success'] ? 201 : 400;
        return response()->json($result, $code);
    }

    // 🟢 Cập nhật môn học
    public function updateSubject(Request $request, $id)
    {
        AuthHelper::roleAmin();

        $result = $this->subjectService->updateSubject($id, $request->all());
        $code = $result['success'] ? 200 : 400;
        return response()->json($result, $code);
    }

    // 🟢 Xóa môn học
    public function destroySubject($id)
    {
        AuthHelper::roleAmin();

        $result = $this->subjectService->deleteSubject($id);
        $code = $result['success'] ? 200 : 404;
        return response()->json($result, $code);
    }

    public function import(Request $request)
    {
        AuthHelper::roleAmin();

        if (!$request->hasFile('file')) {
            return response()->json([
                'message' => 'Vui lòng chọn file Excel để import!',
                'success' => 0,
                'failed' => 0
            ], 400);
        }

        $file = $request->file('file');

        // 2️⃣ Kiểm tra định dạng file
        $ext = strtolower($file->getClientOriginalExtension());
        if (!in_array($ext, ['xls', 'xlsx'])) {
            return response()->json([
                'message' => 'File không hợp lệ! Chỉ hỗ trợ .xls hoặc .xlsx',
                'success' => 0,
                'failed' => 0
            ], 400);
        }

        // 3️⃣ Gọi import
        $import = new SubjectImport();
        Excel::import($import, $file);

        // 4️⃣ Trả kết quả JSON
        return response()->json([
            'message' => '✅ Import danh sách môn học hoàn tất!',
            'success' => $import->success,
            'failed' => $import->failed,
            'total' => $import->totalSubjects,
        ], 200);

        return response()->json([
            'message' => '❌ Lỗi khi import môn học: ' . $e->getMessage(),
            'success' => 0,
            'failed' => 0
        ], 500);
    }
}
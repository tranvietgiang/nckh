<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\SubjectService;

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

    // 🟢 Thêm môn học
    public function storeSubject(Request $request)
    {
        $result = $this->subjectService->createSubject($request->all());
        $code = $result['success'] ? 201 : 400;
        return response()->json($result, $code);
    }

    // 🟢 Cập nhật môn học
    public function updateSubject(Request $request, $id)
    {
        $result = $this->subjectService->updateSubject($id, $request->all());
        $code = $result['success'] ? 200 : 400;
        return response()->json($result, $code);
    }

    // 🟢 Xóa môn học
    public function destroySubject($id)
    {
        $result = $this->subjectService->deleteSubject($id);
        $code = $result['success'] ? 200 : 404;
        return response()->json($result, $code);
    }
}
<?php

namespace App\Http\Controllers;

use App\Helpers\AuthHelper;
use App\Models\ImportError;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Services\ErrorImportService;

class ErrorsImportController extends Controller
{
    //
    public function __construct(protected ErrorImportService $errorImportService) {}

    public function getStudentErrors($class_id, $teacherId, $major_id)
    {
        AuthHelper::isLogin();

        $result = $this->errorImportService->getStudentErrors([
            'class_id'   => $class_id,
            'teacher_id' => $teacherId,
            'major_id'   => $major_id,
        ]);

        if ($result['success']) {
            return response()->json($result['data'], 200);
        }

        return response()->json(['message_error' => $result['message']], 500);
    }


    public function deleteErrorImportStudent($class_id, $teacherId, $major_id)
    {
        AuthHelper::isLogin();
        AuthHelper::roleAmin();

        $result = $this->errorImportService->deleteErrorImportStudent([
            'class_id'   => $class_id,
            'teacher_id' => $teacherId,
            'major_id'   => $major_id,
        ]);

        if ($result['success']) {
            return response()->json([], 200);
        }

        return response()->json(['message_error' => $result['message']], 500);
    }

    public function deleteGroupErrors(Request $request)
    {
        $teacherId = $request->input('teacher_id');
        $classId = $request->input('class_id');

        ImportError::where('teacher_id', $teacherId)
            ->where('class_id', $classId)
            ->where('typeError', 'group')
            ->delete();

        return response()->json(['message' => 'Đã xóa lỗi nhóm thành công!']);
    }

    public function getGroupErrors($classId, $majorId)
    {
        AuthHelper::roleTeacher();
        $teacherId = Auth::id();

        $getGroupError = ImportError::where('teacher_id', $teacherId)
            ->where('class_id', $classId)
            ->where('major_id', $majorId)
            ->where('typeError', 'group')
            ->get();

        if ($getGroupError->count() > 0) {
            return response()->json($getGroupError, 200);
        }

        return response()->json(['message_error' => 'Lỗi server!']);
    }
}
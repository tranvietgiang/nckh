<?php

namespace App\Http\Controllers;

use App\Helpers\AuthHelper;
use App\Models\ImportError;
use Illuminate\Http\Request;

class ErrorsImportController extends Controller
{
    //
    public function getStudentErrors($class_id, $teacherId, $major_id)
    {
        AuthHelper::isLogin();

        if (!$class_id || !$teacherId || !$major_id) {
            return response()->json(["message_error" => "Dữ liễu sai"], 402);
        }

        $list_import_error = ImportError::where('class_id', $class_id)
            ->where('teacher_id', $teacherId)
            ->where('major_id', $major_id)
            ->get();

        if ($list_import_error->count() > 0) {
            return response()->json($list_import_error, 200);
        }

        return response()->json(["message_error" => "Lỗi server"], 500);
    }

    public function deleteByClass($class_id, $teacherId, $major_id)
    {
        AuthHelper::isLogin();

        if (!$class_id || !$teacherId || !$major_id) {
            return response()->json(["message_error" => "Dữ liễu sai"], 402);
        }

        $delete = ImportError::where('class_id', $class_id)
            ->where('teacher_id', $teacherId)
            ->where('major_id', $major_id)->delete();

        if ($delete) {
            return response()->json(["status" => true], 200);
        }

        return response()->json(["message_error" => "Lỗi server"], 500);
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
}
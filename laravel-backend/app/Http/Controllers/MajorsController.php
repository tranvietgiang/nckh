<?php

namespace App\Http\Controllers;

use App\Helpers\AuthHelper;
use App\Imports\MajorImport;
use App\Models\Classe;
use App\Models\ImportError;
use App\Models\Major;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Maatwebsite\Excel\Facades\Excel;

class MajorsController extends Controller
{
    public function __construct(protected \App\Services\MajorService $majorService) {}

    /**
     * 🟢 Lấy danh sách ngành theo quyền (teacher đang đăng nhập)
     */
    public function getMajors()
    {
        AuthHelper::isLogin();
        $result = $this->majorService->getMajors();
        return response()->json($result, 200);
    }

    /**
     * 🟢 Lấy toàn bộ ngành (admin)
     */
    public function getAllMajors()
    {
        $majors = Major::orderBy('major_name', 'asc')->get();

        if ($majors->count() === 0) {
            return response()->json(['message_error' => 'Không có dữ liệu ngành.'], 404);
        }

        return response()->json($majors, 200);
    }

    /**
     * 🟢 Lấy ngành mà giáo viên đang dạy
     */
    public function getMajorsByClass($idTeacher)
    {
        AuthHelper::isLogin();

        $majors = Classe::select('majors.*', 'classes.teacher_id', 'classes.major_id')
            ->join('majors', 'classes.major_id', '=', 'majors.major_id')
            ->distinct()
            ->where('classes.teacher_id', $idTeacher)
            ->get();

        if ($majors->isEmpty()) {
            return response()->json(['message_error' => 'Không tìm thấy ngành bạn dạy.'], 404);
        }

        return response()->json($majors, 200);
    }

    /**
     * ➕ Thêm ngành mới
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'major_name'       => 'required|string|max:150',
                'major_abbreviate' => 'required|string|max:50|unique:majors,major_abbreviate',
            ]);

            $major = Major::create($validated);

            return response()->json([
                'success' => true,
                'message' => '✅ Thêm ngành thành công!',
                'major'   => $major,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => '❌ Dữ liệu không hợp lệ!',
                'errors'  => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '⚠️ Lỗi server: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * ✏️ Cập nhật ngành (PUT /api/majors/{major_id})
     */
    public function update(Request $request, $major_id)
    {
        try {
            $validated = $request->validate([
                'major_name'       => 'required|string|max:150',
                'major_abbreviate' => [
                    'required',
                    'string',
                    'max:50',
                    Rule::unique('majors', 'major_abbreviate')->ignore($major_id, 'major_id'),
                ],
            ]);

            $major = Major::findOrFail($major_id);
            $major->update($validated);

            return response()->json([
                'success' => true,
                'message' => '✅ Cập nhật ngành thành công!',
                'major'   => $major,
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => '❌ Dữ liệu không hợp lệ!',
                'errors'  => $e->errors(),
            ], 422);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '❌ Ngành không tồn tại!',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '⚠️ Lỗi server: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * 🗑️ Xóa ngành
     */
    public function destroy($major_id)
    {
        try {
            $major = Major::find($major_id);
            if (!$major) {
                return response()->json([
                    'success' => false,
                    'message' => '❌ Ngành không tồn tại!',
                ], 404);
            }

            $major->delete();

            return response()->json([
                'success' => true,
                'message' => '🗑️ Xóa ngành thành công!',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '❌ Không thể xóa ngành học!',
            ], 500);
        }
    }

    /**
     * 📤 Import ngành từ Excel
     */
    public function import(Request $request)
    {
        if (!$request->hasFile('file')) {
            return response()->json(['message' => '❌ Chưa chọn file Excel!'], 400);
        }

        $file   = $request->file('file');
        $import = new MajorImport();
        Excel::import($import, $file);

        $list_import_error = ImportError::where('typeError', 'major')->get();

        return response()->json([
            'message'      => 'Import hoàn tất!',
            'total_major'  => $import->totalMajors,
            'success'      => $import->success ?? 0,
            'failed'       => $import->failed ?? 0,
            'list_import_error' => $list_import_error,
        ], 200);
    }

    /**
     * 🧹 Xóa toàn bộ lỗi import ngành
     */
    public function deleteErrorMajorsImport()
    {
        AuthHelper::roleAmin();
        $deleted = ImportError::where('typeError', 'major')->delete();

        return response()->json([
            'success' => true,
            'message' => '🧹 Đã xóa lỗi import ngành!',
            'deleted' => $deleted,
        ], 200);
    }

    /**
     * 🔍 Lấy danh sách lỗi import ngành
     */
    public function getErrorMajorsImport()
    {
        AuthHelper::roleAmin();

        $errors = ImportError::where('typeError', 'major')->get();

        if ($errors->isEmpty()) {
            return response()->json(['message_error' => 'Không có lỗi import ngành'], 404);
        }

        return response()->json($errors, 200);
    }


    public function getNameMajor($majorId)
    {
        $name = Major::where("major_id", $majorId)->first();

        return response()->json($name);
    }
}


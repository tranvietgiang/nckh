<?php

namespace App\Http\Controllers;

use App\Helpers\AuthHelper;
use App\Imports\MajorImport;
use App\Models\Classe;
use App\Models\ImportError;
use App\Models\Major;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Facades\Excel;
use PhpOffice\PhpSpreadsheet\IOFactory;

class MajorsController extends Controller
{
    //
    public function getMajors()
    {
        AuthHelper::isLogin();

        $getMajor = Major::all();

        if ($getMajor->count() > 0) {
            return response()->json($getMajor);
        }

        return response()->json(["message_error" => "Lỗi server"], 500);
    }

    public function getAllMajors()
    {
        $getMajor = Major::orderBy("major_name", "desc")->get();

        if ($getMajor->count() > 0) {
            return response()->json($getMajor, 200);
        }

        return response()->json(["message_error" => "Dữ dữ liệu"], 500);
    }

    // 🔹 Thêm 1 ngành thủ công

    public function getMajorsByClass($idTeacher)
    {
        AuthHelper::isLogin();

        $getMajors = Classe::select("majors.*", "classes.teacher_id", "classes.major_id")
            ->join("majors", "classes.major_id", "=", "majors.major_id")
            ->distinct()
            ->where("classes.teacher_id", $idTeacher)
            ->get();


        if ($getMajors->count() > 0) {
            return response()->json($getMajors);
        }

        return response()->json(['message_error' => 'Không tìm ngành bạn dạy'], 404);
    }

    public function store(Request $request)
    {
        $request->validate([
            'major_name' => 'required|string|max:150',
            'major_abbreviate' => 'required|string|max:50|unique:majors,major_abbreviate',
        ]);

        $major = Major::create($request->only(['major_name', 'major_abbreviate']));

        return response()->json([
            'success' => true,
            'message' => ' Thêm ngành thành công!',
            'major' => $major
        ]);
    }

    // 🔹 Import ngành từ file Excel (xử lý trực tiếp)
    public function import(Request $request)
    {
        if (!$request->hasFile('file')) {
            return response()->json(['error' => '❌ Chưa chọn file Excel!'], 400);
        }

            $file = $request->file('file');

            // Dùng class import chuyên biệt (đã tự lưu lỗi)
            $import = new MajorImport();
            Excel::import($import, $file);

            $list_import_error = ImportError::where("typeError", "major")->get();

              if ($list_import_error->count() > 0) {
                return response()->json([
                    'message' => 'Import hoàn tất!',
                    'total_major' => $import->totalMajors,
                    'success' => $import->success ?? 0,
                    'failed'  => $import->failed ?? 0,
                    'list_import_error' => $list_import_error,
                ]);
            }

            return response()->json([
                'message' => 'Import hoàn tất!',
                'total_major' => $import->totalMajors,
                'success' => $import->success ?? 0,
                'failed'  => $import->failed ?? 0,
            ]);
    }

    public function deleteErrorMajorsImport(){
        AuthHelper::roleAmin();

        $delete = ImportError::where("typeError","major")->delete();

        if(!$delete){   
            return response()->json(["message_error" => "Xóa lỗi không thành công"],500);
        
        }
    }

    public function getErrorMajorsImport(){
        AuthHelper::roleAmin();

        $get = ImportError::where("typeError","major")->get();

        if($get->count() > 0){   
            return response()->json($get,200);
        }

        return response()->json(["message_error" => "Xóa lỗi không thành công"],500);
    }
}

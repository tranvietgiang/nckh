<?php

namespace App\Http\Controllers;

use App\Helpers\AuthHelper;
use App\Models\Major;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use PhpOffice\PhpSpreadsheet\IOFactory;

class MajorsController extends Controller
{
    //

    public function getMajors()
    {
        $teacherId = AuthHelper::isLogin();

        $getMajor = Major::select("majors.*", "user_profiles.*")
            ->join("user_profiles", "majors.major_id", "=", "user_profiles.major_id")
            ->where("user_profiles.user_id", $teacherId)
            ->get();

        if ($getMajor->count() > 0) {
            return response()->json($getMajor);
        }

        return response()->json(["message_error" => "Lỗi server"], 500);
    }

    public function index()
    {
        return response()->json(Major::all());
    }

    // 🔹 Thêm 1 ngành thủ công
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
        $spreadsheet = IOFactory::load($file->getRealPath());
        $sheet = $spreadsheet->getActiveSheet();
        $rows = $sheet->toArray(null, true, true, true);

        $success = 0;
        $failed = 0;
        $errors = [];

        foreach (array_slice($rows, 1) as $row) {
            $name = trim($row['A']);
            $abbr = trim($row['B']);

            if (!$name || !$abbr) {
                $failed++;
                continue;
            }

            if (Major::where('major_abbreviate', $abbr)->exists()) {
                $failed++;
                $errors[] = "Trùng mã ngành: {$abbr}";
                continue;
            }

            Major::create([
                'major_name' => $name,
                'major_abbreviate' => $abbr,
            ]);
            $success++;
        }

        return response()->json([
            'success' => true,
            'message' => ' Import hoàn tất!',
            'total_success' => $success,
            'total_failed' => $failed,
            'errors' => $errors,
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use App\Imports\StudentsImport;
use App\Models\User;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class StudentController extends Controller
{
    //
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv'
        ]);

        $import = new StudentsImport();
        Excel::import($import, $request->file('file'));

        // Tổng sinh viên sau khi import
        $totalStudent = $this->fetchStudentsData()->count();

        return response()->json([
            'message' => 'Import hoàn tất!',
            'total_student' => $totalStudent,
            'success' => $import->success ?? 0,
            'failed'  => $import->failed ?? 0,
            'duplicates' => $import->duplicates ?? [],
        ]);
    }


    public function fetchStudentsData()
    {
        return User::select(
            'users.user_id',
            'user_profiles.fullname',
            'user_profiles.birthdate',
            'user_profiles.phone',
            'user_profiles.class_student',
            'classes.class_name',
            'users.email'
        )
            ->join('user_profiles', 'users.user_id', '=', 'user_profiles.user_id')
            ->join('classes', 'user_profiles.class_id', '=', 'classes.class_id')
            ->where('users.role', 'student')
            ->get();
    }

    public function getStudent()
    {
        $students = $this->fetchStudentsData();

        if ($students->count() > 0) {
            return response()->json([
                "list_student" => $students,
                "total_student" => $students->count(),
            ]);
        }
    }
}
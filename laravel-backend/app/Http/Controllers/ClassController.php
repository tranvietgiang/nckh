<?php

namespace App\Http\Controllers;

use App\Models\Classe;
use App\Models\user_profile;
use Illuminate\Http\Request;

class ClassController extends Controller
{
    //

    public function getClass()
    {
        $classes = Classe::all();
        return response()->json($classes);
    }

    //lấy lớp  học thấy  id giảng viên 
    public function getClassByTeacher($id)
    {
        $classes = Classe::where('teacher_id', $id)->get();

        return response()->json($classes);
    }

    // public function getStudentsByClass($classId)
    // {
    //     $students = user_profile::select(
    //         'user_profiles.fullname',
    //         'user_profiles.phone',
    //         'user_profiles.user_id',
    //         'users.email',
    //         'classes.class_name'
    //     )
    //         ->join('users', 'users.user_id', '=', 'user_profiles.user_id')
    //         ->join('classes', 'classes.class_id', '=', 'user_profiles.class_id')
    //         ->where('user_profiles.class_id', $classId)
    //         ->where('users.role', 'student')
    //         ->get();

    //     return response()->json($students);
    // }


 public function getStudentsByClass($classId)
{
    $students = \DB::table('user_profiles')
        ->join('users', 'users.user_id', '=', 'user_profiles.user_id')
        ->join('classes', 'classes.class_id', '=', 'user_profiles.class_id') // ✅ thêm dòng này
        ->leftJoin('reports', 'reports.class_id', '=', 'user_profiles.class_id')
        ->leftJoin('submissions', function ($join) {
            $join->on('submissions.student_id', '=', 'user_profiles.user_id')
                 ->on('submissions.report_id', '=', 'reports.report_id');
        })
        ->where('user_profiles.class_id', $classId)
        ->select(
            'user_profiles.user_id',
            'user_profiles.fullname',
            'users.email',
            'classes.class_name', // ✅ thêm dòng này
            \DB::raw('
                CASE
                    WHEN submissions.submission_id IS NULL THEN "Chưa nộp"
                    WHEN submissions.status = "submitted" THEN "Đã nộp"
                    WHEN submissions.status = "graded" THEN "Đã chấm"
                    WHEN submissions.status = "rejected" THEN "Bị từ chối"
                    ELSE "Không xác định"
                END AS status
            ')
        )
        ->groupBy(
            'user_profiles.user_id',
            'user_profiles.fullname',
            'users.email',
            'classes.class_name',
            'submissions.submission_id',
            'submissions.status'
        )
        ->get();

    return response()->json($students);
}


}

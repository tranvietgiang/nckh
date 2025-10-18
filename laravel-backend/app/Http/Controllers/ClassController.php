<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Classe;
use App\Models\user_profile;
class ClassController extends Controller
{
    // lấy tất cả lớp học 
    public function getClass(){
        $classes = Classe::all();
        return response()->json($classes);
    }

    //lấy lớp  học thấy  id giảng viên 
    public function getClassByTeacher($id){
            $classes = Classe::where('teacher_id',$id)->get();

        return response()->json($classes);
    }

     public function getStudentsByClass($classId)
    {
        $students = user_profile::select(
                'user_profiles.fullname',
                'user_profiles.phone',
                'user_profiles.user_id',
                'users.email',
                'classes.class_name'
            )
            ->join('users', 'users.user_id', '=', 'user_profiles.user_id')
            ->join('classes', 'classes.class_id', '=', 'user_profiles.class_id')
            ->where('user_profiles.class_id', $classId)
            ->where('users.role', 'student') // nếu có cột role trong users
            ->get();

        return response()->json($students);
    }
}

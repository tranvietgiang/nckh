<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Classe;

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
}

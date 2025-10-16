<?php

namespace App\Http\Controllers;

use App\Models\Classe;
use App\Models\Notification;
use Illuminate\Http\Request;

class CreateNotificationController extends Controller
{
    //

    public function getClassByTeacher($idTeacher)
    {
        $getClasses = Classe::select('classes.*', 'user_profiles.*')
            ->join('user_profiles.class_id', '=', 'classes.class_id')
            ->whereIn('user_profiles.class_id', $idTeacher)->get();

        if ($getClasses->count() > 0) {
            return response()->json($getClasses);
        }
    }

    public function createNotification(Request $request)
    {
        $data = $request->all() ?? null;

        if ($data == null) {
            return response()->json([
                "error" => "Dữ liệu gửi đi không tồn tại!"
            ], 403);
        }

        $createNotify =  Notification::create([
            'title' => $data['title'],
            'content' => $data['content'],
            'teacher_id' => $data['teacher_id'],
            'class_id' => $data['class_id'],
        ]);

        if ($createNotify) {
            return response()->json([
                "message" => "Tạo thông báo thành công"
            ], 200);
        }
    }
}
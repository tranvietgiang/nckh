<?php

namespace App\Http\Controllers;

use App\Mail\StudentNotificationMail;
use App\Models\Classe;
use App\Models\Notification;
use App\Models\User;
use App\Models\user_profile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use app\Http\Controllers\ClassController;

class NotificationController extends Controller
{
    //
    public function createNotification(Request $request)
    {
        $data = $request->all();

        if (!is_array($data)) {
            return response()->json([
                "error" => "Dữ liệu gửi đi không tồn tại!"
            ], 403);
        }

        $teacher = User::where('user_id', $data['teacher_id'])->exists();
        if (!$teacher) {
            return response()->json(['message_error' => 'Không tìm thấy giảng viên!'], 404);
        }

        foreach ($data as $key => $item) {
            if ($data['sendEmail'] == false) continue;
            if (empty($item)) {
                return response()->json(["error" => "Trường $key không được để trống!"], 403);
            }
        }

        $check_class = Classe::where('class_id', $data['class_id'])
            ->first();
        if (!$check_class) {
            return response()->json(['message_error' => "Lớp này không tồn tại"], 402);
        }

        $check_teacher = Classe::where('teacher_id', $data['teacher_id'])
            ->exists();
        if (!$check_teacher) {
            return response()->json(['message_error' => "Giảng viên không tồn tại"], 402);
        }

        $check_teacher_class = Classe::where('teacher_id', $data['teacher_id'])
            ->where('class_id', $data['class_id'])
            ->exists();
        if (!$check_teacher_class) {
            return response()->json(['message_error' => "Giảng viên không dạy lớp này!"], 402);
        }

        $createNotify =  Notification::create([
            'title' => $data['title'],
            'content' => $data['content'],
            'teacher_id' => $data['teacher_id'],
            'class_id' => $data['class_id'],
        ]);


        if ($createNotify) {
            if ($data['sendEmail'] == true) {
                $students = user_profile::select('users.*', 'user_profiles.*')
                    ->join('users', 'users.user_id', '=', 'user_profiles.user_id')
                    ->where('user_profiles.class_id', $data['class_id'])
                    ->where("users.role", "student")
                    ->get();

                $getTeacher = user_profile::where("user_id", $data['teacher_id'])->first();
                foreach ($students as $student) {
                    try {
                        Mail::to($student->email)->send(
                            new StudentNotificationMail(
                                $student->fullname,
                                $data['title'],
                                $data['content'],
                                $getTeacher->fullname ?? 'Giảng viên',
                                $check_class->class_name ?? 'Không xác định'
                            )
                        );
                    } catch (\Exception $e) {
                        Log::error("Không thể gửi mail tới {$student->email}: {$e->getMessage()}");
                    }
                }

                return response()->json([
                    "message_success" => "Gửi thông báo thành công đến lớp $check_class->class_name qua 'email'"
                ], 200);
            }
        }

        if ($createNotify) {
            return response()->json([
                "message_success" => "Gửi thông báo thành công đến lớp '$check_class->class_name'"
            ], 200);
        }
    }

    public function getClassOfTeacher()
    {
        $useId = Auth::id() ?? null;

        $getClasses = Classe::select('classes.class_id as class_id_teacher', 'classes.class_name', 'user_profiles.*',)
            ->join('user_profiles', 'user_profiles.user_id', '=', 'classes.teacher_id')
            ->where('classes.teacher_id', $useId)
            ->get();

        if ($getClasses->count() > 0) {
            return response()->json($getClasses);
        }

        return response()->json(['message' => 'Không tìm thấy lớp'], 404);
    }


    public function getNotify()
    {
        $useId = Auth::id() ?? null;
        if (!$useId) {
            return response()->json(["message_error" => "Người dùng chưa đăng nhâp!"], 401);
        }

        $dataNotify = User::select(
            "users.user_id",
            "users.role",
            "classes.class_id",
            "user_profiles.user_id",
            "user_profiles.class_id",
            "notifications.*"
        )
            ->join("user_profiles", "users.user_id", "=", "user_profiles.user_id")
            ->join("classes", "classes.class_id", "=", "user_profiles.class_id")
            ->join("notifications", "classes.class_id", "=", "notifications.class_id")
            ->where("users.user_id", $useId)
            ->where("users.role", "student")
            ->orderBy("notifications.created_at", "desc")->get();

        if ($dataNotify->count() > 0) {
            return response()->json($dataNotify);
        }

        return response()->json(["message_error" => "Lỗi serve, vui lòng tải lại trang"], 500);
    }
}

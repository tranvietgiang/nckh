<?php

namespace App\Repositories;

use App\Models\Notification;
use App\Mail\StudentNotificationMail;
use App\Models\User;
use App\Models\user_profile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class NotificationRepository
{
    public function createNotificationRepository(array $data, string $className): bool
    {
        try {
            $notification = Notification::create([
                'title'      => $data['title'],
                'content'    => $data['content'],
                'major_id'   => $data['major_id'],
                'teacher_id' => $data['teacher_id'],
                'class_id'   => $data['class_id'],
            ]);
            if (!$notification) return false;

            if (!empty($data['sendEmail']) && $data['sendEmail'] === true) {
                $students = user_profile::select('users.email', 'user_profiles.fullname')
                    ->join('users', 'users.user_id', '=', 'user_profiles.user_id')
                    ->where('user_profiles.class_id', $data['class_id'])
                    ->where('user_profiles.major_id', $data['major_id'])
                    ->where('users.role', 'student')
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
                                $className
                            )
                        );
                    } catch (\Exception $e) {
                        Log::error("Không thể gửi mail tới {$student->email}: {$e->getMessage()}");
                    }
                }
            }

            return true;
        } catch (\Exception $e) {
            Log::error("Lỗi khi tạo thông báo: " . $e->getMessage());
            return false;
        }
    }

    /**
     * lấy ra thông tin để gửi thông báo
     */
    public function getNotifyRepository(string $studentId): Collection
    {
        return User::select(
            "users.user_id",
            "users.role",
            "classes.class_id",
            "classes.class_name",
            "user_profiles.user_id",
            "user_profiles.class_id",
            "notifications.*"
        )
            ->join("user_profiles", "users.user_id", "=", "user_profiles.user_id")
            ->join("classes", "classes.class_id", "=", "user_profiles.class_id")
            ->join("notifications", "classes.class_id", "=", "notifications.class_id")
            ->where("users.user_id", $studentId)
            ->where("users.role", "student")
            ->orderBy("notifications.created_at", "desc")->get();
    }
}
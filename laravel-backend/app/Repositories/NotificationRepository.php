<?php

namespace App\Repositories;

use App\Interface\NotificationInterface;  // ĐÚNG
use App\Models\Classe;
use App\Models\Notification;
use App\Models\user_profile;
use App\Models\ImportError;
use Illuminate\Support\Facades\Mail;
use App\Mail\StudentNotificationMail;
use App\Models\User;
use \Illuminate\Database\Eloquent\Collection;

class NotificationRepository implements NotificationInterface
{
    public function findClassById(int|string $classId)
    {
        return Classe::where('class_id', $classId)->first();
    }

    public function teacherOwnsClass(array $data): bool
    {
        return Classe::where('teacher_id', $data['teacher_id'])
            ->where('class_id', $data['class_id'])
            ->where('major_id', $data['major_id'])
            ->exists();
    }

    public function createNotification(array $data, string $className): bool
    {
        try {
            // 1) Tạo thông báo
            $notification = Notification::create([
                'title'      => $data['title'],
                'content'    => $data['content'],
                'major_id'   => $data['major_id'],
                'teacher_id' => $data['teacher_id'],
                'class_id'   => $data['class_id'],
            ]);

            if (!$notification) {
                return false;
            }

            // 2) Nếu không bật gửi mail → return luôn
            if (empty($data['sendEmail']) || $data['sendEmail'] !== true) {
                return true;
            }

            // 3) Lấy danh sách sinh viên
            $students = user_profile::select(
                'users.email',
                'user_profiles.fullname',
                'users.user_id'
            )
                ->join('users', 'users.user_id', '=', 'user_profiles.user_id')
                ->where('user_profiles.class_id', $data['class_id'])
                ->where('user_profiles.major_id', $data['major_id'])
                ->where('users.role', 'student')
                ->get();

            // 4) Lấy tên GV
            $teacher = user_profile::where("user_id", $data['teacher_id'])->first();
            $teacherName = $teacher->fullname ?? 'Giảng viên';

            // 5) Gửi mail từng sinh viên
            foreach ($students as $student) {
                try {
                    if (!filter_var($student->email, FILTER_VALIDATE_EMAIL)) {
                        ImportError::create([
                            'user_id'     => $student->user_id,
                            'fullname'    => $student->fullname,
                            'email'       => $student->email,
                            'reason'      => 'Email không hợp lệ hoặc rỗng',
                            'typeError'   => 'notification',
                            'class_id'    => $data['class_id'],
                            'major_id'    => $data['major_id'],
                            'teacher_id'  => $data['teacher_id'],
                            'typeError'   => 'notification',
                        ]);
                        continue;
                    }

                    Mail::to($student->email)->send(
                        new StudentNotificationMail(
                            $student->fullname,
                            $data['title'],
                            $data['content'],
                            $teacherName,
                            $className
                        )
                    );
                } catch (\Exception $mailErr) {
                    ImportError::create([
                        'user_id'     => $student->user_id,
                        'fullname'    => $student->fullname,
                        'email'       => $student->email,
                        'reason'      => "Không thể gửi mail đến {$student->email}",
                        'typeError'   => 'notification',
                        'class_id'    => $data['class_id'],
                        'major_id'    => $data['major_id'],
                        'teacher_id'  => $data['teacher_id'],
                        'typeError'   => 'notification',
                    ]);
                }
            }

            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * lấy ra thông tin để gửi thông báo
     */
    public function getNotify(string $studentId): Collection
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
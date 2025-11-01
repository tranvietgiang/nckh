<?php

namespace App\Services;

use App\Repositories\NotificationRepository;
use App\Models\Classe;
use App\Models\Major;
use App\Models\User;
use App\Models\user_profile;

class NotificationService
{
    public function __construct(protected NotificationRepository $repo) {}

    public function createNotificationService(array $data): array
    {
        if (empty($data)) {
            return ['success' => false, 'message_error' => 'Dữ liệu gửi đi không tồn tại!'];
        }

        if (!Major::where("major_id", $data['major_id'])->exists()) {
            return ['success' => false, 'message_error' => 'Ngành này không tồn tại!'];
        }

        if (!User::where('user_id', $data['teacher_id'])->exists()) {
            return ['success' => false, 'message_error' => 'Không tìm thấy giảng viên!'];
        }

        foreach ($data as $key => $item) {
            if (!isset($data['sendEmail']) || $data['sendEmail'] == false) continue;
            if (empty($item)) {
                return ['success' => false, 'message_error' => "Trường $key không được để trống!"];
            }
        }

        $class = Classe::find($data['class_id']);
        if (!$class) {
            return ['success' => false, 'message_error' => "Lớp này không tồn tại!"];
        }

        $teacherOwnsClass = Classe::where('teacher_id', $data['teacher_id'])
            ->where('class_id', $data['class_id'])
            ->where('major_id', $data['major_id'])
            ->exists();

        if (!$teacherOwnsClass) {
            return ['success' => false, 'message_error' => "Giảng viên không dạy lớp này!"];
        }

        $created = $this->repo->createNotificationRepository($data, $class->class_name);

        return $created
            ? ['success' => true, 'message_success' => "Gửi thông báo thành công đến lớp {$class->class_name}"]
            : ['success' => false, 'message_error' => "Gửi thông báo thất bại"];
    }

    public function getNotifyService(string $studentId): array
    {
        $data = $this->repo->getNotifyRepository($studentId);

        if ($data->count() > 0) {
            $data = $data->map(function ($item) {
                $teacherName = user_profile::where('user_id', $item->teacher_id)->value('fullname');
                $item->teacher_name = $teacherName ?? 'Không rõ';
                return $item;
            });
            return [
                'status' => true,
                'data'   => $data
            ];
        }
        return ["status" => false, []];
    }
}
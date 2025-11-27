<?php

namespace App\Services;

use App\Models\Major;
use App\Models\User;
use App\Models\user_profile;
use App\Interface\NotificationInterface;  // ĐÚNG


class NotificationService
{
    public function __construct(protected NotificationInterface $repo) {}

    public function createNotificationService(array $data): array
    {
        // Kiểm tra dữ liệu rỗng
        if (empty($data)) {
            return ['success' => false, 'message_error' => 'Dữ liệu gửi đi không tồn tại!'];
        }
        // Kiểm tra độ dài dữ liệu 
        if ($data['title'] > 200 || $data['content'] > 500) {
            return ['success' => false, 'message_error' => 'Kỹ tự tiêu đề hoặc nội dung vượt quá giới hạn!'];
        }

        // Check ngành tồn tại
        if (!Major::where("major_id", $data['major_id'])->exists()) {
            return ['success' => false, 'message_error' => 'Ngành này không tồn tại!'];
        }

        // Check giảng viên tồn tại
        if (!User::where('user_id', $data['teacher_id'])->exists()) {
            return ['success' => false, 'message_error' => 'Không tìm thấy giảng viên!'];
        }

        // Check required nếu bật gửi email
        if (!empty($data['sendEmail']) && $data['sendEmail'] === true) {
            foreach ($data as $key => $item) {
                if (empty($item)) {
                    return ['success' => false, 'message_error' => "Trường $key không được để trống!"];
                }
            }
        }

        // Lấy thông tin lớp
        $class = $this->repo->findClassById($data['class_id']);
        if (!$class) {
            return ['success' => false, 'message_error' => 'Lớp này không tồn tại!'];
        }

        // Check quyền GV
        if (!$this->repo->teacherOwnsClass($data)) {
            return ['success' => false, 'message_error' => 'Giảng viên không dạy lớp này!'];
        }

        // Tạo thông báo
        $created = $this->repo->createNotification($data, $class->class_name);

        return $created
            ? ['success' => true, 'message_success' => "Gửi thông báo thành công đến lớp {$class->class_name}"]
            : ['success' => false, 'message_error' => "Gửi thông báo thất bại!"];
    }


    public function getNotifyService(string $studentId): array
    {
        $data = $this->repo->getNotify($studentId);

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
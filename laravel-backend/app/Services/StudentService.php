<?php

namespace App\Services;

use App\Repositories\StudentRepository;
use Illuminate\Support\Collection;

class StudentService
{
    public function __construct(
        protected StudentRepository $repo
    ) {}

    /**
     * Lấy hồ sơ theo role, luôn trả về mảng thống nhất.
     */
    public function getProfile(string $userId, string $role): array
    {
        $profile = $this->repo->getProfileByRole($userId, $role);

        if ($profile === null) {
            return ['success' => false, 'message_error' => 'Không tìm thấy hồ sơ người dùng'];
        }

        if ($role === 'teacher') {
            /** @var Collection $profile */
            if ($profile->isEmpty()) {
                return ['success' => false, 'message_error' => 'Giảng viên chưa có hồ sơ lớp/ngành'];
            }

            $first = $profile->first();

            return [
                'success' => true,
                'user_id'   => $first->user_id,
                'fullname'  => $first->fullname,
                'email'     => $first->email,
                'phone'     => $first->phone,
                'birthdate' => $first->birthdate,
                'role'      => $first->role,
                'majors'  => $profile->pluck('major_name')->filter()->unique()->values()->all(),
                'classes' => $profile->pluck('class_name')->filter()->unique()->values()->all(),
            ];
        }

        return ['success' => true, 'data' => $profile];
    }

    /**
     * Lấy hồ sơ theo role, luôn trả về mảng thống nhất.
     */
    public function getStudentService(int $class_id, string $teacher_id): array
    {
        $data = $this->repo->getStudentRepository($class_id, $teacher_id);

        if ($data->count() > 0) {
            return ['success' => true, 'list_student' => $data, "total_student" => $data->count()];
        }
        return [
            'message_error' => "không thể tải dc dữ liệu",
            'success' => false,
            'data' => []
        ];
    }
}
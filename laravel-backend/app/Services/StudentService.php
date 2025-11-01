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
}
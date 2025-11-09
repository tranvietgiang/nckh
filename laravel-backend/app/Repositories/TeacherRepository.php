<?php

namespace App\Repositories;

use App\Models\User;
use App\Models\user_profile;
use App\Models\Major;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class TeacherRepository
{
    protected $userModel;
    protected $profileModel;
    protected $majorModel;

    public function __construct(User $userModel, user_profile $profileModel, Major $majorModel)
    {
        $this->userModel = $userModel;
        $this->profileModel = $profileModel;
        $this->majorModel = $majorModel;
    }

    /**
     * 🔍 Tìm ngành theo ID hoặc tên
     */
    public function findMajor($majorRaw)
    {
        if (is_numeric($majorRaw)) {
            return $this->majorModel->find($majorRaw);
        }

        return $this->majorModel->where('major_name', 'LIKE', "%$majorRaw%")->first();
    }

    /**
     * 🔍 Kiểm tra trùng user_id hoặc email
     */
    public function existsUser($userId, $email)
    {
        return $this->userModel
            ->where('user_id', $userId)
            ->orWhere('email', $email)
            ->exists();
    }

    /**
     * 💾 Tạo user + profile trong transaction
     */
    public function createTeacher(array $userData, array $profileData)
    {
        return DB::transaction(function () use ($userData, $profileData) {
            $user = $this->userModel->create($userData);
            $profileData['user_id'] = $user->user_id;
            $this->profileModel->create($profileData);
            return $user;
        });
    }
}

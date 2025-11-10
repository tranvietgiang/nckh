<?php

namespace App\Repositories;

use App\Models\User;
use App\Models\user_profile; // 💡 Thêm model UserProfile
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log; // 💡 Thêm Log để ghi lỗi

class AdminRepository
{
    /**
     * @var User
     */
    protected $userModel;

    /**
     * @var user_profile
     */
    protected $userProfileModel;

    /**
     * 💡 Khởi tạo (Constructor) để inject (tiêm) các Model
     * Điều này giúp lớp Repository của bạn linh hoạt và dễ test.
     */
    public function __construct(User $userModel, user_profile $userProfileModel)
    {
        $this->userModel = $userModel;
        $this->userProfileModel = $userProfileModel;
    }

    /**
     * 🧾 Lấy toàn bộ người dùng
     * (Sử dụng model đã được inject)
     */
    public function getAllUsers()
    {
        return DB::table('users')
            ->leftJoin('user_profiles', 'users.user_id', '=', 'user_profiles.user_id')
            ->leftJoin('majors', 'user_profiles.major_id', '=', 'majors.major_id') 
            ->select(
                'users.user_id',
                'users.email',
                'users.role',
                'user_profiles.fullname',
                'user_profiles.phone',
                'user_profiles.class_student',
                'user_profiles.class_id',
                'user_profiles.major_id',
                'majors.major_name' 
            )
            ->get();
    }
    /**
     * 🗑️ Xóa người dùng theo ID
     */
    public function deleteUserById($user_id)
    {
        $user = $this->userModel->find($user_id);

        if (!$user) {
            return null;
        }

        // 💡 Nên dùng try-catch để phòng lỗi CSDL
        try {
            $user->delete();
            return true;
        } catch (\Exception $e) {
            Log::error("Lỗi Repository (deleteUserById): " . $e->getMessage());
            return false;
        }
    }

    /**
     * 💡 --- HÀM MỚI & SỬA LẠI ---
     * 📝 Cập nhật dữ liệu cho bảng 'users'
     * Hàm này giờ "ngốc" đi, nó chỉ nhận dữ liệu đã được Service xử lý
     * (Service sẽ lo việc hash password)
     *
     * @param string $user_id
     * @param array $userData Dữ liệu chỉ dành cho bảng 'users'
     * @return bool
     */
    public function updateUser(string $user_id, array $userData): bool
    {
        // Nếu không có gì để cập nhật, trả về true
        if (empty($userData)) {
            return true;
        }

        try {
            $user = $this->userModel->find($user_id);
            if (!$user) {
                return false;
            }
            // Chỉ update, không logic
            return $user->update($userData);
        } catch (\Exception $e) {
            Log::error("Lỗi Repository (updateUser): " . $e->getMessage());
            return false;
        }
    }

    /**
     * 💡 --- HÀM MỚI ---
     * 📝 Cập nhật hoặc tạo mới dữ liệu cho bảng 'user_profiles'
     *
     * @param string $user_id
     * @param array $profileData Dữ liệu chỉ dành cho bảng 'user_profiles'
     * @return user_profile|null
     */
    public function updateOrCreateProfile(string $user_id, array $profileData)
    {
        // Nếu không có gì để cập nhật, trả về null
        if (empty($profileData)) {
            return null;
        }

        try {
            // Tự động tìm 'user_id', nếu có thì update, không thì tạo mới
            return $this->userProfileModel->updateOrCreate(
                ['user_id' => $user_id], // Điều kiện tìm
                $profileData                // Dữ liệu cập nhật/tạo mới
            );
        } catch (\Exception $e) {
            Log::error("Lỗi Repository (updateOrCreateProfile): " . $e->getMessage());
            return null;
        }
    }

    /**
     * 💡 --- HÀM MỚI ---
     * 🧑‍🔍 Tìm user bằng ID và lấy kèm profile
     * (Service sẽ gọi hàm này sau khi update xong để trả về Controller)
     */
    public function findUserById(string $user_id)
    {
        // 'profile' là tên của relationship trong Model User
        return $this->userModel->with('profile')->find($user_id);
    }


    /**
     * 📋 Lấy danh sách báo cáo
     * (Hàm này giữ nguyên vì đã query đúng)
     */
    public function getAllReports()
    {
        return DB::table('submissions')
            ->join('users', 'submissions.student_id', '=', 'users.user_id')
            ->join('user_profiles', 'users.user_id', '=', 'user_profiles.user_id')
            ->select(
                'submissions.submission_id',
                'submissions.status',
                'submissions.submission_time',
                'user_profiles.fullname as student_name',
                'users.user_id as student_id'
            )
            ->orderByDesc('submissions.submission_time')
            ->get();
    }
}


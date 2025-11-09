<?php

namespace App\Services;

use App\Repositories\AdminRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class AdminService
{
    /**
     * @var AdminRepository
     */
    protected $adminRepository;

    /**
     * 💡 Inject (tiêm) AdminRepository vào
     */
    public function __construct(AdminRepository $adminRepository)
    {
        $this->adminRepository = $adminRepository;
    }

    /**
     * Lấy tất cả người dùng
     * (Logic đơn giản, chỉ cần gọi Repository)
     */
    public function getAllUsers()
    {
        return $this->adminRepository->getAllUsers();
    }

    /**
     * Xóa người dùng theo ID
     * (Logic đơn giản, chỉ cần gọi Repository)
     */
    public function deleteUserById(string $user_id)
    {
        return $this->adminRepository->deleteUserById($user_id);
    }

    /**
     * Lấy tất cả báo cáo
     * (Logic đơn giản, chỉ cần gọi Repository)
     */
    public function getAllReports()
    {
        return $this->adminRepository->getAllReports();
    }


    /**
     * 💡 --- HÀM QUAN TRỌNG NHẤT ---
     * Xử lý logic cập nhật người dùng (business logic)
     *
     * @param string $user_id ID của user cần cập nhật
     * @param array $data Dữ liệu tổng hợp từ Controller (đã được validate)
     * @return \App\Models\User|null
     */
    public function updateUser(string $user_id, array $data)
    {
        // 1. 💡 Tách biệt dữ liệu cho từng bảng
        // (Đây là logic nghiệp vụ)
        $userData = [];
        $profileData = [];

        // --- Dữ liệu cho bảng 'users' ---
        if (isset($data['email'])) {
            $userData['email'] = $data['email'];
        }
        // Logic nghiệp vụ: Chỉ hash password nếu nó được gửi lên và không rỗng
        // (React đã đảm bảo chỉ gửi `password` nếu muốn đổi)
        if (isset($data['password']) && !empty($data['password'])) {
            $userData['password'] = Hash::make($data['password']);
        }
        // (Bỏ qua 'role' vì nó bị disabled trên form React)


        // --- Dữ liệu cho bảng 'user_profiles' ---
        // Giả sử 'name' từ React là 'full_name' trong DB
        if (isset($data['name'])) {
            $profileData['fullname'] = $data['name'];
        }
        if (isset($data['department'])) {
            $profileData['department'] = $data['department'];
        }
        if (isset($data['class_name'])) {
            $profileData['class_name'] = $data['class_name'];
        }
        if (isset($data['position'])) {
            $profileData['position'] = $data['position'];
        }

        // 2. 💡 Sử dụng Transaction để đảm bảo toàn vẹn dữ liệu
        // (Vì ta đang thao tác trên 2 bảng)
        try {
            DB::beginTransaction();

            // 3. Gọi Repository để cập nhật
            // (Repository chỉ làm nhiệm vụ update, không quan tâm logic là gì)
            $this->adminRepository->updateUser($user_id, $userData);
            $this->adminRepository->updateOrCreateProfile($user_id, $profileData);

            // 4. Commit transaction (xác nhận thay đổi)
            DB::commit();

            // 5. Trả về dữ liệu user mới nhất (kèm profile)
            // (Gọi hàm findUserById của Repo)
            return $this->adminRepository->findUserById($user_id);

        } catch (\Exception $e) {
            // 6. Rollback nếu có lỗi xảy ra
            DB::rollBack();
            Log::error("Lỗi Service (updateUser): " . $e->getMessage());

            // Ném lỗi ra để Controller bắt và trả về response 500
            throw new \Exception("Cập nhật thất bại. Đã có lỗi xảy ra.");
        }
    }
}


<?php

namespace App\Http\Controllers;

use App\Services\AdminService; // 💡 Đổi từ Repository sang Service
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator; // 💡 Thêm Validator
use Illuminate\Validation\Rule; // 💡 Thêm Rule (để check email unique)

class AdminController extends Controller
{
    /**
     * @var AdminService
     */
    protected $adminService; // 💡 Đổi tên biến

    /**
     * 💡 Inject (tiêm) AdminService thay vì AdminRepository
     */
    public function __construct(AdminService $adminService)
    {
        $this->adminService = $adminService;
    }

    /**
     * Lấy danh sách users
     */
    public function getUser()
    {
        // 💡 Gọi Service
        return response()->json($this->adminService->getAllUsers());
    }

    /**
     * Xóa user
     */
    public function destroy($user_id)
    {
        // 💡 Gọi Service
        $deleted = $this->adminService->deleteUserById($user_id);

        if (!$deleted) {
            return response()->json(['message' => 'Người dùng không tồn tại hoặc xóa thất bại'], 404);
        }

        return response()->json(['message' => '✅ Xóa thành công']);
    }

    /**
     * Lấy danh sách báo cáo
     */
    public function getReports()
    {
        try {
            $reports = $this->adminService->getAllReports();
            return response()->json($reports);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Lỗi khi lấy danh sách báo cáo',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Cập nhật thông tin user
     */
    public function updateUser(Request $request, $user_id)
    {
        $validator = Validator::make($request->all(), [
            'email' => [
                'sometimes',
                'required',
                'email',
                Rule::unique('users')->ignore($user_id, 'user_id')
            ],
            'name' => 'sometimes|required|string|max:255', // Tương ứng 'full_name'
            'password' => 'nullable|string|min:6', // Cho phép rỗng (nghĩa là không đổi)
            'department' => 'nullable|string|max:255',
            'class_name' => 'nullable|string|max:255',
            'position' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422); // 422: Unprocessable Entity
        }

        // Lấy dữ liệu đã được validate
        $validatedData = $validator->validated();

        try {
            // 2. 💡 Gọi Service (chỉ truyền dữ liệu đã sạch)
            $updatedUser = $this->adminService->updateUser($user_id, $validatedData);

            if (!$updatedUser) {
                return response()->json(['message' => '❌ Không tìm thấy người dùng!'], 404);
            }

            // 3. 💡 Trả về response thành công
            return response()->json([
                'message' => '✅ Cập nhật thành công!',
                'user' => $updatedUser // Trả về user mới để React cập nhật state
            ], 200);

        } catch (\Exception $e) {
            // 4. 💡 Bắt lỗi do Service ném ra
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }
}

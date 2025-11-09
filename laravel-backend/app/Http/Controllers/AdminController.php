<?php

namespace App\Http\Controllers;

use App\Services\AdminService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class AdminController extends Controller
{
    protected $adminService;

    public function __construct(AdminService $adminService)
    {
        $this->adminService = $adminService;
    }

    /**
     * Lấy danh sách users
     */
    public function getAllUsers()
    {
        $users = $this->adminService->getAllUsers();
        return response()->json($users);
    }


    /**
     * Xóa user
     */
    public function destroy($user_id)
    {
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
            'name' => 'sometimes|required|string|max:255',
            'password' => 'nullable|string|min:6',
            'department' => 'nullable|string|max:255',
            'class_name' => 'nullable|string|max:255',
            'position' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        $validatedData = $validator->validated();

        try {
            $updatedUser = $this->adminService->updateUser($user_id, $validatedData);

            if (!$updatedUser) {
                return response()->json(['message' => '❌ Không tìm thấy người dùng!'], 404);
            }

            return response()->json([
                'message' => '✅ Cập nhật thành công!',
                'user' => $updatedUser
            ], 200);

        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }
}

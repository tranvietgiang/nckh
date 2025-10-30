<?php

namespace App\Http\Controllers;

use App\Repositories\AdminRepository;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    protected $userRepo;

    // Inject repository qua constructor (Dependency Injection)
    public function __construct(AdminRepository $userRepo)
    {
        $this->userRepo = $userRepo;
    }

    public function getUser()
    {
        return response()->json($this->userRepo->getAllUsers());
    }

    public function destroy($user_id)
    {
        $deleted = $this->userRepo->deleteUserById($user_id);

        if (!$deleted) {
            return response()->json(['message' => 'Người dùng không tồn tại'], 404);
        }

        return response()->json(['message' => 'Xóa thành công']);
    }

    public function getReports()
    {
        try {
            $reports = $this->userRepo->getAllReports();
            return response()->json($reports);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Lỗi khi lấy danh sách báo cáo',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function updateUser(Request $request, $id)
    {
        $data = $request->only(['username', 'email', 'role', 'password']);

        $updatedUser = $this->AdminRepository->updateUserById($id, $data);

        if (!$updatedUser) {
            return response()->json(['message' => '❌ Không tìm thấy người dùng!'], 404);
        }

        return response()->json(['message' => '✅ Cập nhật thành công!', 'user' => $updatedUser]);
    }

}

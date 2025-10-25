<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    //
    public function getUser()
    {

        $getUser = User::all();
        return response()->json($getUser);
    }

    public function destroy($user_id)
    {
        $user = User::find($user_id);

        if (!$user) {
            return response()->json(['message' => 'Người dùng không tồn tại'], 404);
        }

        $user->delete();

        return response()->json(['message' => 'Xóa thành công']);
    }


    public function getReports()
    {
        try {
            $reports = DB::table('submissions')
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

            return response()->json($reports);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Lỗi khi lấy danh sách báo cáo',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
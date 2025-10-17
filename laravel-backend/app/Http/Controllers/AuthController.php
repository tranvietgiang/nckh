<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class AuthController extends Controller
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

}

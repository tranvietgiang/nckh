<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    //
    public function getUser() {
        
        $getUser = User::all();
        return response()->json($getUser);
    }
}

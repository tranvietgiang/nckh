<?php

namespace App\Http\Controllers;
use App\Models\User;
use Illuminate\Http\Request;

abstract class Controller
{
    public function index()
    {
        $users = User::all();
        return response()->json($users);
    }
}

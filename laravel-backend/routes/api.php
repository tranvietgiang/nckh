<?php

use App\Http\Controllers\AuthController;
use Illuminate\Auth\Authenticatable;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Controller;

Route::post("/test", function () {
    return "test";
});

Route::get('/get-user', function () {
    return response()->json([
        'fullname' => 'Nguyễn Văn A',
        'email' => 'vana@example.com',
    ]);
});

Route::get('/users', [AuthController::class, 'getUser']);
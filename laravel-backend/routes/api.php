<?php


use App\Http\Controllers\AuthController;
use Illuminate\Auth\Authenticatable;

use App\Http\Controllers\StudentController;


use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Controller;
use App\Http\Controllers\NotificationController;

Route::post("/test", function () {
    return "test";
});


Route::get('/users', [AuthController::class, 'getUser']);

/**Giảng viên import ds sinh viên vào db */
Route::post('/students/import', [StudentController::class, 'import']);

/**lấy ra dữ liệu của sinh viên theo lớp */
Route::get('/get-students', [StudentController::class, 'getStudent']);

/**lấy ra dữ liệu lớp của giảng viên đang dạy */
Route::get('/get-class-teacher/{teacherId}', [NotificationController::class, 'getClassByTeacher']);

/**Tạo thông báo gửi đến sinh viên */
Route::post('/create-notification', [NotificationController::class, 'createNotification']);

Route::get('/get-profile', [StudentController::class, 'getProfile']);

/**Tạo thông báo gửi đến sinh viên */
Route::get('/get-students', [StudentController::class, 'getStudent']);

/**xóa sinh viên */
Route::delete('/delete/{user_id}', [AuthController::class, 'destroy']);

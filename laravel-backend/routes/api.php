<?php


use App\Http\Controllers\AuthController;
use Illuminate\Auth\Authenticatable;

use App\Http\Controllers\StudentController;


use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Controller;
use App\Http\Controllers\CreateNotificationController;

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


/**Giảng viên import ds sinh viên vào db */
Route::post('/students/import', [StudentController::class, 'import']);
/**lấy ra dữ liệu của sinh viên theo lớp */
Route::get('/get-students', [StudentController::class, 'getStudent']);

/**lấy ra dữ liệu lớp của giảng viên đang dạy */
Route::get('/get-class-teacher/{idTeacher}', [CreateNotificationController::class, 'getClassByTeacher']);
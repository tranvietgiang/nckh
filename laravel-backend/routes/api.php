<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\GradeController;
use App\Http\Controllers\AdminController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\SubmissionController;
use App\Http\Controllers\ClassController;

Route::post("/test", function () {
    return "test";
});



/**X ác thực người dùng */
Route::post('/auth/check-login', [AuthController::class, 'authRole']);

/**Giảng viên import ds sinh viên vào db */
Route::post('/students/import', [StudentController::class, 'import']);

/**lấy ra dữ liệu của sinh viên theo lớp */
Route::get('/get-students', [StudentController::class, 'getStudent']);

/**lấy ra dữ liệu lớp của giảng viên đang dạy */
Route::get('/get-class-teacher/{teacherId}', [NotificationController::class, 'getClassByTeacher']);

/**Tạo thông báo gửi đến sinh viên */
Route::post('/create-notification', [NotificationController::class, 'createNotification']);

Route::get('/get-profile', [StudentController::class, 'getProfile']);

Route::get('/get-profile', [StudentController::class, 'getProfile']);

Route::get('/get-students', [StudentController::class, 'getStudent']);

/**Lấy danh sách ở trong phần admin */
Route::get('/users', [AdminController::class, 'getUser']);
/**Xóa user trong admin */
Route::delete('/delete/{user_id}', [AdminController::class, 'destroy']);
/**Chấm điểm và phản hồi */
Route::get('/grades', [GradeController::class, 'index']);
Route::post('/grades', [GradeController::class, 'store']);
Route::get('/grades/{submission_id}', [GradeController::class, 'show']);
/**Lấy thông tin sinh viên đã nộp */
Route::get('/submissions', [SubmissionController::class, 'indes']);

/**Tạo thông báo gửi đến sinh viên */
Route::get('/get-students', [StudentController::class, 'getStudent']);

/**xóa sinh viên */
Route::delete('/delete/{user_id}', [AuthController::class, 'destroy']);

Route::get('classes/teacher/{id}', [ClassController::class, 'getClassByTeacher']);
Route::get('/classes/students/{classsId}', [ClassController::class, 'getStudentsByClass']);


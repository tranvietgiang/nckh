<?php


use App\Http\Controllers\AuthController;
use Illuminate\Auth\Authenticatable;

use App\Http\Controllers\StudentController;
use App\Http\Controllers\GradeController;
use App\Http\Controllers\AdminController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Controller;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\SubmissionController;
Route::post("/test", function () {
    return "test";
});



/**Giảng viên import ds sinh viên vào db */
Route::post('/students/import', [StudentController::class, 'import']);

/**lấy ra dữ liệu của sinh viên theo lớp */
Route::get('/get-students', [StudentController::class, 'getStudent']);

/**lấy ra dữ liệu lớp của giảng viên đang dạy */
Route::get('/get-class-teacher/{teacherId}', [NotificationController::class, 'getClassByTeacher']);

/**Tạo thông báo gửi đến sinh viên */
Route::post('/create-notification', [NotificationController::class, 'createNotification']);

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



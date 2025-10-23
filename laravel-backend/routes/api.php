<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\GradeController;
use App\Http\Controllers\AdminController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\SubmissionController;
use App\Http\Controllers\ClassController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\GoogleOAuthController;
use App\Http\Controllers\MajorsController;
use App\Http\Controllers\SimpleDriveController;
use Illuminate\Support\Facades\Request;


Route::post("/test", function () {
    return "test";
});

/**X ác thực người dùng */
Route::post('/auth/check-login', [AuthController::class, 'authRole']);

/**Giảng viên import ds sinh viên vào db */
Route::middleware('auth:sanctum')->post('/students/import', [StudentController::class, 'import']);

/**lấy ra dữ liệu của sinh viên theo lớp */
Route::middleware('auth:sanctum')->get('/get-students/{selectedClass}', [StudentController::class, 'getStudent']);

/**lấy ra dữ liệu lớp giảng viên đang dạy */
Route::middleware('auth:sanctum')->get('/get-class-teacher', [NotificationController::class, 'getClassOfTeacher']);

/**Tạo thông báo gửi đến sinh viên */
Route::post('/create-notification', [NotificationController::class, 'createNotification']);

Route::get('/profiles', [StudentController::class, 'getProfile']);

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

/**xóa sinh viên */
Route::delete('/delete/{user_id}', [AuthController::class, 'destroy']);

// Route::get('classes/teacher/{id}', [ClassController::class, 'getClassByTeacher']);
Route::middleware('auth:sanctum')->get('/classes/teacher/{id}', [ClassController::class, 'getClassByTeacher']);
Route::middleware('auth:sanctum')->post('/classes', [ClassController::class, 'inertsClassNew']);

/**lấy ra dữ liệu lớp của giảng viên đang dạy */
Route::get('/classes/students/{classsId}', [ClassController::class, 'getStudentsByClass']);

/*lấy ra thông báo mà giảng viển gửi*/
Route::middleware('auth:sanctum')->get('/get-notify', [NotificationController::class, 'getNotify']);

/**Tạo lớp học mới */

/**lấy ra lỗi sau khi import ds sinh viên */
Route::middleware('auth:sanctum')->get('/get-student-errors/{selectedClass}', [StudentController::class, 'getStudentErrors']);



Route::get('/drive-auth', [ReportController::class, 'getAuthUrl']);
Route::get('/drive-callback', [ReportController::class, 'handleCallback']);
Route::post('/drive-upload', [ReportController::class, 'uploadReport']);

/**Lấy báo cáo  */
Route::get('/submissions', [AdminController::class, 'getReports']);
Route::middleware('auth:sanctum')->get('/reports', [ReportController::class, 'getReportsByClass']);
Route::get('/submissionsreport', [SubmissionController::class, 'getSubmissionsByReport']);

Route::middleware('auth:sanctum')->get('/get-report', [ReportController::class, 'getReport']);
/**Láy ra ds ngành */
Route::middleware('auth:sanctum')->get('/majors', [MajorsController::class, 'getMajors']);

/**xem điểm sau khi chấm */
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/student/grades', [GradeController::class, 'gradingindex']);
    Route::get('/student/grades/{id}', [GradeController::class, 'gradingshow']);
});
/**Lấy lớp học */
Route::get('/student/classes', [ClassController::class, 'getStudentClasses']);

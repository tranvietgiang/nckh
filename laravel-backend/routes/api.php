<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\GradeController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\SubmissionController;
use App\Http\Controllers\ClassController;
use App\Http\Controllers\ErrorsImportController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\GoogleOAuthController;
use App\Http\Controllers\MajorsController;
use App\Http\Controllers\ReportMembersController;
use App\Http\Controllers\SimpleDriveController;
use App\Http\Controllers\StudentErrorsController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\UserController;

/**Xác thực người dùng */
Route::post('/auth/check-login', [AuthController::class, 'authRole']);

/**Giảng viên import ds sinh viên vào db */
Route::middleware('auth:sanctum')->post('/students/import', [StudentController::class, 'import']);

/**lấy ra dữ liệu của sinh viên theo lớp */
Route::middleware('auth:sanctum')->get('/classes/{class_id}/teachers/{teacher_id}/students', [StudentController::class, 'getStudents']);

/**lấy ra dữ liệu lớp giảng viên đang dạy */
Route::middleware('auth:sanctum')->get('/get-class-by-major/{selectedMajor}', [ClassController::class, 'getClassOfTeacher']);

/**Tạo thông báo gửi đến sinh viên */
Route::middleware('auth:sanctum')->post('/create-notification', [NotificationController::class, 'createNotification']);

Route::middleware('auth:sanctum')->get('/profiles', [StudentController::class, 'displayInfo']);

Route::middleware('auth:sanctum')->group(function () {
    // Lấy danh sách user
    Route::get('/users', [AdminController::class, 'getUser']);

    // Xóa user
    Route::delete('/delete/{user_id}', [AdminController::class, 'destroy']);

    // Cập nhật user
    Route::put('/update/{id}', [AdminController::class, 'updateUser']);
});

/**Chấm điểm và phản hồi */
Route::get('/grades', [GradeController::class, 'index']);
Route::post('/grades', [GradeController::class, 'store']);
Route::get('/grades/{submission_id}', [GradeController::class, 'show']);

/**Lấy thông tin sinh viên đã nộp */
Route::get('/submissions', [SubmissionController::class, 'indes']);

/**xóa sinh viên */
Route::delete('/delete/{user_id}', [AdminController::class, 'destroy']);

Route::middleware('auth:sanctum')->get('/tvg/get-classes', [ClassController::class, 'getClassByTeacher']);
Route::middleware('auth:sanctum')->post('/create-classes', [ClassController::class, 'insertClassNew']);
Route::middleware('auth:sanctum')->delete('/tvg/classes/{class_id}/teacher/{teacher_id}', [ClassController::class, 'deleteClass']);

/**lấy ra dữ liệu lớp của giảng viên đang dạy */
Route::get('/classes/students/{classsId}', [ClassController::class, 'getStudentsByClass']);

/*lấy ra thông báo mà giảng viển gửi*/
Route::middleware('auth:sanctum')->get('/get-notify', [NotificationController::class, 'getNotify ']);


/**lấy ra lỗi sau khi import ds sinh viên */

Route::middleware('auth:sanctum')->get('/classes/{class_id}/teachers/{teacher_id}/major/{major_id}/student-errors', [ErrorsImportController::class, 'getStudentErrors']);
/**Xóa lỗi */
Route::middleware('auth:sanctum')->delete('/student-errors/classes/{class_id}/teacher/{teacher_id}/major/{major_id}', [ErrorsImportController::class, 'deleteErrorImportStudent']);

Route::get('/drive-auth', [ReportController::class, 'getAuthUrl']);
Route::get('/drive-callback', [ReportController::class, 'handleCallback']);
Route::post('/drive-upload', [ReportController::class, 'uploadReport']);

/**Lấy báo cáo  */
Route::get('/submissions', [AdminController::class, 'getReports']);
Route::middleware('auth:sanctum')->get('/reports', [ReportController::class, 'getReportsByClass']);
Route::get('/submissionsreport', [SubmissionController::class, 'getSubmissionsByReport']);

Route::middleware('auth:sanctum')->get('/get-report', [ReportController::class, 'getReport']);


// đổi mật khẩu 
Route::middleware('auth:sanctum')->post('/change-password', [UserController::class, 'changePassword']);

//  tạo báo cáo
Route::middleware('auth:sanctum')->post('/reports/create', [ReportController::class, 'createReport']);

Route::post('/majors/store', [MajorsController::class, 'store']);  // Thêm thủ công
Route::post('/majors/import', [MajorsController::class, 'import']); // Import Excel

Route::middleware('auth:sanctum')->get('/tvg/get-majors', [MajorsController::class, 'getMajors']);

Route::get('/classes', [ClassController::class, 'getAllClassTeacher']);

Route::get('/teachers', [TeacherController::class, 'getAllTeacher']);

//thống kê cho giảng viên
Route::get('/classes/{classId}/students', [ClassController::class, 'getStudentsByClass']);

//lấy ra ngành theo teacher
Route::middleware('auth:sanctum')->get('/major-by-teacher/{idTeacher}', [MajorsController::class, 'getMajorsByClass']);

//lấy ra ngành theo teacher
Route::middleware('auth:sanctum')->get('/get-majors', [MajorsController::class, 'getAllMajors']);

Route::middleware('auth:sanctum')->get('/get-class-by-major-group/classes/{classId}/majors/{majorId}', [ReportMembersController::class, 'getClassBbyMajorGroup']);
//lấy ra tên report theo lớp
Route::middleware('auth:sanctum')->get('/get-report/majors/{majorId}/classes/{classId}', [ReportController::class, 'getNameReportGroup']);
//lấy ra tên report theo lớp
Route::middleware('auth:sanctum')->post('/groups/import', [ReportMembersController::class, 'importGroups']);
//lấy ra tên report theo lớp
Route::delete('/import-errors/delete-group-errors', [ErrorsImportController::class, 'deleteGroupErrors']);
//Import class 
Route::post('/classes/import', [ClassController::class, 'import']);
//get ra lỗi khi import nhóm
Route::middleware('auth:sanctum')->get('/get-group-errors/majors/{majorId}/classes/{classId}', [ErrorsImportController::class, 'getGroupErrors']);
//get ra thanh vien nhom
Route::middleware('auth:sanctum')->get('/get-members/majors/{majorId}/classes/{classId}/rm_code/{rm_code}', [ReportMembersController::class, 'getMemberDetail']);
//xóa lỗi import ngành
Route::middleware('auth:sanctum')->delete('/pc/import-errors/major', [MajorsController::class, 'deleteErrorMajorsImport']);
//get lỗi import ngành
Route::middleware('auth:sanctum')->get('/pc/get-errors/major', [MajorsController::class, 'getErrorMajorsImport']);
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
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SubmissionFileController;
use App\Http\Controllers\TeacherScoringController;

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
    Route::get('/nhhh/users', [AdminController::class, 'getAllUsers']);

    // Xóa user
    Route::delete('/nhhh/delete/{user_id}', [AdminController::class, 'destroy']);

    // Cập nhật user
    Route::put('/nhhh/update/{user_id}', [AdminController::class, 'updateUser']);
});



Route::middleware('auth:sanctum')->get('/tvg/get-classes', [ClassController::class, 'getClassByTeacher']);
/**tạo lớp học */
Route::middleware('auth:sanctum')->post('/create-classes', [ClassController::class, 'insertClassNew']);
/**xóa lớp học */
Route::middleware('auth:sanctum')->delete('/tvg/classes/{class_id}/teacher/{teacher_id}', [ClassController::class, 'deleteClass']);
/**lấy ra dữ liệu lớp của giảng viên đang dạy */
Route::get('/classes/students/{classsId}', [ClassController::class, 'getStudentsByClass']);
/*lấy ra thông báo mà giảng viển gửi*/
Route::middleware('auth:sanctum')->get('/tvg/get-notify', [NotificationController::class, 'getNotify']);
/**lấy ra lỗi sau khi import ds sinh viên */
Route::middleware('auth:sanctum')->get('/classes/{class_id}/teachers/{teacher_id}/major/{major_id}/student-errors', [ErrorsImportController::class, 'getStudentErrors']);
/**Xóa lỗi */
Route::middleware('auth:sanctum')->delete('/student-errors/classes/{class_id}/teacher/{teacher_id}/major/{major_id}', [ErrorsImportController::class, 'deleteErrorImportStudent']);

Route::get('/drive-auth', [ReportController::class, 'getAuthUrl']);
Route::get('/drive-callback', [ReportController::class, 'handleCallback']);
Route::middleware('auth:sanctum')->post('/drive-upload', [ReportController::class, 'uploadReport']);
/**Lấy báo cáo  */
Route::get('/nhhh/submissions', [AdminController::class, 'getReports']);
Route::middleware('auth:sanctum')->get('/reports', [ReportController::class, 'getReportsByClass']);
Route::get('/submissionsreport', [SubmissionController::class, 'getSubmissionsByReport']);
Route::middleware('auth:sanctum')->get('/get-report', [ReportController::class, 'getReport']);
// đổi mật khẩu 
Route::middleware('auth:sanctum')->post('/change-password', [UserController::class, 'changePassword']);
//  tạo báo cáo
Route::middleware('auth:sanctum')->post('/reports/create', [ReportController::class, 'createReport']);


Route::post('/majors/import', [MajorsController::class, 'import']); // Import Excelf

Route::post('/create-majors', [MajorsController::class, 'store']);  // Thêm thủ công
Route::put('/update-majors/{id}', [MajorsController::class, 'update']);  // Thêm thủ công
Route::post('/majors/import', [MajorsController::class, 'import']); // Import Excel

Route::middleware('auth:sanctum')->get('/tvg/get-majors', [MajorsController::class, 'getMajors']);

Route::get('/classes', [ClassController::class, 'getAllClassTeacher']);
Route::get('/nhhh/classes', [ClassController::class, 'getAllClassTeacher']);
Route::get('/nhhh/admin/classes', [ClassController::class, 'getAllClassAdmin']);
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
//get lấy ra nhóm của mình
Route::middleware('auth:sanctum')->get('/tvg/get-group-member', [ReportMembersController::class, 'getLeaderGroup']);
//get lấy studentId leader

Route::middleware('auth:sanctum')->get('/tvg/get-student-leader/{rm_code}', [ReportMembersController::class, 'getStudentLeader']);

// cả


Route::middleware('auth:sanctum')->post('/majors/store', [MajorsController::class, 'store']);


Route::post('/majors', [MajorsController::class, 'store']);
// ✏️ Cập nhật
Route::put('/majors/update/{id}', [MajorsController::class, 'update']);
// 🗑️ Xóa
Route::delete('/pc/delete-majors/{major_id}', [MajorsController::class, 'destroy']);
Route::middleware('auth:sanctum')->get('/tvg/get-report-by-student', [ReportController::class, 'getReportByStudent']);
//get lấy name major
Route::middleware('auth:sanctum')->get('/tvg/get-nameMajor/{majorId}', [MajorsController::class, 'getNameMajor']);
//get lấy report đã nộp của sinh viên
Route::middleware('auth:sanctum')->get('/tvg/get-submission/submitted', [SubmissionFileController::class, 'checkSubmitted']);


//subject
Route::middleware('auth:sanctum')->group(function () {
    // Tất cả routes subject
    Route::get('/get-subjects', [SubjectController::class, 'indexSubject']);
    Route::get('/get-subjects-majors/{idMajor}', [SubjectController::class, 'getSubjectByMajor']);
    Route::post('/create/subjects', [SubjectController::class, 'storeSubject']);
    Route::put('/update/subjects/{id}', [SubjectController::class, 'updateSubject']);
    Route::get('/get-subjects/{id}', [SubjectController::class, 'getSubject']);
    Route::delete('/subjects/{id}', [SubjectController::class, 'destroySubject']);
    Route::post('/subjects/import', [SubjectController::class, 'import']);

    // Routes import errors
    Route::get('/subjects/import-error', [ErrorsImportController::class, 'importErrSubject']);
    Route::delete('/subject/import-errors', [ErrorsImportController::class, 'clearImportErrorsSubject']);

    // Route teacher
    Route::get('/get-teacher-by-major', [TeacherController::class, 'getAllTeacher']);
});

//get lấy name major
Route::middleware('auth:sanctum')->get('/tvg/get-nameMajor/{majorId}', [MajorsController::class, 'getNameMajor']);

//get lấy name major
Route::middleware('auth:sanctum')->get('/tvg/get-submission/submitted', [SubmissionFileController::class, 'checkSubmitted']);

//import giang vien
Route::post('/nhhh/admin/import-teachers', [TeacherController::class, 'import']);
//import giang vien
Route::delete('/groups/delete-by-class', [ReportMembersController::class, 'deleteByClass']);
//search engine meilisearch subject tvg
Route::get('/search/subjects', [SubjectController::class, 'meilisearchSubjects']);
Route::get('/search/majors', [MajorsController::class, 'meilisearchMajors']);

//lấy ra tất cả báo cáo đã hoàn thành
Route::middleware('auth:sanctum')->get('/get-all-report-graded', [GradeController::class, 'getAllReportGraded']);

//chấm báo cáo giảng viên
Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('teacher')->group(function () {
        Route::get('/subjects', [TeacherScoringController::class, 'getSubjects']);
        Route::get('/classes/{subjectId}', [TeacherScoringController::class, 'getClasses']);
        Route::get('/reports/{classId}', [TeacherScoringController::class, 'getReports']);
        Route::get('/submissions/{reportId}', [TeacherScoringController::class, 'getSubmissions']);
    });
    Route::post('/grades', [TeacherScoringController::class, 'storeGrade']);
});

Route::middleware('auth:sanctum')->get('/getSubject-major-class-teacher/{majorId}', [SubjectController::class, 'getSubjectByMajorByTeacher']);
Route::middleware('auth:sanctum')->get('/classes-by-subject/{majorId}/{subjectId}', [SubjectController::class, 'getSubjectByMajorByClass']);
Route::middleware('auth:sanctum')->get('/years-by-class/{classId}', [ClassController::class, 'getYearsByClass']);

Route::middleware('auth:sanctum')->get(
    '/reports-filter/{selectedMajor}/{selectedSubject}/{selectedClass}/{selectedYear}',
    [ReportController::class, 'getReportsByMajorClassSubjectTeacher']
);

Route::middleware('auth:sanctum')->get(
    '/submission-filter/{selectedMajor}/{selectedSubject}/{selectedClass}/{selectedYear}/{selectedReportId}',
    [SubmissionController::class, 'getSubmissionsByMajorClassSubjectTeacher']
);

Route::middleware('auth:sanctum')->post('/grades/update', [GradeController::class, 'gradingAndFeedBack']);

Route::middleware('auth:sanctum')->get('/get-teacher-name-by-submission/{submissionId}', [TeacherController::class, 'getNameTeacherBySubmission']);

Route::middleware('auth:sanctum')->get('/get-name-group-by-student', [ReportMembersController::class, 'getNameGroupByStudent']);
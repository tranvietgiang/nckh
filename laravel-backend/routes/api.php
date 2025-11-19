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

/*
|--------------------------------------------------------------------------
| AUTH ROUTES
|--------------------------------------------------------------------------
*/

// Xác thực người dùng
Route::post('/auth/check-login', [AuthController::class, 'authRole']);


/*
|--------------------------------------------------------------------------
| STUDENT IMPORT & CLASS ACCESS
|--------------------------------------------------------------------------
*/

// Giảng viên import ds sinh viên vào db
Route::middleware('auth:sanctum')->post('/students/import', [StudentController::class, 'import']);

// Lấy dữ liệu sinh viên theo lớp
Route::middleware('auth:sanctum')->get('/classes/{class_id}/teachers/{teacher_id}/students', [StudentController::class, 'getStudents']);

// Lấy lớp GV đang dạy
Route::middleware('auth:sanctum')->get('/get-class-by-major/{selectedMajor}', [ClassController::class, 'getClassOfTeacher']);


/*
|--------------------------------------------------------------------------
| NOTIFICATION
|--------------------------------------------------------------------------
*/

// Tạo thông báo
Route::middleware('auth:sanctum')->post('/create-notification', [NotificationController::class, 'createNotification']);

// Lấy thông tin profile
Route::middleware('auth:sanctum')->get('/profiles', [StudentController::class, 'displayInfo']);


/*
|--------------------------------------------------------------------------
| ADMIN USER MANAGEMENT
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    // Lấy danh sách user
    Route::get('/nhhh/users', [AdminController::class, 'getAllUsers']);

    // Xóa user
    Route::delete('/nhhh/delete/{user_id}', [AdminController::class, 'destroy']);

    // Cập nhật user
    Route::put('/nhhh/update/{user_id}', [AdminController::class, 'updateUser']);
});


/*
|--------------------------------------------------------------------------
| SUBMISSIONS / REPORT YEAR FILTER
|--------------------------------------------------------------------------
*/

// Lấy thông tin sinh viên đã nộp
Route::get('/submissions', [SubmissionController::class, 'indes']);

// Tìm báo cáo theo năm
Route::middleware('auth:sanctum')->group(function () {
    Route::get('submissionsreport', [SubmissionController::class, 'getSubmissionsForReport']);
});

// Flow 2: API khi chỉ chọn năm
Route::middleware('auth:sanctum')->prefix('nhhh')->group(function () {
    Route::get('submission/reports', [SubmissionController::class, 'getReportsByYear']);
});


/*
|--------------------------------------------------------------------------
| CLASS MANAGEMENT
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->get('/tvg/get-classes', [ClassController::class, 'getClassByTeacher']);
Route::middleware('auth:sanctum')->post('/create-classes', [ClassController::class, 'insertClassNew']);
Route::middleware('auth:sanctum')->delete('/tvg/classes/{class_id}/teacher/{teacher_id}', [ClassController::class, 'deleteClass']);
Route::get('/classes/students/{classsId}', [ClassController::class, 'getStudentsByClass']);
Route::middleware('auth:sanctum')->get('/tvg/get-notify', [NotificationController::class, 'getNotify']);


/*
|--------------------------------------------------------------------------
| IMPORT ERRORS
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->get('/classes/{class_id}/teachers/{teacher_id}/major/{major_id}/student-errors', [ErrorsImportController::class, 'getStudentErrors']);
Route::middleware('auth:sanctum')->delete('/student-errors/classes/{class_id}/teacher/{teacher_id}/major/{major_id}', [ErrorsImportController::class, 'deleteErrorImportStudent']);


/*
|--------------------------------------------------------------------------
| GOOGLE DRIVE INTEGRATION
|--------------------------------------------------------------------------
*/

Route::get('/drive-auth', [ReportController::class, 'getAuthUrl']);
Route::get('/drive-callback', [ReportController::class, 'handleCallback']);
Route::middleware('auth:sanctum')->post('/drive-upload', [ReportController::class, 'uploadReport']);


/*
|--------------------------------------------------------------------------
| REPORTS
|--------------------------------------------------------------------------
*/

Route::get('/nhhh/submissions', [AdminController::class, 'getReports']);
Route::middleware('auth:sanctum')->get('/reports', [ReportController::class, 'getReportsByClass']);
Route::get('/submissionsreport', [SubmissionController::class, 'getSubmissionsByReport']);
Route::middleware('auth:sanctum')->get('/get-report', [ReportController::class, 'getReport']);
Route::middleware('auth:sanctum')->post('/change-password', [UserController::class, 'changePassword']);
Route::middleware('auth:sanctum')->post('/reports/create', [ReportController::class, 'createReport']);


/*
|--------------------------------------------------------------------------
| MAJOR MANAGEMENT
|--------------------------------------------------------------------------
*/

Route::post('/majors/import', [MajorsController::class, 'import']);
Route::post('/create-majors', [MajorsController::class, 'store']);
Route::put('/update-majors/{id}', [MajorsController::class, 'update']);
Route::post('/majors/import', [MajorsController::class, 'import']);
Route::middleware('auth:sanctum')->get('/tvg/get-majors', [MajorsController::class, 'getMajors']);


/*
|--------------------------------------------------------------------------
| CLASS LISTINGS
|--------------------------------------------------------------------------
*/

Route::get('/classes', [ClassController::class, 'getAllClassTeacher']);
Route::get('/nhhh/classes', [ClassController::class, 'getAllClassTeacher']);
Route::get('/nhhh/admin/classes', [ClassController::class, 'getAllClassAdmin']);
Route::get('/teachers', [TeacherController::class, 'getAllTeacher']);


/*
|--------------------------------------------------------------------------
| SUBJECT & CLASS RELATIONS
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->get('/major-by-teacher/{idTeacher}', [MajorsController::class, 'getMajorsByClass']);
Route::middleware('auth:sanctum')->get('/get-majors', [MajorsController::class, 'getAllMajors']);
Route::middleware('auth:sanctum')->get('/get-class-by-major-group/classes/{classId}/majors/{majorId}', [ReportMembersController::class, 'getClassBbyMajorGroup']);
Route::middleware('auth:sanctum')->get('/get-report/majors/{majorId}/classes/{classId}', [ReportController::class, 'getNameReportGroup']);


/*
|--------------------------------------------------------------------------
| GROUP IMPORT & ERRORS
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->post('/groups/import', [ReportMembersController::class, 'importGroups']);
Route::delete('/import-errors/delete-group-errors', [ErrorsImportController::class, 'deleteGroupErrors']);
Route::post('/classes/import', [ClassController::class, 'import']);
Route::middleware('auth:sanctum')->get('/get-group-errors/majors/{majorId}/classes/{classId}', [ErrorsImportController::class, 'getGroupErrors']);


/*
|--------------------------------------------------------------------------
| GROUP MEMBERS
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->get('/get-members/majors/{majorId}/classes/{classId}/rm_code/{rm_code}', [ReportMembersController::class, 'getMemberDetail']);
Route::middleware('auth:sanctum')->delete('/pc/import-errors/major', [MajorsController::class, 'deleteErrorMajorsImport']);
Route::middleware('auth:sanctum')->get('/pc/get-errors/major', [MajorsController::class, 'getErrorMajorsImport']);
Route::middleware('auth:sanctum')->get('/tvg/get-group-member', [ReportMembersController::class, 'getLeaderGroup']);
Route::middleware('auth:sanctum')->get('/tvg/get-student-leader/{rm_code}', [ReportMembersController::class, 'getStudentLeader']);


/*
|--------------------------------------------------------------------------
| SUBJECT ROUTES
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/get-subjects', [SubjectController::class, 'indexSubject']);
    Route::get('/get-subjects-majors/{idMajor}', [SubjectController::class, 'getSubjectByMajor']);
    Route::post('/create/subjects', [SubjectController::class, 'storeSubject']);
    Route::put('/update/subjects/{id}', [SubjectController::class, 'updateSubject']);
    Route::get('/get-subjects/{id}', [SubjectController::class, 'getSubject']);
    Route::delete('/subjects/{id}', [SubjectController::class, 'destroySubject']);
    Route::post('/subjects/import', [SubjectController::class, 'import']);
    Route::get('/subjects/import-error', [ErrorsImportController::class, 'importErrSubject']);
    Route::delete('/subject/import-errors', [ErrorsImportController::class, 'clearImportErrorsSubject']);
    Route::get('/get-teacher-by-major', [TeacherController::class, 'getAllTeacher']);
});


/*
|--------------------------------------------------------------------------
| STUDENT REPORT & SUBMISSIONS
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->get('/tvg/get-report-by-student', [ReportController::class, 'getReportByStudent']);
Route::middleware('auth:sanctum')->get('/tvg/get-nameMajor/{majorId}', [MajorsController::class, 'getNameMajor']);
Route::middleware('auth:sanctum')->get('/tvg/get-submission/submitted', [SubmissionFileController::class, 'checkSubmitted']);


/*
|--------------------------------------------------------------------------
| IMPORT TEACHERS
|--------------------------------------------------------------------------
*/

Route::post('/nhhh/admin/import-teachers', [TeacherController::class, 'import']);
Route::delete('/groups/delete-by-class', [ReportMembersController::class, 'deleteByClass']);


/*
|--------------------------------------------------------------------------
| SEARCH ENGINE
|--------------------------------------------------------------------------
*/

Route::get('/search/subjects', [SubjectController::class, 'meilisearchSubjects']);
Route::get('/search/majors', [MajorsController::class, 'meilisearchMajors']);
Route::get('/search/users', [AdminController::class, 'searchUsers']);


/*
|--------------------------------------------------------------------------
| REPORT GRADING
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->get('/get-all-report-graded', [GradeController::class, 'getAllReportGraded']);

Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('teacher')->group(function () {
        Route::get('/subjects', [TeacherScoringController::class, 'getSubjects']);
        Route::get('/classes/{subjectId}', [TeacherScoringController::class, 'getClasses']);
        Route::get('/reports/{classId}', [TeacherScoringController::class, 'getReports']);
        Route::get('/submissions/{reportId}', [TeacherScoringController::class, 'getSubmissions']);
    });
    Route::post('/grades', [TeacherScoringController::class, 'storeGrade']);
});


/*
|--------------------------------------------------------------------------
| SUBJECT / CLASS MAPPING FOR TEACHERS
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->get('/getSubject-major-class-teacher/{majorId}', [SubjectController::class, 'getSubjectByMajorByTeacher']);
Route::middleware('auth:sanctum')->get('/classes-by-subject/{majorId}/{subjectId}', [SubjectController::class, 'getSubjectByMajorByClass']);
Route::middleware('auth:sanctum')->get('/years-by-class/{classId}', [ClassController::class, 'getYearsByClass']);


/*
|--------------------------------------------------------------------------
| REPORT FILTER
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->get('/reports-filter/{selectedMajor}/{selectedSubject}/{selectedClass}/{selectedYear}', [ReportController::class, 'getReportsByMajorClassSubjectTeacher']);

Route::middleware('auth:sanctum')->get('/submission-filter/{selectedMajor}/{selectedSubject}/{selectedClass}/{selectedYear}/{selectedReportId}', [SubmissionController::class, 'getSubmissionsByMajorClassSubjectTeacher']);


/*
|--------------------------------------------------------------------------
| GRADING UPDATE
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->post('/grades/update', [GradeController::class, 'gradingAndFeedBack']);


/*
|--------------------------------------------------------------------------
| TEACHER REPORT MANAGEMENT
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->get('/teacher/reports', [ReportController::class, 'getTeacherReports']);
Route::middleware('auth:sanctum')->get('/teacher/reports/{id}', [ReportController::class, 'getReportDetail']);
Route::middleware('auth:sanctum')->put('/teacher/reports/{id}', [ReportController::class, 'updateReport']);
Route::middleware('auth:sanctum')->get('/get-name-group-by-student', [ReportMembersController::class, 'getNameGroupByStudent']);


/*
|--------------------------------------------------------------------------
| COUNT APIs (student)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->get('/get-count-classes-by-student', [ClassController::class, 'getCountClassStudentLearn']);
Route::middleware('auth:sanctum')->get('/tvg/get-count-report-by-student', [ReportController::class, 'getCountReportNotCompleteByStudent']);
Route::middleware('auth:sanctum')->get('/tvg/get-count-report-complete-by-student', [ReportController::class, 'getCountReportCompleteByStudent']);
Route::middleware('auth:sanctum')->get('/tvg/get-count-report-by-student-length', [ReportController::class, 'getCountReportCompleteByStudentLength']);
Route::middleware('auth:sanctum')->get('/tvg/get-count-classes-teaching-by-teacher', [ClassController::class, 'getCountClassesTeachingByTeacher']);

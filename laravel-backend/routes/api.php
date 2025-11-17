<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\{
    AuthController,
    StudentController,
    GradeController,
    AdminController,
    NotificationController,
    SubmissionController,
    ClassController,
    ErrorsImportController,
    ReportController,
    SimpleDriveController,
    MajorsController,
    ReportMembersController,
    SubjectController,
    TeacherController,
    SubmissionFileController,
    TeacherScoringController,
    UserController
};


/*
|--------------------------------------------------------------------------
| AUTH ROUTES
|--------------------------------------------------------------------------
*/

// Xác thực người dùng
Route::post('/auth/check-login', [AuthController::class, 'authRole']);



/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES (không cần sanctum)
|--------------------------------------------------------------------------
*/

// Import ngành (public)
Route::post('/majors/import', [MajorsController::class, 'import']);
Route::post('/majors', [MajorsController::class, 'store']);
Route::put('/majors/update/{id}', [MajorsController::class, 'update']);

// Google Drive liên kết
Route::get('/drive-auth', [ReportController::class, 'getAuthUrl']);
Route::get('/drive-callback', [ReportController::class, 'handleCallback']);

// Submissions báo cáo
Route::get('/submissionsreport', [SubmissionController::class, 'getSubmissionsByReport']);

// Lấy sinh viên theo lớp
Route::get('/classes/students/{classsId}', [ClassController::class, 'getStudentsByClass']);

// Lấy giảng viên
Route::get('/teachers', [TeacherController::class, 'getAllTeacher']);

// Admin lấy submissions
Route::get('/nhhh/submissions', [AdminController::class, 'getReports']);

// Search Engine
Route::get('/search/subjects', [SubjectController::class, 'meilisearchSubjects']);
Route::get('/search/majors', [MajorsController::class, 'meilisearchMajors']);



/*
|--------------------------------------------------------------------------
| PROTECTED ROUTES (có sanctum)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {


    /*
    |--------------------------------------------------------------------------
    | PROFILE / STUDENT
    |--------------------------------------------------------------------------
    */

    Route::get('/profiles', [StudentController::class, 'displayInfo']);



    /*
    |--------------------------------------------------------------------------
    | IMPORT / ERROR LOG
    |--------------------------------------------------------------------------
    */

    // Import sinh viên
    Route::post('/students/import', [StudentController::class, 'import']);

    // Lỗi import sinh viên
    Route::get('/classes/{class_id}/teachers/{teacher_id}/major/{major_id}/student-errors', [ErrorsImportController::class, 'getStudentErrors']);
    Route::delete('/student-errors/classes/{class_id}/teacher/{teacher_id}/major/{major_id}', [ErrorsImportController::class, 'deleteErrorImportStudent']);

    // Lỗi import nhóm
    Route::get('/get-group-errors/majors/{majorId}/classes/{classId}', [ErrorsImportController::class, 'getGroupErrors']);
    Route::delete('/import-errors/delete-group-errors', [ErrorsImportController::class, 'deleteGroupErrors']);

    // Lỗi import ngành
    Route::delete('/pc/import-errors/major', [MajorsController::class, 'deleteErrorMajorsImport']);
    Route::get('/pc/get-errors/major', [MajorsController::class, 'getErrorMajorsImport']);



    /*
    |--------------------------------------------------------------------------
    | NOTIFICATION
    |--------------------------------------------------------------------------
    */

    // Tạo và lấy thông báo
    Route::post('/create-notification', [NotificationController::class, 'createNotification']);
    Route::get('/tvg/get-notify', [NotificationController::class, 'getNotify']);



    /*
    |--------------------------------------------------------------------------
    | CLASS / MAJOR / SUBJECT
    |--------------------------------------------------------------------------
    */

    // Lớp học
    Route::get('/get-class-by-major/{selectedMajor}', [ClassController::class, 'getClassOfTeacher']);
    Route::get('/tvg/get-classes', [ClassController::class, 'getClassByTeacher']);
    Route::post('/create-classes', [ClassController::class, 'insertClassNew']);
    Route::delete('/tvg/classes/{class_id}/teacher/{teacher_id}', [ClassController::class, 'deleteClass']);

    // Major
    Route::get('/tvg/get-majors', [MajorsController::class, 'getMajors']);
    Route::get('/major-by-teacher/{idTeacher}', [MajorsController::class, 'getMajorsByClass']);
    Route::get('/get-majors', [MajorsController::class, 'getAllMajors']);

    // Subject
    Route::get('/get-subjects', [SubjectController::class, 'indexSubject']);
    Route::get('/get-subjects-majors/{idMajor}', [SubjectController::class, 'getSubjectByMajor']);
    Route::post('/create/subjects', [SubjectController::class, 'storeSubject']);
    Route::put('/update/subjects/{id}', [SubjectController::class, 'updateSubject']);
    Route::get('/get-subjects/{id}', [SubjectController::class, 'getSubject']);
    Route::delete('/subjects/{id}', [SubjectController::class, 'destroySubject']);
    Route::post('/subjects/import', [SubjectController::class, 'import']);

    // Mapping major/subject/class
    Route::get('/get-teacher-by-major', [TeacherController::class, 'getAllTeacher']);
    Route::get('/getSubject-major-class-teacher/{majorId}', [SubjectController::class, 'getSubjectByMajorByTeacher']);
    Route::get('/classes-by-subject/{majorId}/{subjectId}', [SubjectController::class, 'getSubjectByMajorByClass']);
    Route::get('/years-by-class/{classId}', [ClassController::class, 'getYearsByClass']);



    /*
    |--------------------------------------------------------------------------
    | REPORT / GROUP
    |--------------------------------------------------------------------------
    */

    // Report
    Route::post('/drive-upload', [ReportController::class, 'uploadReport']);
    Route::get('/reports', [ReportController::class, 'getReportsByClass']);
    Route::post('/reports/create', [ReportController::class, 'createReport']);
    Route::get('/get-report', [ReportController::class, 'getReport']);
    Route::get('/get-report/majors/{majorId}/classes/{classId}', [ReportController::class, 'getNameReportGroup']);

    // Group
    Route::post('/groups/import', [ReportMembersController::class, 'importGroups']);
    Route::get('/get-members/majors/{majorId}/classes/{classId}/rm_code/{rm_code}', [ReportMembersController::class, 'getMemberDetail']);
    Route::get('/tvg/get-group-member', [ReportMembersController::class, 'getLeaderGroup']);
    Route::get('/tvg/get-student-leader/{rm_code}', [ReportMembersController::class, 'getStudentLeader']);
    Route::delete('/groups/delete-by-class', [ReportMembersController::class, 'deleteByClass']);

    // Student report
    Route::get('/tvg/get-report-by-student', [ReportController::class, 'getReportByStudent']);
    Route::get('/tvg/get-nameMajor/{majorId}', [MajorsController::class, 'getNameMajor']);

    // Submissions
    Route::get('/tvg/get-submission/submitted', [SubmissionFileController::class, 'checkSubmitted']);



    /*
    |--------------------------------------------------------------------------
    | COUNT APIs (student)
    |--------------------------------------------------------------------------
    */

    Route::get('/get-count-classes-by-student', [ClassController::class, 'getCountClassStudentLearn']);
    Route::get('/tvg/get-count-report-by-student', [ReportController::class, 'getCountReportNotCompleteByStudent']);
    Route::get('/tvg/get-count-report-complete-by-student', [ReportController::class, 'getCountReportCompleteByStudent']);
    Route::get('/tvg/get-count-report-by-student-length', [ReportController::class, 'getCountReportCompleteByStudentLength']);



    /*
    |--------------------------------------------------------------------------
    | SUBMISSIONS FILTER
    |--------------------------------------------------------------------------
    */

    Route::get('/reports-filter/{selectedMajor}/{selectedSubject}/{selectedClass}/{selectedYear}', [ReportController::class, 'getReportsByMajorClassSubjectTeacher']);
    Route::get('/submission-filter/{selectedMajor}/{selectedSubject}/{selectedClass}/{selectedYear}/{selectedReportId}', [SubmissionController::class, 'getSubmissionsByMajorClassSubjectTeacher']);



    /*
    |--------------------------------------------------------------------------
    | TEACHER GRADING
    |--------------------------------------------------------------------------
    */

    Route::prefix('teacher')->group(function () {
        Route::get('/subjects', [TeacherScoringController::class, 'getSubjects']);
        Route::get('/classes/{subjectId}', [TeacherScoringController::class, 'getClasses']);
        Route::get('/reports/{classId}', [TeacherScoringController::class, 'getReports']);
        Route::get('/submissions/{reportId}', [TeacherScoringController::class, 'getSubmissions']);
    });

    Route::post('/grades', [TeacherScoringController::class, 'storeGrade']);
    Route::post('/grades/update', [GradeController::class, 'gradingAndFeedBack']);

    Route::get('/teacher/reports', [ReportController::class, 'getTeacherReports']);
    Route::get('/teacher/reports/{id}', [ReportController::class, 'getReportDetail']);
    Route::put('/teacher/reports/{id}', [ReportController::class, 'updateReport']);

    Route::get('/get-name-group-by-student', [ReportMembersController::class, 'getNameGroupByStudent']);
});
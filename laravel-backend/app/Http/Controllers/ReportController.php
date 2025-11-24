<?php

namespace App\Http\Controllers;

use App\Helpers\AuthHelper;
use App\Models\Classe;
use App\Models\Grade;
use Illuminate\Http\Request;
use App\Models\Report;
use Illuminate\Support\Facades\Auth;      // ✅ đúng cho Auth facade
use Illuminate\Support\Facades\DB;
use App\Models\ReportMember;
use App\Models\Submission;
use App\Models\submission_file;
use App\Models\User;
use App\Models\user_profile;
use Carbon\Carbon;
use Google\Client;
use Google\Service\Drive;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ReportController extends Controller
{
    /** 
     *  Bước đầu: Lấy URL xác thực Google (chạy 1 lần duy nhất)
     */
    public function getAuthUrl()
    {
        $client = new Client();
        $client->setClientId(env('GOOGLE_CLIENT_ID'));
        $client->setClientSecret(env('GOOGLE_CLIENT_SECRET'));
        $client->setRedirectUri(env('GOOGLE_REDIRECT_URI'));
        $client->addScope(Drive::DRIVE_FILE);
        $client->setAccessType('offline');
        $client->setPrompt('consent');

        return response()->json([
            'auth_url' => $client->createAuthUrl()
        ]);
    }

    /** 
     *  Callback sau khi user bấm “Cho phép” → lưu token.json
     */
    public function handleCallback(Request $request)
    {
        try {
            $code = $request->get('code');

            if (!$code) {
                return response()->json(['error' => 'Thiếu mã code!'], 400);
            }

            $client = new Client();
            $client->setClientId(env('GOOGLE_CLIENT_ID'));
            $client->setClientSecret(env('GOOGLE_CLIENT_SECRET'));
            $client->setRedirectUri(env('GOOGLE_REDIRECT_URI'));

            $token = $client->fetchAccessTokenWithAuthCode($code);

            if (isset($token['error'])) {
                return response()->json([
                    'error' => $token['error_description'] ?? 'Không thể lấy token!'
                ], 400);
            }

            file_put_contents(storage_path('app/google/token.json'), json_encode($token));

            return response()->json([
                'success' => true,
                'message' => '✅ Đã xác thực Google Drive thành công!',
                'token_saved' => 'storage/app/google/token.json'
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => '❌ Lỗi callback: ' . $e->getMessage()], 500);
        }
    }


    private function getGoogleClient()
    {
        $client = new \Google\Client();
        $client->setClientId(env('GOOGLE_CLIENT_ID'));
        $client->setClientSecret(env('GOOGLE_CLIENT_SECRET'));
        $client->setRedirectUri(env('GOOGLE_REDIRECT_URI'));
        $client->addScope(\Google\Service\Drive::DRIVE_FILE);
        $client->setAccessType('offline');
        $client->setPrompt('consent');

        $tokenPath = storage_path('app/google/token.json'); // ✅ trùng với handleCallback

        if (!file_exists($tokenPath)) {
            throw new \Exception("❌ Token chưa tồn tại. Hãy xác thực Google lại.");
        }

        $accessToken = json_decode(file_get_contents($tokenPath), true);
        $client->setAccessToken($accessToken);

        // 🔄 Refresh token nếu hết hạn
        // if ($client->isAccessTokenExpired()) {
        //     try {
        //         if (!empty($accessToken['refresh_token'])) {
        //             $newToken = $client->fetchAccessTokenWithRefreshToken($accessToken['refresh_token']);

        //             // ⚠️ Nếu Google trả lỗi
        //             if (isset($newToken['error'])) {
        //                 // Xóa token hỏng, yêu cầu xác thực lại
        //                 unlink($tokenPath);
        //                 throw new \Exception("⚠️ Refresh token đã hết hạn hoặc bị thu hồi. Vui lòng xác thực lại Google Drive!");
        //             }

        //             // ✅ Gộp refresh token cũ (vì Google thường không trả lại)
        //             $updatedToken = array_merge($accessToken, $client->getAccessToken());

        //             // ✅ Lưu lại token mới
        //             file_put_contents($tokenPath, json_encode($updatedToken));
        //         } else {
        //             throw new \Exception("❌ Refresh token không tồn tại. Vui lòng xác thực lại!");
        //         }
        //     } catch (\Exception $e) {
        //         if (file_exists($tokenPath)) unlink($tokenPath);
        //         throw $e;
        //     }
        // }

        // code không mất token
        if ($client->isAccessTokenExpired()) {

            // Refresh token cũ còn tồn tại
            if (!empty($accessToken['refresh_token'])) {

                // Lấy token mới
                $client->fetchAccessTokenWithRefreshToken($accessToken['refresh_token']);

                // Access token mới
                $newToken = $client->getAccessToken();

                // GIỮ refresh token cũ lại
                $newToken['refresh_token'] = $accessToken['refresh_token'];

                // Lưu token
                file_put_contents($tokenPath, json_encode($newToken));
            }
        }


        return $client;
    }

    // Tạo hoặc lấy folder
    private function getOrCreateFolder($driveService, $folderName, $parentId = null)
    {
        $query = "mimeType='application/vnd.google-apps.folder' and name='$folderName'";
        if ($parentId) {
            $query .= " and '$parentId' in parents";
        }

        $folders = $driveService->files->listFiles([
            'q' => $query,
            'fields' => 'files(id, name)'
        ])->getFiles();

        if (count($folders) > 0) {
            return $folders[0]->id;
        }

        $folderMetadata = new Drive\DriveFile([
            'name' => $folderName,
            'mimeType' => 'application/vnd.google-apps.folder',
            'parents' => $parentId ? [$parentId] : []
        ]);

        $folder = $driveService->files->create($folderMetadata, ['fields' => 'id']);
        return $folder->id;
    }

    public function uploadReport(Request $request)
    {
        try {

            $userId = AuthHelper::isLogin();

            $validator = Validator::make($request->all(), [
                'file' => 'required|file|max:10240|mimes:pdf,doc,docx,jpg,jpeg,png',
                'email' => 'required|email',
                'report_id' => 'required|integer',
                'teacher_id' => 'required|string|max:15'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message_error' => 'Vui lòng kiểm tra lại thông tin!',
                    'errors' => $validator->errors()
                ], 422);
            }

            $file = $request->file('file');
            $email = $request->input('email');
            $reportId = $request->input('report_id');
            $teacherId = $request->input('teacher_id');

            // Kiểm tra từng trường hợp và trả về lỗi ngay khi phát hiện
            if (!User::where('user_id', $teacherId)->where('role', 'teacher')->exists()) {
                return response()->json(['message_error' => 'Giảng viên không tồn tại!'], 400);
            }

            $report = Report::where('report_id', $reportId)->where('teacher_id', $teacherId)->first();
            if (!$report) {
                return response()->json(['message_error' => 'Báo cáo không tồn tại!'], 400);
            }

            // 🔍 Kiểm tra thời gian nộp báo cáo
            $now = now();

            // Chưa đến ngày nộp
            if ($report->start_date && $now->lt($report->start_date)) {
                return response()->json([
                    'message_error' => 'Chưa đến thời gian bắt đầu nộp báo cáo!'
                ], 400);
            }

            // Đã hết hạn nộp
            if ($report->end_date && $now->gt($report->end_date)) {
                return response()->json([
                    'message_error' => 'Đã quá hạn nộp báo cáo!'
                ], 400);
            }


            if ($report->end_date && now()->gt($report->end_date)) {
                return response()->json(['message_error' => 'Đã quá hạn nộp báo cáo!'], 400);
            }

            if (!User::where('email', $email)->where('user_id', $userId)->where('role', 'student')->exists()) {
                return response()->json(['message_error' => 'Email sinh viên không tồn tại!'], 400);
            }

            if ($report->status === 'expired') {
                return response()->json(['message_error' => 'Báo cáo đã hết hạn nộp!'], 400);
            }

            if ($report->status === 'graded') {
                return response()->json(['message_error' => 'Báo cáo đã được chấm điểm!'], 400);
            }

            if (!$file->isValid()) {
                return response()->json(['message_error' => 'File upload bị lỗi!'], 400);
            }

            // kiểm tra có phải là nhóm trưởng nộp ko
            $checkLeaderSubmit = DB::table('report_members')
                ->join('reports', 'report_members.report_id', '=', 'reports.report_id')
                ->join('users', 'users.user_id', '=', 'report_members.student_id') // map đúng user
                ->where('users.user_id', $userId)           // chính user đang đăng nhập
                ->where('users.role', 'student')
                ->where('reports.report_id', $reportId)     // ràng buộc đúng report
                ->where('reports.teacher_id', $teacherId)   // ràng buộc đúng GV
                ->where('report_members.report_m_role', 'NT')
                ->first();


            if (!$checkLeaderSubmit) {
                return response()->json(['message_error' => 'Sinh viên này không có trong lớp hoặc không phải là nhóm trưởng'], 400);
            }

            $client = $this->getGoogleClient();
            $driveService = new \Google\Service\Drive($client);

            // 🗂️ Tạo thư mục sinh viên
            $rootFolderId = $this->getOrCreateFolder($driveService, 'StudentReports');
            $studentFolderId = $this->getOrCreateFolder($driveService, $email, $rootFolderId);

            // ✅ MIME type chính xác
            $ext = strtolower($file->getClientOriginalExtension());
            $mimeMap = [
                'pdf'  => 'application/pdf',
                'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'doc'  => 'application/msword',
                'zip'  => 'application/zip',
            ];
            $mimeType = $mimeMap[$ext] ?? $file->getMimeType() ?? 'application/octet-stream';

            // 🚀 Upload trực tiếp stream lên Google Drive
            $fileMetadata = new \Google\Service\Drive\DriveFile([
                'name' => 'BaoCao_' . time() . '_' . $file->getClientOriginalName(),
                'parents' => [$studentFolderId],
            ]);

            // dùng stream đọc dữ liệu file
            $stream = fopen($file->getRealPath(), 'r');

            $uploadedFile = $driveService->files->create($fileMetadata, [
                'data' => stream_get_contents($stream),
                'mimeType' => $mimeType,
                'uploadType' => 'resumable', // hỗ trợ file lớn
                'fields' => 'id, name, webViewLink, webContentLink'
            ]);

            fclose($stream);

            // 🌍 Cấp quyền xem công khai
            $driveService->permissions->create($uploadedFile->id, new \Google\Service\Drive\Permission([
                'type' => 'anyone',
                'role' => 'reader',
            ]));

            // $studentId = 1;
            $studentId = $checkLeaderSubmit->user_id;
            $checkSubmission = Submission::where("student_id", $studentId)->where('report_id', $reportId)->first();

            $submission = Submission::create([
                'report_id' => $reportId,
                'student_id' => $studentId,
                'version' => $checkSubmission ? $checkSubmission->version + 1 : 1,
                'status' => "submitted",
                'submission_time' => now(),
            ]);

            submission_file::create([
                'submission_id' => $submission->submission_id,
                'file_name' => $uploadedFile->name,
                'file_path' => $uploadedFile->webViewLink,
                'file_size' => $file->getSize(),
                'file_type' => $file->getClientOriginalExtension(),
            ]);

            Grade::create([
                'submission_id' => $submission->submission_id,
                'teacher_id' => $teacherId,
                'score' => 0,
                'feedback' => null,
                "graded_at" => null,
            ]);

            return response()->json([
                'success' => true,
                'message' => '✅ Upload trực tiếp Google Drive thành công!',
                'file_name' => $uploadedFile->name,
                'drive_url' => $uploadedFile->webViewLink,
                'download_url' => $uploadedFile->webContentLink,
            ]);
        } catch (\Exception $e) {
            Log::error('❌ Drive upload error: ' . $e->getMessage());
            return response()->json(['error' => '❌ Lỗi upload: ' . $e->getMessage()], 500);
        }
    }

    public function getReportsByClass(Request $request)
    {
        $classId = $request->query('class_id');

        $reports = Report::where('class_id', $classId)
            ->withCount('submissions') // số lượng bài nộp
            ->get(['id as report_id', 'name as report_name']); // đổi theo tên field bạn muốn trả

        return response()->json([
            'data' => $reports
        ]);
    }

    public function getReport()
    {
        $getReport = Report::select("reports.*", "classes.*")
            ->join("classes", "reports.class_id", "=", "classes.class_id")
            ->where("reports.status", "submitted")->get();

        return response()->json($getReport);
    }

    public function getReportByStudent()
    {
        $studentId = AuthHelper::isLogin();

        $groups = DB::table('report_members')
            ->join('reports', 'report_members.report_id', '=', 'reports.report_id')
            ->join('classes', 'reports.class_id', '=', 'classes.class_id')
            ->join('subjects', 'classes.subject_id', '=', 'subjects.subject_id')
            ->join('user_profiles', 'reports.teacher_id', '=', 'user_profiles.user_id')
            ->select(
                'report_members.rm_code',
                'report_members.rm_name',
                'report_members.report_m_role',

                'reports.report_id',
                'reports.report_name',
                'reports.teacher_id',
                'reports.start_date',
                'reports.end_date',

                'classes.class_id',
                'classes.class_name',

                'subjects.subject_name',
                'user_profiles.fullname',
            )
            ->where('report_members.student_id', $studentId)
            ->distinct()
            ->orderBy('reports.report_id', 'asc')
            ->get();

        if ($groups->isEmpty()) {
            return response()->json([
                'message' => 'Sinh viên này chưa có nhóm hoặc chưa tham gia báo cáo nào.'
            ], 404);
        }

        return response()->json($groups, 200);
    }

    public function getCountReportNotCompleteByStudent()
    {
        $studentId = AuthHelper::isLogin();

        $count = DB::table('report_members')
            ->join('reports', 'report_members.report_id', '=', 'reports.report_id')
            ->join('classes', 'reports.class_id', '=', 'classes.class_id')
            ->join('subjects', 'classes.subject_id', '=', 'subjects.subject_id')
            ->join('user_profiles', 'reports.teacher_id', '=', 'user_profiles.user_id')
            ->LeftJoin('submissions', 'reports.report_id', '=', 'submissions.report_id')
            ->LeftJoin("grades", "submissions.submission_id", "=", "grades.submission_id")
            ->select(
                'report_members.student_id',
                'reports.report_id',
                'grades.score',
                'grades.graded_at'
            )
            ->where('report_members.student_id', $studentId)
            ->whereNull("grades.score")
            ->whereNull("grades.graded_at")
            ->distinct('reports.report_id')
            ->count('reports.report_id');



        if ($count === 0) {
            return response()->json(0);
        }


        return response()->json(
            $count,
            200
        );
    }

    public function getCountReportCompleteByStudentLength()
    {
        $studentId = AuthHelper::isLogin();


        $length = DB::table('report_members')
            ->join('reports', 'report_members.report_id', '=', 'reports.report_id')
            ->join('classes', 'reports.class_id', '=', 'classes.class_id')
            ->join('subjects', 'classes.subject_id', '=', 'subjects.subject_id')
            ->join('user_profiles', 'reports.teacher_id', '=', 'user_profiles.user_id')
            ->select(
                'report_members.student_id',
                'reports.report_id',
            )
            ->where('report_members.student_id', $studentId)
            ->distinct('reports.report_id')
            ->count('reports.report_id');

        if ($length === 0) {
            return response()->json([
                'message' => 'Không có báo cáo nào.'
            ], 404);
        }
        return response()->json(
            $length,
            200
        );
    }

    public function getCountReportCompleteByStudent()
    {
        $studentId = AuthHelper::isLogin();


        //  Subquery: lấy submission mới nhất cho từng report
        $latestSubmissions = DB::table('submissions')
            ->select(DB::raw('MAX(submission_id) as submission_id'), 'report_id')
            ->groupBy('report_id');

        //  Query chính (giữ nguyên JOIN)
        $count = DB::table('report_members')
            ->join('reports', 'report_members.report_id', '=', 'reports.report_id')
            ->join('classes', 'reports.class_id', '=', 'classes.class_id')
            ->join('subjects', 'classes.subject_id', '=', 'subjects.subject_id')
            ->join('user_profiles', 'reports.teacher_id', '=', 'user_profiles.user_id')

            //  JOIN vào submission mới nhất
            ->joinSub($latestSubmissions, 'latest', function ($join) {
                $join->on('latest.report_id', '=', 'reports.report_id');
            })
            ->join('submissions', 'submissions.submission_id', '=', 'latest.submission_id')

            ->join('grades', 'submissions.submission_id', '=', 'grades.submission_id')

            ->where('report_members.student_id', $studentId)
            ->whereNotNull('grades.score')
            ->where('grades.score', '>', 0)

            //  Đếm theo từng report (không bị trùng)
            ->distinct('reports.report_id')
            ->count('reports.report_id');

        if ($count === 0) {
            return response()->json([
                'message' => 'Sinh viên này chưa có báo cáo đã được chấm điểm.'
            ], 404);
        }

        return response()->json($count, 200);
    }



    public function createReport(Request $request)
    {
        // Validate đầu vào
        $request->validate([
            'report_name' => 'required|string|max:255',
            'class_id'    => 'required|numeric|exists:classes,class_id',
            'start_date'  => 'required|date',
            'end_date'    => 'required|date|after_or_equal:start_date',
            'description' => 'nullable|string|max:1000',
        ]);

        // (tuỳ chọn) tránh trùng tên report trong cùng lớp
        $dup = Report::where('class_id', $request->class_id)
            ->where('report_name', $request->report_name)
            ->exists();
        if ($dup) {
            return response()->json([
                'success' => false,
                'message' => '❗ Báo cáo cùng tên đã tồn tại trong lớp này.',
            ], 422);
        }

        // Lấy teacher_id từ class
        $class = DB::table('classes')->where('class_id', $request->class_id)->first();

        if (!$class) {
            return response()->json([
                'success' => false,
                'message' => '❗ Lớp học không tồn tại.',
            ], 422);
        }

        // Tạo report với status là 'open' thay vì 'submitted'
        $report = Report::create([
            'report_name' => $request->report_name,
            'description' => $request->description,
            'class_id'    => $request->class_id,
            'teacher_id'  => $class->teacher_id, // QUAN TRỌNG: THÊM TEACHER_ID
            'status'      => 'open', // SỬA 'submitted' THÀNH 'open'
            'start_date'  => $request->start_date,
            'end_date'    => $request->end_date,
        ]);

        return response()->json([
            'success' => true,
            'message' => '✅ Tạo báo cáo thành công!',
            'report'  => $report,
        ], 201);
    }
    public function getNameReportGroup($majorId, $classId)
    {
        AuthHelper::roleTeacher();
        $auth = Auth::id();
        $getName = Report::select("reports.report_name", "reports.report_id", "user_profiles.user_id")
            ->join("classes", "reports.class_id", "=", "classes.class_id")
            ->join("user_profiles", "classes.teacher_id", "=", "user_profiles.user_id")
            ->join("majors", "user_profiles.major_id", "=", "majors.major_id")
            ->where("user_profiles.user_id", $auth)
            ->where("majors.major_id", $majorId)
            ->where("classes.class_id", $classId)
            ->first();

        if (!$getName) {
            return response()->json([
                "message_error" => "Lỗi dữ liệu, vui lòng tải lại trang"
            ], 500);
        }

        return response()->json($getName, 200);
    }


    public function getReportsByMajorClassSubjectTeacher($selectedMajor, $selectedSubject, $selectedClass, $selectedYear)
    {
        AuthHelper::roleTeacher();
        $teacherId = Auth::id();

        $reports = DB::table('reports')
            ->join('classes', 'reports.class_id', '=', 'classes.class_id')
            ->join('subjects', 'classes.subject_id', '=', 'subjects.subject_id')
            ->join('majors', 'subjects.major_id', '=', 'majors.major_id')
            ->where('majors.major_id', $selectedMajor)
            ->where('subjects.subject_id', $selectedSubject)
            ->where('classes.class_id', $selectedClass)
            ->where('classes.academic_year', $selectedYear)
            ->where('classes.teacher_id', $teacherId)
            ->distinct()
            ->select(
                "reports.*"
            )
            ->get();

        if ($reports->isEmpty()) {
            return response()->json([
                'message' => 'Không tìm thấy báo cáo nào với các tiêu chí đã chọn.'
            ], 404);
        }

        return response()->json($reports, 200);
    }

    public function getTeacherReports(Request $request)
    {
        try {
            $userId = AuthHelper::isLogin();

            // Lấy profile giảng viên
            $userProfile = DB::table('user_profiles')
                ->join("users", "user_profiles.user_id", "=", "users.user_id")
                ->where('users.user_id', $userId)
                ->where('users.role', 'teacher')
                ->first();

            if (!$userProfile) {
                return response()->json(['error' => 'Không phải giảng viên'], 403);
            }

            $teacherId = $userProfile->user_id; // user_id = teacher_id

            // Kiểm tra teacher_id có tồn tại trong classes
            $testTeacher = DB::table('classes')
                ->where('teacher_id', $teacherId)
                ->first();

            if (!$testTeacher) {
                return response()->json(['error' => 'Giảng viên chưa có lớp dạy'], 200);
            }

            // Lấy danh sách báo cáo
            $reports = DB::table('reports')
                ->join('classes', 'reports.class_id', '=', 'classes.class_id')
                ->where('classes.teacher_id', $teacherId)
                ->select(
                    'reports.report_id',
                    'reports.report_name',
                    'reports.description',
                    'reports.start_date',
                    'reports.end_date',
                    'reports.created_at',
                    'classes.class_name',
                    'classes.semester',
                    'classes.academic_year'
                )
                ->orderBy('reports.created_at', 'desc')
                ->get();

            return response()->json($reports, 200);
        } catch (\Exception $e) {

            // Log lỗi
            Log::error("Teacher report error: " . $e->getMessage());

            return response()->json([
                'error' => 'Server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * ✅ Lấy chi tiết báo cáo theo ID - SỬA LẠI
     */
    public function getReportDetail($id)
    {
        try {
            $userId = AuthHelper::isLogin();

            // Debug
            Log::info("🔍 Get report detail attempt", [
                'user_id' => $userId,
                'report_id' => $id
            ]);

            // Tìm báo cáo đơn giản
            $report = Report::where('report_id', $id)->first();

            if (!$report) {
                return response()->json([
                    'error' => 'Báo cáo không tồn tại'
                ], 404);
            }

            // Kiểm tra quyền đơn giản
            if ($report->teacher_id != $userId) {
                Log::warning("❌ Permission denied for report detail", [
                    'user_id' => $userId,
                    'report_teacher_id' => $report->teacher_id
                ]);

                return response()->json([
                    'error' => 'Bạn không có quyền xem báo cáo này'
                ], 403);
            }

            // Lấy thông tin lớp
            $class = DB::table('classes')->where('class_id', $report->class_id)->first();

            $reportData = [
                'report_id' => $report->report_id,
                'report_name' => $report->report_name,
                'description' => $report->description,
                'start_date' => $report->start_date,
                'end_date' => $report->end_date,
                'status' => $report->status,
                'class_id' => $report->class_id,
                'class_name' => $class->class_name ?? 'Không xác định',
                'teacher_id' => $report->teacher_id
            ];

            Log::info("✅ Report detail retrieved", $reportData);

            return response()->json($reportData, 200);
        } catch (\Exception $e) {
            Log::error("Get report detail error: " . $e->getMessage());
            return response()->json([
                'error' => 'Lỗi server',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function updateReport(Request $request, $id)
    {
        try {
            Log::info("🔄 UPDATE REPORT REQUEST", [
                'report_id' => $id,
                'request_data' => $request->all()
            ]);

            // Tìm báo cáo
            $report = Report::where('report_id', $id)->first();

            if (!$report) {
                return response()->json([
                    'success' => false,
                    'message' => 'Báo cáo không tồn tại'
                ], 404);
            }

            // Cập nhật chỉ các field cơ bản - KHÔNG VALIDATION
            if ($request->has('report_name')) {
                $report->report_name = $request->report_name;
            }
            if ($request->has('description')) {
                $report->description = $request->description;
            }
            if ($request->has('start_date')) {
                $report->start_date = $request->start_date;
            }
            if ($request->has('end_date')) {
                $report->end_date = $request->end_date;
            }
            if ($request->has('status')) {
                $report->status = $request->status;
            }

            $report->save();

            Log::info("✅ REPORT UPDATED SUCCESS", [
                'report_id' => $id,
                'updated_data' => $report->toArray()
            ]);

            return response()->json([
                'success' => true,
                'message' => '✅ Cập nhật báo cáo thành công!'
            ], 200);
        } catch (\Exception $e) {
            Log::error("❌ UPDATE REPORT ERROR: " . $e->getMessage());
            Log::error("Stack trace: " . $e->getTraceAsString());

            return response()->json([
                'success' => false,
                'error' => 'Lỗi cập nhật: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getCountReportTeachingByTeacher()
    {
        $teacherId = AuthHelper::isLogin();
        AuthHelper::roleTeacher();
        $count_report = DB::table("reports")
            ->join("submissions", "reports.report_id", "=", "submissions.report_id")
            ->join("classes", "reports.class_id", "=", "classes.class_id")
            ->join("user_profiles", "classes.teacher_id", "=", "user_profiles.user_id")
            ->join("users", "user_profiles.user_id", "=", "users.user_id")
            ->join("grades", "submissions.submission_id", "=", "grades.submission_id")
            ->where("grades.score", "=", 0)
            ->where("users.role", "teacher")
            ->where("grades.teacher_id", $teacherId)
            ->distinct('grades.grade_id')
            ->count("grades.grade_id");

        return response()->json($count_report, 200);
    }
    public function getReportsOfClass($classId)
    {
        $teacherId = AuthHelper::isLogin();
        AuthHelper::roleTeacher();

        $reports = DB::table("reports")
            ->where("reports.class_id", $classId)
            ->where("reports.teacher_id", $teacherId)
            ->select('reports.*')
            ->get();

        return response()->json($reports, 200);
    }







    // public function getClassesGroupStatus($classId)
    // {
    //     $teacherId = AuthHelper::isLogin();
    //     AuthHelper::roleTeacher();

    //     // ✨ Lấy danh sách nhóm
    //     $groups = DB::table("reports")
    //         ->leftJoin("submissions", "reports.report_id", "=", "submissions.report_id")
    //         ->leftJoin("grades", "submissions.submission_id", "=", "grades.submission_id")
    //         ->where("reports.class_id", $classId)
    //         ->where("reports.teacher_id", $teacherId)
    //         ->select(
    //             "reports.report_id as group_id",
    //             "reports.report_name as group_name",
    //             "reports.description as topic",
    //             "reports.start_date",
    //             "reports.end_date",

    //             // UI cần status => chuẩn hóa:
    //             DB::raw("
    //             CASE
    //                 WHEN grades.score IS NOT NULL THEN 'Đã chấm'
    //                 WHEN submissions.status = 'rejected' THEN 'Bị từ chối'
    //                 WHEN submissions.status = 'submitted' THEN 'Đã nộp'
    //                 ELSE 'Chưa nộp'
    //             END as status
    //         "),

    //             "submissions.submission_time as submitted_date",
    //             "grades.score as grade"
    //         )
    //         ->get();

    //     // ✨ Lấy danh sách thành viên mỗi nhóm
    //     foreach ($groups as $g) {
    //         $members = DB::table("report_members")
    //             ->join("user_profiles", "report_members.student_id", "=", "user_profiles.user_id")
    //             ->join("users", "user_profiles.user_id", "=", "users.user_id")
    //             ->select(
    //                 "report_members.student_id as user_id",
    //                 "user_profiles.fullname",
    //                 "users.email",
    //                 DB::raw("'Đã nộp' as status") // hoặc lấy status từ report_members nếu có
    //             )
    //             ->where("report_members.report_id", $g->group_id)
    //             ->distinct() // CHỐT QUAN TRỌNG: XOÁ DUPLICATE
    //             ->get();

    //         $g->members = $members;
    //     }

    //     return response()->json($groups, 200);
    // }


    // public function getShowMemberGroup()
    // { {
    //         $teacherId = AuthHelper::isLogin();
    //         AuthHelper::roleTeacher();

    //         // ✨ Lấy danh sách nhóm
    //         $groups = DB::table("reports")
    //             ->leftJoin("submissions", "reports.report_id", "=", "submissions.report_id")
    //             ->leftJoin("grades", "submissions.submission_id", "=", "grades.submission_id")
    //             ->where("reports.class_id", $classId)
    //             ->where("reports.teacher_id", $teacherId)
    //             ->select(
    //                 "reports.report_id as group_id",
    //                 "reports.report_name as group_name",
    //                 "reports.description as topic",
    //                 "reports.start_date",
    //                 "reports.end_date",

    //                 // UI cần status => chuẩn hóa:
    //                 DB::raw("
    //             CASE
    //                 WHEN grades.score IS NOT NULL THEN 'Đã chấm'
    //                 WHEN submissions.status = 'rejected' THEN 'Bị từ chối'
    //                 WHEN submissions.status = 'submitted' THEN 'Đã nộp'
    //                 ELSE 'Chưa nộp'
    //             END as status
    //         "),

    //                 "submissions.submission_time as submitted_date",
    //                 "grades.score as grade"
    //             )
    //             ->get();

    //         // ✨ Lấy danh sách thành viên mỗi nhóm
    //         foreach ($groups as $g) {
    //             $members = DB::table("report_members")
    //                 ->join("user_profiles", "report_members.student_id", "=", "user_profiles.user_id")
    //                 ->join("users", "user_profiles.user_id", "=", "users.user_id")
    //                 ->select(
    //                     "report_members.student_id as user_id",
    //                     "user_profiles.fullname",
    //                     "users.email",
    //                     DB::raw("'Đã nộp' as status") // hoặc lấy status từ report_members nếu có
    //                 )
    //                 ->where("report_members.report_id", $g->group_id)
    //                 ->distinct() // CHỐT QUAN TRỌNG: XOÁ DUPLICATE
    //                 ->get();

    //             $g->members = $members;
    //         }

    //         return response()->json($groups, 200);
    //     }
    // }
}
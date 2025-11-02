<?php

namespace App\Http\Controllers;

use App\Helpers\AuthHelper;
use App\Models\Classe;
use Illuminate\Http\Request;
use App\Models\Report;
use Illuminate\Support\Facades\Auth;      // ✅ đúng cho Auth facade
use Illuminate\Support\Facades\DB;
use App\Models\ReportMember;
use App\Models\User;
use Google\Client;
use Google\Service\Drive;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ReportController extends Controller
{
    /** 
     * ✅ 1️⃣ Bước đầu: Lấy URL xác thực Google (chạy 1 lần duy nhất)
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
     * ✅ 2️⃣ Callback sau khi user bấm “Cho phép” → lưu token.json
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

            file_put_contents(storage_path('app/token.json'), json_encode($token));

            return response()->json([
                'success' => true,
                'message' => '✅ Đã xác thực Google Drive thành công!',
                'token_saved' => 'storage/app/token.json'
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => '❌ Lỗi callback: ' . $e->getMessage()], 500);
        }
    }


    private function getGoogleClient()
    {
        $client = new Client();
        $client->setClientId(env('GOOGLE_CLIENT_ID'));
        $client->setClientSecret(env('GOOGLE_CLIENT_SECRET'));
        $client->setRedirectUri(env('GOOGLE_REDIRECT_URI'));
        $client->addScope(Drive::DRIVE_FILE);
        $client->setAccessType('offline');

        $tokenPath = storage_path('app/token.json');
        if (!file_exists($tokenPath)) {
            throw new \Exception("❌ Chưa xác thực Google Drive. Hãy gọi /api/drive-auth trước.");
        }

        $accessToken = json_decode(file_get_contents($tokenPath), true);
        $client->setAccessToken($accessToken);

        // Refresh token nếu hết hạn
        if ($client->isAccessTokenExpired()) {
            if (!empty($accessToken['refresh_token'])) {
                $client->fetchAccessTokenWithRefreshToken($accessToken['refresh_token']);
                file_put_contents($tokenPath, json_encode($client->getAccessToken()));
            } else {
                throw new \Exception("❌ Refresh token không tồn tại. Cần xác thực lại!");
            }
        }

        return $client;
    }

    // 🔧 Tạo hoặc lấy folder
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
            // // Nếu tất cả check pass
            // return response()->json([
            //     'success' => true,
            //     'message' => 'Tất cả điều kiện hợp lệ, có thể upload!'
            // ]);


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

        // Tạo report (KHÔNG tạo report_members)
        $report = Report::create([
            'report_name' => $request->report_name,
            'description' => $request->description,
            'class_id'    => $request->class_id,
            'status'      => 'submitted', // phải khớp enum: submitted|graded|rejected
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
}
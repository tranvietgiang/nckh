<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Google\Client;
use Google\Service\Drive;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

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

    // ✅ Upload báo cáo
    public function uploadReport(Request $request)
    {
        try {
            // if (!$request->hasFile('file')) {
            //     return response()->json(['error' => '❌ Không nhận được file!'], 400);
            // }

            $file = $request->file('file');
            $email = $request->input('email');

            if (!$email) {
                return response()->json(['error' => 'Thiếu email!'], 400);
            }

            // if (!$file->isValid()) {
            //     return response()->json(['error' => '❌ File upload không hợp lệ!'], 400);
            // }

            // ✅ Chỉ cho phép docx, pdf, zip
            $allowedExtensions = ['docx', 'pdf', 'zip'];
            $ext = strtolower($file->getClientOriginalExtension());

            if (!in_array($ext, $allowedExtensions)) {
                return response()->json(['error' => '❌ Chỉ chấp nhận file DOCX, PDF hoặc ZIP!'], 400);
            }

            $client = $this->getGoogleClient();
            $driveService = new Drive($client);

            // 🗂️ Tạo folder
            $rootFolderId = $this->getOrCreateFolder($driveService, 'StudentReports');
            $studentFolderId = $this->getOrCreateFolder($driveService, $email, $rootFolderId);

            // 🧩 Đảm bảo đọc được file
            $realPath = $file->getRealPath();
            if (!$realPath || !is_readable($realPath)) {
                $tmpPath = storage_path('app/tmp');
                if (!file_exists($tmpPath)) mkdir($tmpPath, 0777, true);
                $file->move($tmpPath, $file->getClientOriginalName());
                $realPath = $tmpPath . '/' . $file->getClientOriginalName();
            }

            if (!file_exists($realPath)) {
                throw new \Exception('❌ File không tồn tại hoặc không thể đọc.');
            }

            // 🧠 MIME chính xác theo loại file
            $mimeMap = [
                'pdf'  => 'application/pdf',
                'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'zip'  => 'application/zip',
            ];
            $mimeType = $mimeMap[$ext];

            // 🚀 Upload lên Google Drive
            $fileMetadata = new Drive\DriveFile([
                'name' => 'BaoCao_' . time() . '_' . $file->getClientOriginalName(),
                'parents' => [$studentFolderId],
            ]);

            $uploadedFile = $driveService->files->create($fileMetadata, [
                'data' => file_get_contents($realPath),
                'mimeType' => $mimeType,
                'uploadType' => 'multipart',
                'fields' => 'id, name, webViewLink, webContentLink'
            ]);

            // 🌍 Cấp quyền xem công khai
            $driveService->permissions->create($uploadedFile->id, new Drive\Permission([
                'type' => 'anyone',
                'role' => 'reader',
            ]));

            return response()->json([
                'success' => true,
                'message' => '✅ Báo cáo đã được nộp thành công!',
                'file_name' => $uploadedFile->name,
                'drive_url' => $uploadedFile->webViewLink,
                'download_url' => $uploadedFile->webContentLink,
            ]);
        } catch (\Exception $e) {
            Log::error('❌ Drive upload error: ' . $e->getMessage());
            return response()->json(['error' => '❌ Lỗi upload: ' . $e->getMessage()], 500);
        }
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
}
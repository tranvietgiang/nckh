<?php

namespace App\Services;

use Google_Client;
use Google_Service_Drive;
use Google_Service_Drive_DriveFile;

class GoogleDriveService
{
    protected $client;
    protected $service;

    public function __construct()
    {
        $this->client = new Google_Client();
        $this->client->setClientId(env('GOOGLE_CLIENT_ID'));
        $this->client->setClientSecret(env('GOOGLE_CLIENT_SECRET'));
        $this->client->setRedirectUri(env('GOOGLE_REDIRECT_URI'));
        $this->client->addScope(Google_Service_Drive::DRIVE_FILE);

        // Nạp token đã lưu
        $tokenPath = storage_path('app/google/token.json');
        if (!file_exists($tokenPath)) {
            throw new \Exception('⚠️ Chưa có token. Hãy xác thực Google trước.');
        }

        $accessToken = json_decode(file_get_contents($tokenPath), true);
        $this->client->setAccessToken($accessToken);

        // Refresh token nếu hết hạn
        if ($this->client->isAccessTokenExpired()) {
            $this->client->fetchAccessTokenWithRefreshToken($this->client->getRefreshToken());
            file_put_contents($tokenPath, json_encode($this->client->getAccessToken()));
        }

        $this->service = new Google_Service_Drive($this->client);
    }

    public function uploadFile($filePath, $fileName)
    {
        $fileMetadata = new Google_Service_Drive_DriveFile(['name' => $fileName]);
        $content = file_get_contents($filePath);

        $file = $this->service->files->create($fileMetadata, [
            'data' => $content,
            'uploadType' => 'multipart',
            'fields' => 'id, webViewLink',
        ]);

        return $file->webViewLink;
    }
}
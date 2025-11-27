<?php

namespace App\Http\Controllers;

use App\Helpers\AuthHelper;
use Illuminate\Http\Request;
use App\Services\NotificationService;

class NotificationController extends Controller
{
    public function __construct(protected NotificationService $service) {}

    public function createNotification(Request $request)
    {
        AuthHelper::roleTeacher();

        $result = $this->service->createNotificationService($request->all());
        return response()->json($result, $result['success'] ? 200 : 400);
    }


    public function getNotify()
    {
        $studentId =  AuthHelper::isLogin();

        $result = $this->service->getNotifyService($studentId);
        if ($result['status']) {
            return response()->json($result["data"], 200);
        }

        return response()->json(["message_error" => "Lỗi server"], 500);
    }
}
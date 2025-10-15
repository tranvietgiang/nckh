<?php

use App\Http\Controllers\StudentController;

use Illuminate\Support\Facades\Route;

Route::post("/test", function () {
    return "test";
});

Route::get('/get-user', function () {
    return response()->json([
        'fullname' => 'Nguyễn Văn A',
        'email' => 'vana@example.com',
    ]);
});


Route::post('/students/import', [StudentController::class, 'import']);
Route::get('/get-students', [StudentController::class, 'getStudent']);
<?php

namespace App\Imports;

use App\Models\User;
use App\Models\user_profile;
use App\Models\UserProfile;
use App\Models\Major;
use App\Models\ImportError;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Illuminate\Support\Collection;

class TeacherImport implements ToCollection, WithHeadingRow
{
    public $total = 0;
    public $success = 0;
    public $failed = 0;
    public $errors = [];
    public $successList = []; // ✅ NÊN dùng $this->successList thay vì biến cục bộ

    public function collection(Collection $rows)
    {
        if ($rows->isEmpty()) {
            throw new \Exception("File Excel không có dữ liệu!");
        }

        foreach ($rows as $index => $row) {
            $this->total++;

            $userId   = trim((string) ($row['user_id'] ?? ''));
            $email    = trim((string) ($row['email'] ?? ''));
            $password = trim((string) ($row['password'] ?? '123456'));
            $fullname = trim((string) ($row['fullname'] ?? ''));
            $phone    = trim((string) ($row['phone'] ?? ''));
            $majorRaw = trim((string) ($row['major'] ?? ''));
            $birth    = trim((string) ($row['birthdate'] ?? ''));

            // 🔹 Kiểm tra dữ liệu bắt buộc
            if (!$userId || !$email || !$fullname || !$majorRaw) {
                $this->failed++;
                $reason = "Dòng " . ($index + 2) . " thiếu dữ liệu bắt buộc";
                $this->errors[] = [
                    'user_id' => $userId ?: "Không rõ",
                    'reason' => $reason,
                ];

                ImportError::create([
                    'user_id' => $userId ?: null,
                    'reason' => $reason,
                    'major_id' => null,
                    'teacher_id' => $userId ?: null,
                ]);
                continue;
            }

            // 🔹 Kiểm tra trùng user/email
            if (User::where('user_id', $userId)->orWhere('email', $email)->exists()) {
                $this->failed++;
                $reason = "Dòng " . ($index + 2) . " trùng user_id hoặc email";
                $this->errors[] = [
                    'user_id' => $userId,
                    'reason' => $reason,
                ];

                ImportError::create([
                    'user_id' => $userId,
                    'reason' => $reason,
                    'major_id' => null,
                    'teacher_id' => $userId,
                ]);
                continue;
            }

            // 🔹 Tìm ngành học
            $major = Major::where('major_name', $majorRaw)->first();
            if (!$major) {
                $this->failed++;
                $reason = "Dòng " . ($index + 2) . " không tìm thấy ngành: $majorRaw";
                $this->errors[] = [
                    'user_id' => $userId,
                    'reason' => $reason,
                ];

                ImportError::create([
                    'user_id' => $userId,
                    'reason' => $reason,
                    'major_id' => null,
                    'teacher_id' => $userId,
                ]);
                continue;
            }

            // 🔹 Insert User + Profile
            try {
                DB::transaction(function () use ($userId, $email, $password, $fullname, $phone, $birth, $major) {
                    User::create([
                        'user_id' => $userId,
                        'email' => $email,
                        'password' => Hash::make($password),
                        'role' => 'teacher',
                    ]);

                    user_profile::create([
                        'user_id' => $userId,
                        'fullname' => $fullname,
                        'phone' => $phone,
                        'birthdate' => $birth,
                        'major_id' => $major->major_id,
                        'class_student' => null,
                        'class_id' => 1,
                    ]);
                });

                $this->success++;
                $this->successList[] = [ // ✅ dùng $this->successList thay vì biến cục bộ
                    'user_id' => $userId,
                    'fullname' => $fullname,
                ];
            } catch (\Throwable $e) {
                $this->failed++;
                $reason = "Dòng " . ($index + 2) . " lỗi hệ thống: " . $e->getMessage();
                $this->errors[] = [
                    'user_id' => $userId,
                    'reason' => $reason,
                ];

                ImportError::create([
                    'user_id' => $userId,
                    'reason' => $reason,
                    'major_id' => $major->major_id ?? null,
                    'teacher_id' => $userId,
                ]);
            }
        }

        return [
            'total' => $this->total,
            'success' => $this->success,
            'failed' => $this->failed,
            'errors' => $this->errors,
            'successList' => $this->successList, // ✅ quan trọng
        ];
    }
}

<?php

namespace App\Imports;

use App\Models\Classe;
use App\Models\User;
use App\Models\user_profile;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use PhpOffice\PhpSpreadsheet\Shared\Date;

class StudentsImport implements ToModel, WithHeadingRow
{
    public $success = 0;
    public $failed = 0;
    public $duplicates = []; // 🔹 Danh sách trùng

    public function model(array $row)
    {
        $msv = trim((string)($row['msv'] ?? ''));
        $lop  = trim($row['lop_sv'] ?? '');
        $ten  = trim($row['ten'] ?? '');
        $birthdate = trim($row['ngay_sinh'] ?? '');
        $phone = trim($row['phone'] ?? '');
        $email = trim($row['email'] ?? '');
        $password = $msv;

        if (is_numeric($birthdate)) {
            $birthdate = Date::excelToDateTimeObject($birthdate)->format('d/m/Y');
        }

        if (empty($msv) || empty($email) || empty($ten)) {
            $this->failed++;
            return null;
        }


        $class = Classe::where('class_id', 1)->first();


        // if (User::where('user_id', $msv)->orWhere('email', $email)->exists()) {
        //     $this->failed++;
        //     return null;
        // }

        // --- 2. Kiểm tra user trùng ---
        $existingUser = User::where('user_id', $msv)
            ->orWhere('email', $email)
            ->first();

        if ($existingUser) {
            $this->failed++;
            // 🔹 Lưu lại thông tin trùng
            $this->duplicates[] = [
                'msv'   => $msv,
                'email' => $email,
                'ten'   => $ten,
            ];
            return null;
        }


        $user = User::create([
            'user_id' => $msv,
            'email' => $email,
            'password' => Hash::make($password),
            'role' => 'student',
        ]);

        // --- 6. Tạo user_profile ---
        user_profile::create([
            'fullname'       => $ten,
            'birthdate'      => $birthdate,
            'phone'          => $phone,
            'class_student'  => $lop,
            'class_id'       => $class->class_id ?? null,
            'user_id'        => $msv,
        ]);

        $this->success++;
        return $user;
    }
}
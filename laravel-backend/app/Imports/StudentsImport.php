<?php

namespace App\Imports;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class StudentsImport implements ToModel, WithHeadingRow
{
    public function model(array $row)
    {
        // Bỏ qua dòng trống
        if (empty($row['fullname']) || empty($row['email'])) {
            return null;
        }

        // Nếu user đã tồn tại (theo email) → bỏ qua
        if (User::where('email', $row['email'])->exists()) {
            return null;
        }

        // Tạo user mới
        return new User([
            'name'  => $row['fullname'],  // ánh xạ fullname trong Excel sang name trong DB
            'email' => $row['email'],
            'mssv'  => $row['user_id'],   // nếu Cả dùng cột user_id là MSSV
            'password'  => Hash::make($row['password'] ?? '123456'), // nếu không có password thì dùng mặc định
        ]);
    }
}

<?php

namespace App\Repositories;

use App\Models\Classe;
use App\Models\user_profile;
use Illuminate\Support\Facades\DB;

class ClassesRepository
{
    /**
     * Xóa lớp học nếu không có sinh viên trong lớp.
     *
     * @param int $classId
     * @param string $teacherId
     * @return int  // 0 = không xóa được, >0 = số dòng bị xóa
     */
    public function deleteByClass(int $classId, string $teacherId): int
    {
        return Classe::where('class_id', $classId)
            ->where('teacher_id', $teacherId)
            ->delete();
    }


    // kiểm tra sinh viên trong lớp
    public function studentExists(int $classId): bool
    {
        $hasStudents = DB::table('users')
            ->join('user_profiles', 'users.user_id', '=', 'user_profiles.user_id')
            ->where('user_profiles.class_id', $classId)
            ->where('users.role', 'student')
            ->exists();

        if ($hasStudents) {
            return true;
        }

        return false;
    }

    // kiểm tra lớp không tồn tại
    public function classExists(int $classId): bool
    {
        $hasClasses = Classe::where('class_id', $classId)
            ->exists();

        if (!$hasClasses) {
            return true;
        }

        return false;
    }

    public function insertClassesRepository(array $data)
    {
        return Classe::create([
            'class_name'    => $data['class_name'],
            'class_code'    => $data['class_code'],
            'teacher_id'    => $data['teacher_id'],
            'subject_id'    => $data['subject_id'],
            'semester'      => $data['semester'],
            'academic_year' => $data['academic_year'],
            'major_id'      => $data['major_id'],
        ]);
    }

    // tự động tạo giảng viên sau khi tọa lớp
    public function createInfTeacher(array $data)
    {
        return user_profile::create([
            'fullname'     => $data['fullname'],
            'birthdate'    => $data['birthdate'],
            'phone'        => $data['phone'],
            'class_id'     => $data['class_id'],
            'user_id'      => $data['teacher_id'],
            'major_id'     => $data['major_id'],
        ]);
    }
}
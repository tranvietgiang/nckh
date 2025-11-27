<?php

namespace App\Repositories;

use App\Models\Classe;
use App\Models\user_profile;

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
        $hasStudents = user_profile::join('users', 'user_profiles.user_id', '=', 'users.user_id')
            ->where('user_profiles.class_id', $classId)
            ->where('users.role', 'student')
            ->exists();

        if ($hasStudents) {
            return 0;
        }

        return Classe::where('class_id', $classId)
            ->where('teacher_id', $teacherId)
            ->delete();
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
    // chưa code
    public function createTeacher(array $data)
    {
        return user_profile::create([
            'fullname'     => $data['fullname'],
            'birthdate'    => $data['fullname'],
            'phone'        => $data['phone'],
            'user_id'      => $data['teacher_id'],
            'class_id'     => $data['class_id'], // lấy từ class mới tạo
            'major_id'     => $data['major_id'],
        ]);
    }
}
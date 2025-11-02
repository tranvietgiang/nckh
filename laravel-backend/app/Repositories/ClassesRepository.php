<?php

namespace App\Repositories;

use App\Models\Classe;
use App\Models\User;
use App\Models\user_profile;
use App\Models\ImportError;
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




    /// cả
     public function getByTeacher()
    {
        return DB::table('classes')
            ->join('majors', 'classes.major_id', '=', 'majors.major_id')
            ->join('users', 'classes.teacher_id', '=', 'users.user_id')
            ->leftJoin('user_profiles', 'users.user_id', '=', 'user_profiles.user_id')
            ->select(
                'classes.*',
                'majors.major_name',
                'user_profiles.fullname'
            )
            ->where('users.role', 'teacher')
            ->orderBy('majors.major_name')
            ->distinct()
            ->get();
    }
}
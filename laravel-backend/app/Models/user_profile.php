<?php

namespace App\Models;

use Laravel\Scout\Searchable;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class user_profile extends Model
{
    //
    use Searchable;


    protected $table = "user_profiles";
    protected $primaryKey = 'user_profile_id';
    protected $keyType = "int";
    public $incrementing = true;

    protected $fillable = [
        'fullname',
        'birthdate',
        'phone',
        'user_id',
        'major_id',
        'class_id',
        'class_student'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }
    public function class()
    {
        return $this->belongsTo(Classe::class, 'class_id', 'class_id');
    }


    public static function getStudentsByClass($classId)
    {
        $students = DB::table('user_profiles')
            ->join('users', 'users.user_id', '=', 'user_profiles.user_id')
            ->join('classes', 'classes.class_id', '=', 'user_profiles.class_id')
            ->leftJoin('reports', 'reports.class_id', '=', 'user_profiles.class_id')
            ->leftJoin('submissions', function ($join) {
                $join->on('submissions.student_id', '=', 'user_profiles.user_id')
                    ->on('submissions.report_id', '=', 'reports.report_id');
            })
            ->where('user_profiles.class_id', $classId)
            ->where('users.role', 'student') // ✅ chỉ lấy sinh viên thôi
            ->select(
                'user_profiles.user_id',
                'user_profiles.fullname',
                'users.email',
                'classes.class_name',
                DB::raw('
                    CASE
                        WHEN submissions.submission_id IS NULL THEN "Chưa nộp"
                        WHEN submissions.status = "submitted" THEN "Đã nộp"
                        WHEN submissions.status = "graded" THEN "Đã chấm"
                        WHEN submissions.status = "rejected" THEN "Bị từ chối"
                        ELSE "Không xác định"
                    END AS status
                ')
            )
            ->groupBy(
                'user_profiles.user_id',
                'user_profiles.fullname',
                'users.email',
                'classes.class_name',
                'submissions.submission_id',
                'submissions.status'
            )
            ->orderBy('user_profiles.fullname')
            ->get();

        if ($students->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => __('student.not_found'),
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $students,
        ]);
    }


    // Dữ liệu đưa lên index
    public function toSearchableArray(): array
    {
        return [
            'user_id'   => $this->user_id,
            'fullname'  => $this->fullname,
            'email'     => $this->email,
            'phone'     => $this->phone,
            'birthdate' => $this->birthdate,
            'role'      => $this->user->role ?? null,  // để backend filter student
        ];
    }
}
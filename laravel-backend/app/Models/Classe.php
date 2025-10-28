<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
class Classe extends Model
{
    //
    protected $table = "classes";
    protected $primaryKey = 'class_id';
    protected $keyType = "int";
    public $incrementing = true;

    protected $fillable = [
        'class_name',
        'class_code',
        'teacher_id',
        'major_id',
        'semester',
        'academic_year'
    ];

    public function students()
    {
        return $this->hasMany(user_profile::class, 'class_id', 'class_id');
    }

    public static function getByTeacher()
    {
        $classes = DB::table('classes')
            ->join('majors', 'classes.major_id', '=', 'majors.major_id')
            ->join('users', 'classes.teacher_id', '=', 'users.user_id')
            ->leftJoin('user_profiles', 'users.user_id', '=', 'user_profiles.user_id')
            ->select(
                'classes.*',
                'majors.major_name',
                'user_profiles.fullname',
            )
            ->where('users.role', 'teacher')
            ->orderBy('majors.major_name')
            ->distinct()
            ->get();

        if ($classes->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => __('class.not_found'),
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $classes,
        ]);
    }
}
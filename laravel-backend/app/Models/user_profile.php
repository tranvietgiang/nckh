<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class user_profile extends Model
{
    //
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
}
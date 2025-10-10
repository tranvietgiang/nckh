<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Grade extends Model
{
    //
    protected $table = "grades";
    protected $primaryKey = 'grade_id';
    protected $keyType = "int";
    public $incrementing = true;

    protected $fillable = [
        'submission_id',
        'teacher_id',
        'score',
        'feedback',
        'graded_at'
    ];
}
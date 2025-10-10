<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Submission extends Model
{
    //
    protected $table = "submissions";
    protected $primaryKey = 'submission_id';
    protected $keyType = "int";
    public $incrementing = true;

    protected $fillable = [
        'report_id',
        'student_id',
        'submission_time',
        'status',
        'version'
    ];
}
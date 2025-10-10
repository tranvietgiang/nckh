<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class report_member extends Model
{
    //
    protected $table = "report_members";
    protected $primaryKey = 'report_member_id';
    protected $keyType = "int";
    public $incrementing = true;

    protected $fillable = [
        'report_id',
        'student_id'
    ];
}
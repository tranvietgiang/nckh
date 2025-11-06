<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    //
    protected $table = "subjects";
    protected $primaryKey = 'subject_id';
    protected $keyType = "int";
    public $incrementing = true;

    protected $fillable = [
        'subject_name',
        'subject_code',
        'major_id',
    ];
}
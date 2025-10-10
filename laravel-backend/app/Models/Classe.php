<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
        'semester',
        'academic_year'
    ];
}
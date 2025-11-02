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


}

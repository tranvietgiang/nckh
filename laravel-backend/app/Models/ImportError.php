<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ImportError extends Model
{
    use HasFactory;
    protected $table = "import_errors";
    protected $primaryKey = 'error_id';
    protected $keyType = "int";
    public $incrementing = true;

    protected $fillable = [
        'user_id',
        'fullname',
        'email',
        'reason',
        'class_id',
        'major_id',
        'teacher_id',
    ];
}
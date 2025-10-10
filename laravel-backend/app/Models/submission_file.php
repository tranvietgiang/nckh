<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class submission_file extends Model
{
    //
    protected $table = "submission_files";
    protected $primaryKey = 'file_id';
    protected $keyType = "int";
    public $incrementing = true;

    protected $fillable = [
        'submission_id',
        'file_name',
        'file_path',
        'file_size',
        'file_type'
    ];
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class Major extends Model
{
    //
    use HasFactory;
    protected $table = "majors";
    protected $primaryKey = 'major_id';
    protected $keyType = "int";
    public $incrementing = true;

    protected $fillable = [
        'major_id',
        'major_name',
        'major_abbreviate'
    ];
}
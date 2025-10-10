<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    //
    protected $table = "reports";
    protected $primaryKey = 'Report_id';
    protected $keyType = "int";
    public $incrementing = true;

    protected $fillable = [
        'Report_name',
        'description',
        'class_id',
        'start_date',
        'end_date',
        'status'
    ];
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    //
    protected $table = "notifications";
    protected $primaryKey = 'notification_id';
    protected $keyType = "int";
    public $incrementing = true;

    protected $fillable = [
        'title',
        'content',
        'teacher_id',
        'class_id',
        'major_id'
    ];
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    //
    protected $table = "reports";
    protected $primaryKey = 'report_id';
    protected $keyType = "int";
    public $incrementing = true;

    protected $fillable = [
        'report_name',
        'description',
        'class_id',
        'start_date',
        'end_date',
        'status'
    ];
    public function submissions()
    {
        return $this->hasMany(Submission::class, 'report_id', 'report_id');
        // Submission::class là model Submission
        // 'report_id' (cột ở bảng submissions) liên kết tới 'report_id' (cột ở bảng reports)
    }
}

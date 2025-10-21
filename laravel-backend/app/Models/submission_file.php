<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class submission_file extends Model
{
    use HasFactory;

    protected $primaryKey = 'file_id';
    protected $fillable = [
        'submission_id',
        'file_name',
        'file_path',
        'file_size',
        'file_type'
    ];

    public function submission()
    {
        return $this->belongsTo(Submission::class, 'submission_id', 'submission_id');
    }
}

<?php

namespace App\Models;

use Laravel\Scout\Searchable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Subject extends Model
{
    //   
    
    use HasFactory;

    protected $table = "subjects";
    protected $primaryKey = 'subject_id';
    protected $keyType = "int";
    public $incrementing = true;

    protected $fillable = [
        'subject_name',
        'subject_code',
        'major_id',
    ];

    public function toSearchableArray(): array
    {
        return [
            'subject_id'   => $this->subject_id,
            'subject_name' => $this->subject_name,
            'subject_code' => $this->subject_code,
            'major_id'     => $this->major_id,
            'major_name'   => optional($this->major)->major_name,
            'updated_at'   => optional($this->updated_at)?->toISOString(),
            'created_at'   => optional($this->created_at)?->toISOString(),
        ];
    }
    // Quan hệ với lớp
    public function classes(): HasMany
    {
        return $this->hasMany(Classe::class, 'subject_id', 'subject_id');
    }
}

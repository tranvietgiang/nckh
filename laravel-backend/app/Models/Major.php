<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Laravel\Scout\Searchable;

class Major extends Model
{
    //
    use Searchable;

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

    // Dữ liệu đưa lên index
    public function toSearchableArray(): array
    {
        return [
            'major_id'      => $this->major_id,
            'major_name'    => $this->major_name,
            'major_abbreviate' => $this->major_abbreviate,
            'created_at'    => optional($this->created_at)?->toISOString(),
            'updated_at'    => optional($this->updated_at)?->toISOString(),
        ];
    }
}
<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Laravel\Scout\Searchable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;
    protected $table = 'users'; // tên bảng (nếu bạn không đổi)
    protected $primaryKey = 'user_id'; // KHÓA CHÍNH trong bảng của bạn
    protected $keyType = 'string'; // 🔹 Bắt buộc giữ nguyên dạng chuỗi
    public $incrementing = false;

    use Searchable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */

    protected $fillable = [
        'user_id',
        'email',
        'password',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
    // Quan hệ từ profile tới majors
    public function major()
    {
        // Truyền vào relation "hasOneThrough"
        return $this->hasOneThrough(
            Major::class,      // Model muốn lấy dữ liệu
            user_profile::class, // Model trung gian
            'user_id',         // foreign key của UserProfile trỏ tới User
            'major_id',        // foreign key của Major
            'user_id',         // local key của User
            'major_id'         // local key của UserProfile trỏ tới Major
        );
    }

    // Scout search array
    public function toSearchableArray()
    {
        return [
            'user_id' => $this->user_id,
            'email' => $this->email,
            'fullname' => $this->profile->fullname ?? '',
            'major_name' => $this->major->major_name ?? '', 
            'class_student' => $this->profile->class_student ?? '',
        ];
    }

    public function profile()
    {
        return $this->hasOne(user_profile::class, 'user_id', 'user_id');
    }
}

<?php
// app/Repositories/UserRepository.php
namespace App\Repositories;

use App\Models\User;

class UserRepository implements UserRepositoryInterface
{
    public function getActiveUsers()
    {
        return User::where('status', 'active')
            ->orderBy('created_at', 'desc')
            ->get();
    }
}

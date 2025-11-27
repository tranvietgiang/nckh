<?php

namespace App\Services;

use App\Interface\AuthInterface;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    public function __construct(protected AuthInterface $repo) {}

    public function login(string $username, string $password)
    {
        $user = $this->repo->findUser($username);

        if (!$user || !Hash::check($password, $user->password)) {
            return [
                'success' => false,
                'message' => "Tài khoản hoặc mật khẩu không đúng"
            ];
        }

        $token = $user->createToken('api-token')->plainTextToken;

        $userProfile = $this->repo->getUserProfile($username);

        return [
            'success' => true,
            'user'    => $userProfile,
            'token'   => $token
        ];
    }
}

<?php

namespace App\Interface;

interface AuthInterface
{
    public function findUser(string $username);

    public function getUserProfile(string $username);
}

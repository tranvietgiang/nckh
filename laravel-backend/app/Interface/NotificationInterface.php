<?php

namespace App\Interface;

interface NotificationInterface
{
    public function findClassById(int|string $classId);
    public function teacherOwnsClass(array $data): bool;
    public function createNotification(array $data, string $className);
    public function getNotify(string $data);
}
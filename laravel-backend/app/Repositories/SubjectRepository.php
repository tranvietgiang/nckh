<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;

class SubjectRepository
{
    protected $table = 'subjects';

    public function getAll()
    {
        return DB::table($this->table)
            ->orderByDesc('created_at')
            ->get();
    }

    public function existsByName($name)
    {
        return DB::table($this->table)
            ->where('subject_name', $name)
            ->exists();
    }

    public function existsByNameExceptId($name, $id)
    {
        return DB::table($this->table)
            ->where('subject_name', $name)
            ->where('subject_id', '!=', $id)
            ->exists();
    }

    public function createSubject(array $data)
    {
        return DB::table($this->table)->insert([
            'subject_name' => $data['subject_name'],
            'subject_code' => $data['subject_code'],
            'major_id' => $data['major_id'],
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function updateSubject($id, array $data)
    {
        return DB::table($this->table)
            ->where('subject_id', $id)
            ->update([
                'subject_name' => $data['subject_name'],
                'subject_code' => $data['subject_code'],
                'major_id' => $data['major_id'],
                'updated_at' => now(),
            ]);
    }

    public function deleteSubject($id)
    {
        return DB::table($this->table)
            ->where('subject_id', $id)
            ->delete();
    }
}
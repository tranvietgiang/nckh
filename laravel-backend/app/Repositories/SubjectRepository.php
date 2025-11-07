<?php

namespace App\Repositories;

use App\Models\Major;
use App\Models\Subject;
use Illuminate\Support\Facades\DB;

class SubjectRepository
{
    protected $table = 'subjects';

    public function getAll()
    {
        return DB::table($this->table)
            ->join("majors", "subjects.major_id", "=", "majors.major_id")
            ->orderByDesc('subjects.created_at')
            ->get();
    }
    public function existsSameNameCodeMajor($name, $code, $majorId)
    {
        return Subject::where('subject_name', $name)
            ->where('subject_code', $code)
            ->where('major_id', $majorId)
            ->exists();
    }

    public function existsNameOnly($name, $majorId)
    {
        return Subject::where('subject_name', $name)
            ->where('major_id', $majorId)
            ->exists();
    }

    public function existsCodeOnly($code, $majorId)
    {
        return Subject::where('subject_code', $code)
            ->where('major_id', $majorId)
            ->exists();
    }

    public function createSubject(array $data)
    {

        return Subject::create([
            'subject_name' => trim($data['subject_name']),
            'subject_code' => strtoupper(trim($data['subject_code'])),
            'major_id'     => $data['major_id'],
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

    public function ExistsSubjectInClass($id)
    {
        return DB::table("subjects")
            ->join("classes", "subjects.subject_id", "classes.subject_id")
            ->where("classes.subject_id", $id)->exists();
    }

    public function deleteSubject($id)
    {
        return DB::table($this->table)
            ->where('subject_id', $id)
            ->delete();
    }
}
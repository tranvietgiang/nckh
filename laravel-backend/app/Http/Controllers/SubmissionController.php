<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Submission;
use Illuminate\Support\Facades\DB;
class SubmissionController extends Controller
{
    public function indes()
    {
        $submissions = DB::table('submissions as s')
        ->join('users as u', 's.student_id', '=', 'u.user_id')
        ->join('user_profiles as up', 'u.user_id', '=', 'up.user_id')
        ->leftJoin('grades as g', 's.submission_id', '=', 'g.submission_id')
        ->select(
            's.submission_id',
            's.student_id',
            'up.fullname as student_name', 
            's.submission_time',
            's.status',
            'g.score',
            'g.feedback'
        )
        ->get();

    return response()->json(['data' => $submissions]);
    }
}

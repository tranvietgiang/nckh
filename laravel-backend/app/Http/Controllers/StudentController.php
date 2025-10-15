<?php

namespace App\Http\Controllers;

use App\Imports\StudentsImport;
use App\Models\User;
use Illuminate\Foundation\Auth\User as AuthUser;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class StudentController extends Controller
{
    //
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv'
        ]);

        Excel::import(new StudentsImport, $request->file('file'));

        return response()->json(['message' => 'Import thành công!']);
    }

    public function getUser()
    {
        $getUser = User::all();
        if ($getUser->count() > 0) {
            return response()->json($getUser);
        }
    }
}

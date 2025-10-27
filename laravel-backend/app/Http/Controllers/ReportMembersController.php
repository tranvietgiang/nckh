<?php

namespace App\Http\Controllers;

use App\Helpers\AuthHelper;
use App\Models\report_member;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportMembersController extends Controller
{
    //

    public function getClassBbyMajorGroup($classId, $majorId)
    {
        $auth = AuthHelper::isLogin();

        $groups = report_member::from('report_members as rm')
            ->join('reports as r', 'rm.report_id', '=', 'r.report_id')
            ->join('user_profiles as up', 'rm.student_id', '=', 'up.user_id')
            ->where('r.class_id', $classId)
            ->where('up.major_id', $majorId)
            ->select([
                'rm.report_id',
                'rm.rm_code',
                'r.report_name as report_name_group',
                'rm.rm_name',
                'up.fullname as leader_name',
                DB::raw('(select count(*) from report_members rm2 where rm2.report_id = rm.report_id and rm2.rm_code = rm.rm_code) as member_count'),
                DB::raw('(select count(*) from report_members rm3 where rm3.report_id = rm.report_id and rm3.rm_code = rm.rm_code and rm3.report_m_role = "NP") as deputy_count'),
                'rm.created_at',
            ])
            ->where('rm.report_m_role', 'NT') // chỉ lấy dòng leader làm đại diện
            ->orderBy('rm.report_id')->orderBy('rm.rm_code')
            ->get();



        if ($groups->count() > 0) {
            return response()->json($groups, 200);
        }

        return response()->json(["message_error" => "server lỗi!"], 200);
    }
}
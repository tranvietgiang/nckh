<?php

namespace App\Http\Controllers;

use App\Helpers\AuthHelper;
use App\Models\report_member;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use App\Imports\GroupsImport;
use App\Models\ImportError;
use Maatwebsite\Excel\Facades\Excel;
use Exception;
use Illuminate\Support\Facades\Log;

class ReportMembersController extends Controller
{
    //
    public function getClassBbyMajorGroup($classId, $majorId)
    {
        AuthHelper::isLogin();

        $groups = report_member::from('report_members as rm')
            ->join('reports as r', 'rm.report_id', '=', 'r.report_id')
            // 🧠 JOIN có điều kiện: chỉ lấy user_profile đúng class và major
            ->join('user_profiles as up', function ($join) use ($classId, $majorId) {
                $join->on('up.user_id', '=', 'rm.student_id')
                    ->where('up.class_id', '=', $classId)
                    ->where('up.major_id', '=', $majorId);
            })
            ->where('r.class_id', $classId)
            ->where('up.major_id', $majorId)
            ->select([
                'rm.report_id',
                'rm.rm_code',
                'r.report_name as report_name_group',
                'rm.rm_name',
                'up.fullname as leader_name',
                DB::raw('(SELECT COUNT(*) 
                      FROM report_members rm2 
                      WHERE rm2.report_id = rm.report_id 
                        AND rm2.rm_code = rm.rm_code) AS member_count'),
                DB::raw('(SELECT COUNT(*) 
                      FROM report_members rm3 
                      WHERE rm3.report_id = rm.report_id 
                        AND rm3.rm_code = rm.rm_code 
                        AND rm3.report_m_role = "NP") AS deputy_count'),
                'rm.created_at',
            ])
            ->distinct()
            ->where('rm.report_m_role', 'NT') // chỉ lấy trưởng nhóm đại diện
            ->orderBy('rm.report_id')
            ->orderBy('rm.rm_code')
            ->get();

        if ($groups->count() > 0) {
            return response()->json($groups, 200);
        }

        return response()->json(["message_error" => "Không có nhóm nào trong lớp này!"], 200);
    }


    public function importGroups(Request $request)
    {
        try {

            AuthHelper::roleTeacher();

            $validated = $request->validate([
                'file' => 'required|file|mimes:xlsx,xls,csv',
                'teacher_id' => 'required|string',
                'report_id' => 'required|integer',
                'class_id' => 'required|integer',
                'major_id' => 'required|integer',
            ]);

            $reportId = (int) $validated['report_id'];
            $teacherId = (string) $validated['teacher_id'];
            $classId = (int) $validated['class_id'];
            $majorId = (int) $validated['major_id'];

            // Import file Excel
            $import = new GroupsImport(
                reportId: $reportId,
                teacherId: $teacherId,
                classId: $classId,
                majorId: $majorId
            );

            Excel::import($import, $validated['file']);

            $list_import_error = ImportError::where('class_id', $classId)
                ->where('teacher_id', $teacherId)
                ->where('typeError', 'group')
                ->get();

            return response()->json([
                'message' => 'Import hoàn tất!',
                'total_group' => $import->totalGroup,
                'success' => $import->success,
                'failed' => $import->failed,
                'list_import_error' => $list_import_error,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => '❌ Import thất bại!',
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function getMemberDetail($majorId, $classId, $rm_code)
    {
        // dd($majorId, $classId, $rm_code);
        $teacherId =  AuthHelper::isLogin();


        // kiem tra

        $getMembers = report_member::select(
            "report_members.rm_code",
            "report_members.rm_name",
            "report_members.report_m_role",
            "user_profiles.fullname as tv",
            "user_profiles.user_id as msv",
            "users.role",
            DB::raw(
                '(SELECT COUNT(*) FROM report_members rm2 WHERE rm2.report_id = reports.report_id AND rm2.rm_code = report_members.rm_code) as member_count'
            )
        )
            ->join("reports", "report_members.report_id", "=", "reports.report_id")
            ->join("classes", "reports.class_id", "=", "classes.class_id")
            ->join("user_profiles", "report_members.student_id", "=", "user_profiles.user_id")
            ->join("majors", "user_profiles.major_id", "=", "majors.major_id")
            ->join("users", "user_profiles.user_id", "=", "users.user_id")
            ->where("reports.class_id", $classId)
            ->where("user_profiles.major_id", $majorId)
            ->where("report_members.rm_code", $rm_code)
            ->where("users.role", "student")
            ->groupBy("report_members.rm_code", "user_profiles.fullname", "user_profiles.user_id", "users.role", "reports.report_id")
            ->orderBy("reports.report_id")
            ->orderBy("report_members.rm_code")
            ->get();



        if ($getMembers->count() > 0) {
            return response()->json($getMembers, 200);
        }

        return response()->json(["message_error" => "server lỗi!"], 500);
    }


    //tvg
    public function getLeaderGroup()
    {
        $userId = AuthHelper::isLogin();

        $checkLeader = report_member::where('student_id', $userId)
            ->first();

        if ($checkLeader) {
            return response()->json($checkLeader, 200);
        }
        return response()->json([], 204);
    }

    //tvg
    public function getStudentLeader($rm_code)
    {
        try {
            AuthHelper::isLogin();

            $groupLeader = report_member::where('rm_code', $rm_code)
                ->where("report_m_role", "NT")
                ->first();

            if ($groupLeader) {
                return response()->json($groupLeader, 200);
            }

            return response()->json(['message' => 'Không tìm thấy nhóm trưởng'], 404);
        } catch (\Exception $e) {
            Log::error('❌ Lỗi lấy nhóm trưởng: ' . $e->getMessage());
            return response()->json(['error' => '❌ Lỗi hệ thống'], 500);
        }
    }
}
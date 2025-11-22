<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Validator;

class Report extends Model
{
    //
    protected $table = "reports";
    protected $primaryKey = 'report_id';
    protected $keyType = "int";
    public $incrementing = true;

    protected $fillable = [
        'report_name',
        'description',
        'class_id',
        'start_date',
        'teacher_id',
        'end_date',
        'status'
    ];
    public function submissions()
    {
        return $this->hasMany(Submission::class, 'report_id', 'report_id');
        // Submission::class là model Submission
        // 'report_id' (cột ở bảng submissions) liên kết tới 'report_id' (cột ở bảng reports)
    }
    
    public function classe()
    {
        return $this->belongsTo(Classe::class, 'class_id', 'class_id');
    }

    public static function createNew($request)
    {
        // Validate ngay trong model
        $validator = Validator::make($request->all(), [
            'report_name' => 'required|string|max:255',
            'class_id'    => 'required|numeric|exists:classes,class_id',
            'start_date'  => 'required|date',
            'end_date'    => 'required|date|after_or_equal:start_date',
            'description' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
            ], 422);
        }

        // Kiểm tra trùng tên
        $dup = self::where('class_id', $request->class_id)
            ->where('report_name', $request->report_name)
            ->exists();

        if ($dup) {
            return response()->json([
                'success' => false,
                'message' => __('report.duplicate_name'),
            ], 422);
        }

        // Tạo mới report
        $report = self::create([
            'report_name' => $request->report_name,
            'description' => $request->description,
            'class_id'    => $request->class_id,
            'status'      => 'submitted',
            'start_date'  => $request->start_date,
            'end_date'    => $request->end_date,
        ]);

        return response()->json([
            'success' => true,
            'message' => __('report.create_success'),
            'report'  => $report,
        ], 201);
    }
}
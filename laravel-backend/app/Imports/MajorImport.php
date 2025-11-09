<?php

namespace App\Imports;

use App\Models\Major;
use App\Models\ImportError; // Thêm dòng này
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class MajorImport implements ToCollection, WithHeadingRow
{
    public $success = 0;
    public $failed = 0;
    public $totalMajors = 0;

    public function collection(Collection $rows)
    {
        foreach ($rows as $row) {
            $this->totalMajors ++;
            $majorName = trim((string)($row['ten_nganh'] ?? ''));
            $abbr = trim((string)($row['ma_nganh'] ?? ''));

            // ❌ Thiếu dữ liệu
            if (empty($majorName) || empty($abbr)) {

                $this->failed++;
                ImportError::create([
                    'reason' => "Lỗi dữ liệu file import",
                    'typeError' => 'major',
                ]);
                continue;
            }
            

            // ❌ Trùng mã ngành
            $existsMajor = Major::where('major_abbreviate', $abbr)
            ->where("major_name",$majorName)
            ->exists();

            if ($existsMajor) {
                $this->failed++;

                ImportError::create([
                    'reason' => "Ngành này đã tồn tại!",
                    'typeError' => 'major',
                ]);
                continue;
            }

            try {
                Major::create([
                    'major_name' => $majorName,
                    'major_abbreviate' => $abbr,
                ]);
                $this->success++;
            } catch (\Exception $e) {
                $this->failed++;
                ImportError::create([
                    'reason' => "lỗi khổng thể import ngành",
                    'typeError' => 'major',
                ]);
            }
        }
    }
}
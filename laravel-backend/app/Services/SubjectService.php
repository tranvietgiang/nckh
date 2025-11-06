<?php

namespace App\Services;

use App\Models\Major;
use App\Repositories\SubjectRepository;
use Illuminate\Support\Facades\Log;
use Exception;

class SubjectService
{
    protected $subjectRepo;

    public function __construct(SubjectRepository $subjectRepo)
    {
        $this->subjectRepo = $subjectRepo;
    }

    //Lấy tất cả môn học
    public function getAllSubjects()
    {
        return $this->subjectRepo->getAll();
    }

    public function createSubject(array $data)
    {
        // 🧩 1. Kiểm tra dữ liệu bắt buộc
        if (empty($data['subject_name'])) {
            return ['success' => false, 'message_error' => 'Tên môn học không được để trống!'];
        }

        if (empty($data['subject_code'])) {
            return ['success' => false, 'message_error' => 'Mã môn học không được để trống!'];
        }

        if (empty($data['major_id'])) {
            return ['success' => false, 'message_error' => 'Vui lòng chọn ngành!'];
        }

        // 🔍 2. Kiểm tra ngành có tồn tại không
        $majorExists = Major::where('major_id', $data['major_id'])->exists();
        if (!$majorExists) {
            return ['success' => false, 'message_error' => 'Ngành học không tồn tại!'];
        }

        // 🔍 3. Kiểm tra trùng tên & mã trong cùng ngành
        if ($this->subjectRepo->existsSameNameCodeMajor($data['subject_name'], $data['subject_code'], $data['major_id'])) {
            return ['success' => false, 'message_error' => 'Tên và mã môn học này đã tồn tại trong ngành!'];
        }

        // 🔍 4. Kiểm tra trùng tên khác mã trong ngành
        if ($this->subjectRepo->existsNameOnly($data['subject_name'], $data['major_id'])) {
            return ['success' => false, 'message_error' => 'Tên môn học đã tồn tại trong ngành này!'];
        }

        // 🔍 5. Kiểm tra trùng mã khác tên trong ngành
        if ($this->subjectRepo->existsCodeOnly($data['subject_code'], $data['major_id'])) {
            return ['success' => false, 'message_error' => 'Mã môn học đã tồn tại trong ngành này!'];
        }

        // 🧱 6. Tạo mới môn học
        $created = $this->subjectRepo->createSubject($data);

        if ($created) {
            return ['success' => true, 'message_error' => 'Thêm môn học thành công!'];
        }

        return ['success' => false, 'message_error' => 'Không thể thêm môn học!'];
    }

    // Cập nhật môn học
    public function updateSubject($id, array $data)
    {
        try {
            if (empty($data['subject_name'])) {
                return ['success' => false, 'message_error' => 'Tên môn học không được để trống!'];
            }

            if (empty($data['subject_code'])) {
                return ['success' => false, 'message_error' => 'Mã môn học không được để trống!'];
            }

            if (empty($data['major_id'])) {
                return ['success' => false, 'message_error' => 'Vui lòng chọn ngành!'];
            }

            // // 🔍 Kiểm tra trùng tên (bỏ qua chính nó)
            // $exists = $this->subjectRepo->($data['subject_name'], $data['subject_code'], $data['major_id']);
            // if ($exists) {
            //     return ['success' => false, 'message_error' => 'Chưa có sự thay đổi!'];
            // }

            $updated = $this->subjectRepo->updateSubject($id, $data);
            if ($updated > 0) {
                return ['success' => true, 'message_error' => 'Cập nhật môn học thành công!'];
            }

            return ['success' => false, 'message_error' => 'Không tìm thấy môn học hoặc không có thay đổi!'];
        } catch (Exception $e) {
            Log::error('❌ Lỗi cập nhật môn học: ' . $e->getMessage());
            return ['success' => false, 'message_error' => 'Đã xảy ra lỗi khi cập nhật môn học!'];
        }
    }

    // 🟢 Xóa môn học
    public function deleteSubject($id)
    {
        try {
            $deleted = $this->subjectRepo->deleteSubject($id);
            if ($deleted > 0) {
                return ['success' => true, 'message_error' => 'Xóa môn học thành công!'];
            }
            return ['success' => false, 'message_error' => 'Không tìm thấy môn học để xóa!'];
        } catch (Exception $e) {
            Log::error('❌ Lỗi xóa môn học: ' . $e->getMessage());
            return ['success' => false, 'message_error' => 'Đã xảy ra lỗi khi xóa môn học!'];
        }
    }
}

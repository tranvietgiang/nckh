<?php

namespace App\Services;

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

    // Tạo môn học mới
    public function createSubject(array $data)
    {
        try {
            // 🔍 Kiểm tra dữ liệu đầu vào
            if (empty($data['subject_name'])) {
                return ['success' => false, 'message_error' => 'Tên môn học không được để trống!'];
            }

            if (empty($data['subject_code'])) {
                return ['success' => false, 'message_error' => 'Mã môn học không được để trống!'];
            }

            if (empty($data['major_id'])) {
                return ['success' => false, 'message_error' => 'Vui lòng chọn ngành!'];
            }

            // 🔍 Kiểm tra trùng tên môn học
            $exists = $this->subjectRepo->existsByName($data['subject_name']);
            if ($exists) {
                return ['success' => false, 'message_error' => 'Tên môn học này đã tồn tại!'];
            }

            // 🧱 Tạo mới
            $created = $this->subjectRepo->createSubject($data);
            if ($created) {
                return ['success' => true, 'message_error' => 'Thêm môn học thành công!'];
            }

            return ['success' => false, 'message_error' => 'Không thể thêm môn học!'];
        } catch (Exception $e) {
            Log::error('❌ Lỗi tạo môn học: ' . $e->getMessage());
            return ['success' => false, 'message_error' => 'Đã xảy ra lỗi trong quá trình thêm môn học!'];
        }
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

            // 🔍 Kiểm tra trùng tên (bỏ qua chính nó)
            $exists = $this->subjectRepo->existsByNameExceptId($data['subject_name'], $id);
            if ($exists) {
                return ['success' => false, 'message_error' => 'Tên môn học đã tồn tại!'];
            }

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
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
        // // Kiểm tra dữ liệu bắt buộc
        // if (empty($data['subject_name'])) {
        //     return ['success' => false, 'message_error' => 'Tên môn học không được để trống!'];
        // }

        // if (empty($data['subject_code'])) {
        //     return ['success' => false, 'message_error' => 'Mã môn học không được để trống!'];
        // }

        // if (empty($data['major_id'])) {
        //     return ['success' => false, 'message_error' => 'Vui lòng chọn ngành!'];
        // }

        // // kiểm tra độ dài tên môn học 
        // if (strlen($data["subject_name"]) < 5 || strlen($data["subject_name"]) > 100) {
        //     return ['success' => false, 'message_error' => 'Tên môn học chỉ có dộ dài (5 - 100) ký tự!!'];;
        // }

        // // kiểm tra độ dài tên môn học 
        // if (strlen($data["subject_code"]) < 3 || strlen($data["subject_code"]) > 50) {
        //     return ['success' => false, 'message_error' => 'Mã môn học chỉ có dộ dài (5 - 100) ký tự!!'];;
        // }

        // // kiểm tra ký tự đặc biệt
        // if (!preg_match('/^[A-Za-z0-9ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯàáâãèéêìíòóôõùúăđĩũơưĂÂÊÔƠƯáàảãạâầấẩẫậăằắẳẵặéèẻẽẹêềếểễệíìỉĩịóòỏõọôồốổỗộơờớởỡợúùủũụưừứửữựỳýỷỹỵ\s_-]+$/u', $data["subject_name"])) {
        //     return ['success' => false, 'message_error' => 'Tên môn học không được chứa ký tự!!'];;
        // }

        // // kiểm tra ký tự đặc biệt
        // if (!preg_match('/^[A-Za-z0-9ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯàáâãèéêìíòóôõùúăđĩũơưĂÂÊÔƠƯáàảãạâầấẩẫậăằắẳẵặéèẻẽẹêềếểễệíìỉĩịóòỏõọôồốổỗộơờớởỡợúùủũụưừứửữựỳýỷỹỵ\s_-]+$/u', $data["subject_code"])) {
        //     return ['success' => false, 'message_error' => 'Mã môn học không được chứa ký tự!!'];;
        // }

        // // Kiểm tra ngành có tồn tại không
        // $majorExists = Major::where('major_id', $data['major_id'])->exists();
        // if (!$majorExists) {
        //     return ['success' => false, 'message_error' => 'Ngành học không tồn tại!'];
        // }


        $validate = $this->subjectRepo->validateData($data);
        if (!$validate['success']) {
            return $validate; // trả về message_error
        }

        // Kiểm tra trùng tên & mã trong cùng ngành
        if ($this->subjectRepo->existsSameNameCodeMajor($data['subject_name'], $data['subject_code'], $data['major_id'])) {
            return ['success' => false, 'message_error' => 'Tên và mã môn học này đã tồn tại trong ngành!'];
        }

        // Kiểm tra trùng tên khác mã trong ngành
        if ($this->subjectRepo->existsNameOnly($data['subject_name'], $data['major_id'])) {
            return ['success' => false, 'message_error' => 'Tên môn học đã tồn tại trong ngành này!'];
        }

        // Kiểm tra trùng mã khác tên trong ngành
        if ($this->subjectRepo->existsCodeOnly($data['subject_code'], $data['major_id'])) {
            return ['success' => false, 'message_error' => 'Mã môn học đã tồn tại trong ngành này!'];
        }


        // Tạo mới môn học
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

            // kiểm tra trc khi update
            $not = $this->subjectRepo->subjectNotExist($id);

            if (!$not) {
                return ['success' => false, 'message_error' => 'Môn học này không tồn tại, vui lòng tải lại trang!'];
            }

            // check update cùng 1 thời điểm
            $toggleTime = $this->subjectRepo->updateToggleId($id, $data);
            if (!$toggleTime["success"]) {
                return $toggleTime;
            }

            // Kiểm tra trùng tên (bỏ qua chính nó)
            $notChange = $this->subjectRepo->updateNotChange($id, $data);
            if ($notChange) {
                return ['success' => false, 'message_error' => 'Chưa có sự thay đổi!'];
            }

            $validate = $this->subjectRepo->validateData($data);
            if (!$validate['success']) {
                return $validate;
            }

            $updated = $this->subjectRepo->updateSubject($id, $data);
            if ($updated > 0) {
                return ['success' => true, 'message_error' => 'Cập nhật môn học thành công!'];
            }

            return ['success' => false, 'message_error' => 'lỗi server'];
        } catch (Exception $e) {
            // return ['success' => false, 'message_error' => $e->getMessage()];
            return ['success' => false, 'message_error' => 'Đã xảy ra lỗi khi cập nhật môn học!'];
        }
    }

    //  Xóa môn học
    public function deleteSubject($id)
    {
        $not = $this->subjectRepo->SubjectNotExist($id);

        if (!$not) {
            return ['success' => false, 'message_error' => 'Môn học này không tồn tại, vui lòng tải lại trang!'];
        }

        // $check = $this->subjectRepo->ExistsSubjectInClass($id);
        // if ($check) {
        //     return ['success' => false, 'message_error' => 'Xóa môn học không thành công, môn học này đã được giảng viên phụ trách'];
        // }

        $studentInClass = $this->subjectRepo->canDeleteSubject($id);

        if (!$studentInClass['success']) {
            return $studentInClass;
        }

        $deleted = $this->subjectRepo->deleteSubject($id);

        if ($deleted > 0) {
            return ['success' => true, 'message_error' => 'Xóa môn học thành công!'];
        }

        return ['success' => false, 'message_error' => 'Không tìm thấy môn học để xóa!'];
    }
}
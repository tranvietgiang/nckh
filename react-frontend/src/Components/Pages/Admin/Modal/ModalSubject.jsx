import { useState, useEffect } from "react";
import axios from "../../../../config/axios";

export default function ModalSubject({ stateOpen, onClose, editData = null }) {
  const [majors, setMajors] = useState([]);
  const [formData, setFormData] = useState({
    subject_name: "",
    subject_code: "",
    major_id: "",
    updated_at: editData?.updated_at ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // console.log(formData.updated_at);

  // Load danh sách ngành khi mở modal
  useEffect(() => {
    if (stateOpen) fetchMajors();
  }, [stateOpen]);

  const fetchMajors = async () => {
    try {
      const res = await axios.get("/get-majors");
      setMajors(res.data || []);
    } catch (err) {
      console.error("Lỗi tải danh sách ngành:", err);
      setMajors([]);
    }
  };

  // Nạp dữ liệu hoặc reset form khi mở modal
  useEffect(() => {
    if (stateOpen) {
      if (editData) {
        // Nếu đang sửa → đổ dữ liệu cũ vào form
        setFormData({
          subject_name: editData.subject_name || "",
          subject_code: editData.subject_code || "",
          major_id: editData.major_id || "",
          updated_at: editData.updated_at || "",
        });
      } else {
        // Nếu đang thêm → reset form
        setFormData({
          subject_name: "",
          subject_code: "",
          major_id: "",
          updated_at: "",
        });
      }
      setErrors({});
    }
  }, [stateOpen, editData]);

  // Xử lý nhập liệu
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.subject_name.trim())
      newErrors.subject_name = "Tên môn học không được để trống!";
    if (!formData.subject_code.trim())
      newErrors.subject_code = "Mã môn học không được để trống!";
    if (!formData.major_id) newErrors.major_id = "Vui lòng chọn ngành!";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // hàm kiểm tra ký tự đăc biệt trong tên lớp và mã lớp
  const validateFields = (a, b) => {
    const check =
      /^[A-Za-z0-9ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯàáâãèéêìíòóôõùúăđĩũơưĂÂÊÔƠƯáàảãạâầấẩẫậăằắẳẵặéèẻẽẹêềếểễệíìỉĩịóòỏõọôồốổỗộơờớởỡợúùủũụưừứửữựỳýỷỹỵ\s_-]+$/;

    // Kiểm tra tên lớp
    if (!check.test(a)) {
      alert("⚠️ Tên môn học không thể chứa ký tự đặc biệt");
      return false;
    }

    // Kiểm tra mã lớp
    if (!check.test(b)) {
      alert("⚠️ Mã môn học không thể chứa ký tự đặc biệt");
      return false;
    }

    return true;
  };

  const validateLength = (a, b) => {
    if (a.length < 5 || a.length > 100) {
      alert("Tên môn học chỉ có dộ dài (5 - 100) ký tự!");
      return true;
    }

    if (b.length < 3 || b.length > 50) {
      alert("Mã môn học chỉ có dộ dài (3 - 50) ký tự!");
      return true;
    }

    return false;
  };

  useEffect(() => {
    if (!majors || majors.length === 0) return;
    if (!formData.major_id) return;

    const exist = majors.some(
      (m) => String(m.major_id) !== String(formData.major_id)
    );

    if (!exist) {
      alert("Ngành học không tồn tại!");
      setFormData((prev) => ({
        ...prev,
        major_id: "",
      }));
      return;
    }
  }, [formData.major_id, majors]);

  // Submit form (tự chọn thêm hoặc sửa)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.major_id &&
      !formData.subject_name &&
      !formData.subject_code
    ) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    if (!validateForm()) return;

    if (!validateFields(formData.subject_name, formData.subject_code)) return;

    if (validateLength(formData.subject_name, formData.subject_code)) return;

    setLoading(true);
    try {
      if (editData) {
        // Cập nhật
        await axios.put(`/update/subjects/${editData.subject_id}`, formData);
        alert("Cập nhật môn học thành công!");
      } else {
        // Thêm mới
        await axios.post("/create/subjects", formData);
        alert("Thêm môn học thành công!");
      }

      // Reload lại danh sách bên ngoài nếu có
      if (window.onSubjectActionSuccess) window.onSubjectActionSuccess();
      onClose();
    } catch (err) {
      console.error("Lỗi xử lý môn học:", err);
      const msg =
        err.response?.data?.message_error || "Không thể kêt nói với máy chủ!";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  // Nếu modal đóng thì không render gì
  if (!stateOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {editData ? "Chỉnh sửa môn học" : "Thêm môn học mới"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Tên môn học */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên môn học <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="subject_name"
              value={formData.subject_name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.subject_name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Nhập tên môn học"
            />
            {errors.subject_name && (
              <p className="mt-1 text-sm text-red-600">{errors.subject_name}</p>
            )}
          </div>

          {/* Mã môn học */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mã môn học <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="subject_code"
              value={formData.subject_code}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.subject_code ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="VD: CNTT01"
            />
            {errors.subject_code && (
              <p className="mt-1 text-sm text-red-600">{errors.subject_code}</p>
            )}
          </div>

          {/* Ngành */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngành <span className="text-red-500">*</span>
            </label>
            <select
              name="major_id"
              value={formData.major_id}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.major_id ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Chọn ngành</option>
              {majors.map((m) => (
                <option key={m.major_id} value={m.major_id}>
                  {m.major_name}
                </option>
              ))}
            </select>
            {errors.major_id && (
              <p className="mt-1 text-sm text-red-600">{errors.major_id}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading
                ? "Đang xử lý..."
                : editData
                ? "Cập nhật môn học"
                : "Thêm môn học"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

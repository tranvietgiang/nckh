import { useState, useEffect } from "react";
import axios from "../../../../config/axios";

export default function ModalSubject({ stateOpen, onClose }) {
  const [majors, setMajors] = useState([]);
  const [formData, setFormData] = useState({
    subject_name: "",
    subject_code: "",
    major_id: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // 🟢 Load danh sách ngành
  useEffect(() => {
    if (stateOpen) {
      fetchMajors();
    }
  }, [stateOpen]);

  const fetchMajors = () => {
    axios
      .get("/get-majors")
      .then((res) => setMajors(res.data || []))
      .catch((err) => {
        console.error("Lỗi tải danh sách ngành:", err);
        setMajors([]);
      });
  };

  // 🧹 Reset form khi mở modal
  useEffect(() => {
    if (stateOpen) {
      setFormData({
        subject_name: "",
        subject_code: "",
        major_id: "",
      });
      setErrors({});
    }
  }, [stateOpen]);

  // ✏️ Xử lý nhập liệu
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // ✅ Validate
  const validateForm = () => {
    const newErrors = {};
    if (!formData.subject_name.trim()) {
      newErrors.subject_name = "Tên môn học không được để trống";
    }
    if (!formData.subject_code.trim()) {
      newErrors.subject_code = "Mã môn học không được để trống";
    }
    if (!formData.major_id) {
      newErrors.major_id = "Vui lòng chọn ngành";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🚀 Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      await axios.post("/subjects", formData);
      alert("✅ Thêm môn học thành công!");
      if (window.onSubjectActionSuccess) {
        window.onSubjectActionSuccess();
      }
      onClose();
    } catch (err) {
      console.error("Lỗi thêm môn học:", err);
      if (err.response?.data) {
        alert(err.response?.data?.message_error);
      } else {
        alert("❌ Có lỗi xảy ra khi thêm môn học!");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!stateOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Thêm Môn Học Mới
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
              {loading ? "Đang xử lý..." : "Thêm môn học"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useState } from "react";
import axios from "../../../../config/axios";

export default function CreateClass({ stateOpen, onClose }) {
  const [formData, setFormData] = useState({
    class_name: "",
    class_code: "",
    semester: "",
    academic_year: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("/classes/inerts-class-new", formData);

      if (response.data.success) {
        alert("Tạo lớp học thành công!");
        onClose(false);
        // Reset form
        setFormData({
          class_name: "",
          class_code: "",
          semester: "",
          academic_year: "",
        });

        window.location.reload();
      }
    } catch (error) {
      if (error.response.status == 401) {
        alert(`Vui lòng đăng nhập!`);
      } else if (error.response) {
        console.error("Lỗi tạo lớp học:", error);
        alert(`❌ ${error.response.data?.message_error}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose(false);
  };

  if (!stateOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={handleClose}
      ></div>

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-2xl bg-white rounded-xl shadow-2xl z-50 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold flex items-center">
              🏫 Tạo Lớp Học Mới
            </h3>
            <button
              onClick={handleClose}
              className="text-white hover:text-gray-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto max-h-[70vh]"
        >
          <div className="space-y-4">
            {/* Tên lớp học */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📝 Tên lớp học *
              </label>
              <input
                type="text"
                name="class_name"
                value={formData.class_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="VD: Lập trình Cơ bản - Nhóm 1"
              />
            </div>

            {/* Mã lớp */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔤 Mã lớp *
              </label>
              <input
                type="text"
                name="class_code"
                value={formData.class_code}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="VD: CT101.1"
              />
            </div>

            {/* Học kỳ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📅 Học kỳ *
              </label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                <option value="">Chọn học kỳ</option>
                <option value="1">Học kỳ 1</option>
                <option value="2">Học kỳ 2</option>
              </select>
            </div>

            {/* Năm học */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🗓️ Năm học *
              </label>
              <input
                type="text"
                name="academic_year"
                value={formData.academic_year}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="VD: 2024-2025"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              ❌ Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "⏳ Đang tạo..." : "✅ Tạo lớp học"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

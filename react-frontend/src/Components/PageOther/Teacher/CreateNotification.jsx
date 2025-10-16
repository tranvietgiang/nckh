import React, { useState } from "react";

export default function CreateNotification({ stateOpen, onClose }) {
  const [formData, setFormData] = useState({
    sendTo: "Lập trình Cơ bản",
    title: "Thông báo lịch nộp bài điều chỉnh",
    content: `Kính gửi các em sinh viên,

Lịch nộp bài Báo cáo Cuối kỳ đã được điều chỉnh:
- Deadline mới: 20/12/2024 (Thay vì 15/12)
- Yêu cầu format vẫn giữ nguyên
- Các em có thêm 5 ngày để hoàn thiện báo cáo`,
    sendEmail: true,
    showDashboard: true,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form data:", formData);
    // Xử lý gửi thông báo
  };

  const handleClose = () => {
    onClose(false);
  };
  if (!stateOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={handleClose}
      ></div>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center">
              📢 TẠO THÔNG BÁO
            </h1>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow-lg p-6 sm:p-8"
          >
            {/* GỬI ĐẾN */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GỬI ĐẾN:
              </label>
              <select
                name="sendTo"
                value={formData.sendTo}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option>Lập trình Cơ bản</option>
                <option>Cơ sở dữ liệu</option>
                <option>Mạng máy tính</option>
                <option>Tất cả sinh viên</option>
              </select>
            </div>

            {/* TIÊU ĐỀ */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                TIÊU ĐỀ:
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập tiêu đề thông báo..."
              />
            </div>

            {/* NỘI DUNG */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                NỘI DUNG:
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows="8"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                placeholder="Nhập nội dung thông báo..."
              />
            </div>

            {/* TÙY CHỌN */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                TÙY CHỌN:
              </label>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="sendEmail"
                    checked={formData.sendEmail}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Gửi email thông báo
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="showDashboard"
                    checked={formData.showDashboard}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Hiển thị trên dashboard sinh viên
                  </label>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center"
              >
                <span className="mr-2">📨</span>
                Gửi thông báo
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

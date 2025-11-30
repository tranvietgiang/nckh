import { useState, useEffect } from "react";
import axios from "../../../../config/axios";
import { X, Save, Calendar } from "lucide-react";
import { getAuth } from "../../../Constants/INFO_USER";

export default function ModalUpdateReport({
  open,
  onClose,
  onSuccess,
  report,
}) {
  const { token, user } = getAuth(); // Lấy cả user info
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    report_name: "",
    description: "",
    start_date: "",
    end_date: "",
    status: "open",
  });

  // Reset form khi report thay đổi
  useEffect(() => {
    if (report && open) {
      console.log("📝 Dữ liệu báo cáo:", report);
      console.log("🔐 User info:", user);
      console.log("🔑 Token:", token ? "Có token" : "Không có token");

      // Lấy thông tin từ dữ liệu hiện tại
      setFormData({
        report_name: report.title || report.report_name || "",
        description: report.description || "",
        start_date: report.start_date
          ? formatDateForInput(report.start_date)
          : "",
        end_date: report.deadline ? formatDateForInput(report.deadline) : "",
        status: report.rawStatus || "open",
      });
    }
  }, [report, open]);

  // Hàm format date
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toISOString().split("T")[0];
    } catch (error) {
      console.log(error);
      return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.report_name.trim()) {
      alert("Vui lòng nhập tên báo cáo");
      return;
    }

    if (!formData.start_date || !formData.end_date) {
      alert("Vui lòng chọn ngày bắt đầu và kết thúc");
      return;
    }

    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      alert("Ngày kết thúc phải sau ngày bắt đầu");
      return;
    }

    try {
      setLoading(true);

      console.log("🔄 Đang gửi request cập nhật...");
      console.log("📤 Dữ liệu gửi đi:", formData);
      console.log("👤 User role:", user?.role);
      console.log("🔐 Token:", token);

      const response = await axios.put(
        `/teacher/reports/${report.id}`,
        {
          report_name: formData.report_name,
          description: formData.description,
          start_date: formData.start_date,
          end_date: formData.end_date,
          status: formData.status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Response:", response.data);

      onSuccess();
      alert("✅ Cập nhật báo cáo thành công!");
    } catch (error) {
      console.error("❌ Lỗi cập nhật báo cáo:", error);
      console.error("📋 Response data:", error.response?.data);
      console.error("🔢 Status code:", error.response?.status);

      if (error.response?.status === 403) {
        alert(
          "❌ Lỗi: Bạn không có quyền thực hiện thao tác này. Vui lòng đăng nhập lại với tài khoản giảng viên."
        );
      } else if (error.response?.status === 401) {
        alert("❌ Lỗi: Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      } else {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Cập nhật thất bại";
        alert(`❌ ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Cập nhật báo cáo</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Thông báo lỗi quyền */}
          {user?.role !== "teacher" && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm">
                ⚠️ Cảnh báo: Tài khoản của bạn không phải là giảng viên. Có thể
                bạn không có quyền cập nhật báo cáo.
              </p>
            </div>
          )}

          {/* Tên báo cáo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên báo cáo *
            </label>
            <input
              type="text"
              name="report_name"
              value={formData.report_name}
              onChange={handleChange}
              placeholder="Nhập tên báo cáo..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Nhập mô tả báo cáo..."
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          {/* Ngày bắt đầu và kết thúc */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày bắt đầu *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày kết thúc *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || user?.role !== "teacher"}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang cập nhật...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Cập nhật
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

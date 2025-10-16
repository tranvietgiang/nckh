import { useEffect, useState } from "react";
import axios from "../../../config/axios";

export default function CreateNotification({ stateOpen, onClose }) {
  const [getClass, setClass] = useState([]);
  const idTeacher = "gv001";
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    sendTo: "",
    title: "",
    content: "",
    class_id: "",
    teacher_id: idTeacher,
    sendEmail: true,
    showDashboard: true,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Nếu người dùng thay đổi "sendTo" (lớp), gán thêm class_id
    if (name === "sendTo") {
      setFormData((prev) => ({
        ...prev,
        sendTo: value,
        class_id: value, // ✅ Gán class_id theo lớp được chọn
      }));
      return;
    }

    // Xử lý các input khác (checkbox, text,...)
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const textFields = Object.entries(formData)
        .filter(
          ([key]) =>
            key !== "sendEmail" &&
            key !== "showDashboard" &&
            key !== "teacher_id" &&
            key !== "class_id"
        )
        .map(([, val]) => val);

      if (textFields.every((val) => val === "")) {
        alert("⚠️ Vui lòng nhập đầy đủ thông tin!");
        return;
      }

      // Kiểm tra rỗng cho các trường văn bản
      const fieldNames = {
        sendTo: "Lớp nhận",
        title: "Tiêu đề",
        content: "Nội dung",
      };

      for (const [key, value] of Object.entries({
        sendTo: formData.sendTo,
        title: formData.title,
        content: formData.content,
      })) {
        if (value === "") {
          alert(`⚠️ Vui lòng nhập trường '${fieldNames[key]}'`);
          return;
        }
      }

      if (!formData.class_id || !formData.teacher_id) {
        alert("❌ Lỗi dữ liệu từ máy chủ, vui lòng tải lại trang!");
        if (
          window.confirm(
            "❌ Lỗi dữ liệu từ máy chủ. Bạn có muốn tải lại trang không?"
          )
        ) {
          window.location.reload();
        }
        return;
      }

      console.log("Form data:", formData);
      setLoading(true);
      const res = await axios.post("/create-notification", formData);
      if (res.status === 200) {
        alert(`${res.data.message_success}`);
      }

      // Reset form
      setFormData({
        sendTo: "",
        title: "",
        content: "",
        class_id: "",
        teacher_id: "",
        sendEmail: true,
        showDashboard: true,
      });
      onClose(false);
    } catch (error) {
      if (error.response && error.response.data.message_error) {
        alert(`❌ ${error.response.data.message_error}`);
      } else {
        alert("❌ Có lỗi xảy ra khi gửi thông báo!");
      }
      console.log(error);
    } finally {
      setLoading(false); // ✅ tắt loading dù thành công hay thất bại
    }
  };

  useEffect(() => {
    axios
      .get(`/get-class-teacher/${idTeacher}`)
      .then((res) => {
        setClass(res.data);
        console.log(res.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  // Sửa hàm handleClose - ngăn event bubbling
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose(false);
    }
  };

  const handleCancel = () => {
    onClose(false);
  };

  // Thêm useEffect để đóng bằng phím ESC
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.keyCode === 27) {
        onClose(false);
      }
    };

    if (stateOpen) {
      document.addEventListener("keydown", handleEscKey);
      document.body.style.overflow = "hidden"; // Ngăn scroll background
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
      document.body.style.overflow = "unset";
    };
  }, [stateOpen, onClose]);

  if (!stateOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={handleBackdropClick}
      ></div>

      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div
          className="bg-white rounded-xl shadow-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()} // Ngăn click trong modal đóng modal
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                📢 TẠO THÔNG BÁO
              </h1>
              <button
                onClick={handleCancel}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8">
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
                <option value="">Chọn lớp</option>
                {getClass?.length > 0 ? (
                  getClass.map((classItem, index) => (
                    <option key={index} value={classItem.class_id_teacher}>
                      {classItem.class_name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    Không có lớp
                  </option>
                )}
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
                onClick={handleCancel}
                className={`px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors ${
                  loading ? "hidden" : ""
                }`}
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center ${
                  loading
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {loading ? (
                  <span className="mr-2 animate-spin">⏳</span>
                ) : (
                  <span className="mr-2">📨</span>
                )}
                {loading ? "Đang gửi..." : "Gửi thông báo"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

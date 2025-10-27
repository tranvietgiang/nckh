import { useEffect, useState } from "react";
import axios from "../../../../config/axios";
import { getAuth } from "../../../Constants/INFO_USER";
import RoleTeacher from "../../../ReUse/IsLogin/RoleTeacher";
import IsLogin from "../../../ReUse/IsLogin/IsLogin";

export default function CreateNotification({ stateOpen, onClose }) {
  const [majors, setMajors] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMajor, setLoadingMajor] = useState(false);
  const [loadingClass, setLoadingClass] = useState(false);

  const { user, token } = getAuth();
  IsLogin(user, token);
  RoleTeacher(user?.role);

  const teacherId = user?.user_id ?? null;
  const [selectedMajor, setSelectedMajor] = useState("");

  const [formData, setFormData] = useState({
    class_id: "",
    major_id: "",
    teacher_id: teacherId,
    title: "",
    content: "",
    sendEmail: true,
    showDashboard: true,
  });

  // --- Lấy ngành của giảng viên ---
  useEffect(() => {
    if (!teacherId) return;
    setLoadingMajor(true);
    axios
      .get(`/major-by-teacher/${teacherId}`)
      .then((res) => {
        setMajors(res.data);
        console.log(res.data);
      })
      .catch((err) => {
        console.error("❌ Lỗi tải ngành:", err);
        setMajors([]);
      })
      .finally(() => setLoadingMajor(false));
  }, [teacherId]);

  // --- Khi chọn ngành -> tải lớp ---
  useEffect(() => {
    if (!selectedMajor) return;
    setLoadingClass(true);
    axios
      .get(`/get-class-by-major/${selectedMajor}`)
      .then((res) => {
        setClasses(res.data);
        console.log(res.data);
      })
      .catch((err) => {
        console.error("❌ Lỗi tải lớp:", err);
        setClasses([]);
      })
      .finally(() => setLoadingClass(false));
  }, [selectedMajor]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    // chọn ngành
    if (name === "major_id") {
      setSelectedMajor(value);
      setFormData((prev) => ({
        ...prev,
        major_id: value,
        class_id: "", // reset lớp khi đổi ngành
      }));
      return;
    }

    // chọn lớp
    if (name === "class_id") {
      setFormData((prev) => ({
        ...prev,
        class_id: value,
      }));
      return;
    }

    // các input khác
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.major_id) return alert("⚠️ Vui lòng chọn ngành!");
    if (!formData.class_id) return alert("⚠️ Vui lòng chọn lớp!");
    if (!formData.title.trim()) return alert("⚠️ Vui lòng nhập tiêu đề!");
    if (!formData.content.trim()) return alert("⚠️ Vui lòng nhập nội dung!");

    try {
      setLoading(true);
      console.log("📤 Gửi dữ liệu:", formData);
      const res = await axios.post("/create-notification", formData);
      alert(res.data.message_success || "✅ Gửi thông báo thành công!");

      // reset form
      setFormData({
        class_id: "",
        major_id: "",
        teacher_id: teacherId,
        title: "",
        content: "",
        sendEmail: true,
        showDashboard: true,
      });
      setSelectedMajor("");
      onClose(false);
    } catch (err) {
      console.error("❌ Lỗi gửi thông báo:", err);
      alert("❌ Gửi thất bại!");
    } finally {
      setLoading(false);
    }
  };

  if (!stateOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-30"
        onClick={(e) => e.target === e.currentTarget && onClose(false)}
      />
      <div className="fixed inset-0 flex items-center justify-center z-40">
        <div
          className="bg-white rounded-xl shadow-lg w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h1 className="text-2xl font-bold">📢 TẠO THÔNG BÁO</h1>
            <button
              onClick={() => onClose(false)}
              className="text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Chọn ngành */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Ngành học:
              </label>
              <select
                name="major_id"
                value={formData.major_id}
                onChange={handleInputChange}
                disabled={loadingMajor}
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                <option value="">
                  {loadingMajor ? "🔄 Đang tải..." : "Chọn ngành"}
                </option>
                {majors.map((m) => (
                  <option key={m.major_id} value={m.major_id}>
                    {m.major_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Chọn lớp */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Gửi đến lớp:
              </label>
              <select
                name="class_id"
                value={formData.class_id}
                onChange={handleInputChange}
                disabled={loadingClass || !selectedMajor}
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                <option value="">
                  {loadingClass
                    ? "🔄 Đang tải lớp..."
                    : !selectedMajor
                    ? "Chọn ngành trước"
                    : "Chọn lớp"}
                </option>
                {classes.map((c) => (
                  <option key={c.class_id_teacher} value={c.class_id_teacher}>
                    {c.class_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tiêu đề */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Tiêu đề:
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Nhập tiêu đề..."
              />
            </div>

            {/* Nội dung */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Nội dung:
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows="6"
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Nhập nội dung thông báo..."
              />
            </div>

            {/* Tuỳ chọn gửi */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-gray-700">
                Tuỳ chọn gửi thông báo:
              </h3>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="sendEmail"
                  checked={formData.sendEmail}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-blue-600"
                />
                <span>📧 Gửi qua email</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="showDashboard"
                  checked={formData.showDashboard}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-blue-600"
                />
                <span>🖥️ Hiển thị trên dashboard</span>
              </label>
            </div>

            {/* Nút gửi */}
            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => onClose(false)}
                className="px-5 py-2 border rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-5 py-2 rounded-lg text-white ${
                  loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? "Đang gửi..." : "Gửi thông báo"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

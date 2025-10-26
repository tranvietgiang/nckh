import { useEffect, useState } from "react";
import axios from "../../../../config/axios";
import { getUser } from "../../../Constants/INFO_USER";

export default function CreateNotification({ stateOpen, onClose }) {
  const [getClass, setClass] = useState([]);
  const [getMajor, setMajor] = useState([]);
  const user = getUser();
  const idTeacher = user?.user_id ?? null;

  const [loading, setLoading] = useState(false);
  const [loadingClass, setLoadingClass] = useState(false);
  const [loadingMajor, setLoadingMajor] = useState(false);

  const [selectedMajor, setSelectedMajor] = useState(""); // 🆕 major được chọn
  const [formData, setFormData] = useState({
    sendTo: "",
    title: "",
    content: "",
    class_id: "",
    teacher_id: idTeacher,
    sendEmail: true,
    showDashboard: true,
  });

  // --- Lấy danh sách ngành của giảng viên ---
  useEffect(() => {
    if (!idTeacher) return;
    setLoadingMajor(true);
    axios
      .get(`/major-by-teacher/${idTeacher}`)
      .then((res) => {
        setMajor(res.data || []);
      })
      .catch((err) => console.error("❌ Lỗi tải ngành:", err))
      .finally(() => setLoadingMajor(false));
  }, [idTeacher]);

  // --- Khi chọn ngành -> lấy danh sách lớp thuộc ngành ---
  useEffect(() => {
    if (!selectedMajor) return;
    setLoadingClass(true);
    axios
      .get(`/get-class-by-major/${selectedMajor}`) // ✅ API lấy lớp theo ngành
      .then((res) => {
        setClass(res.data || []);
      })
      .catch((err) => console.error("❌ Lỗi tải lớp:", err))
      .finally(() => setLoadingClass(false));
  }, [selectedMajor]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // 🆕 Nếu chọn ngành thì cập nhật state ngành và reset lớp
    if (name === "major_id") {
      setSelectedMajor(value);
      setFormData((prev) => ({
        ...prev,
        class_id: "",
      }));
      return;
    }

    // 🆕 Nếu chọn lớp thì cập nhật class_id và sendTo
    if (name === "sendTo") {
      setFormData((prev) => ({
        ...prev,
        sendTo: value,
        class_id: value,
      }));
      return;
    }

    // Các input khác
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // --- Gửi thông báo ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.class_id) return alert("⚠️ Vui lòng chọn lớp!");
      setLoading(true);
      const res = await axios.post("/create-notification", formData);
      alert(res.data.message_success || "✅ Gửi thông báo thành công!");
      onClose(false);
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi gửi thông báo!");
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
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h1 className="text-2xl font-bold">📢 TẠO THÔNG BÁO</h1>
            <button
              onClick={() => onClose(false)}
              className="text-2xl font-bold"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {/* Chọn ngành */}
            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Chọn ngành:
              </label>
              <select
                name="major_id"
                value={selectedMajor}
                onChange={handleInputChange}
                disabled={loadingMajor}
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                <option value="">
                  {loadingMajor ? "🔄 Đang tải..." : "Chọn ngành"}
                </option>
                {getMajor.map((m) => (
                  <option key={m.major_id} value={m.major_id}>
                    {m.major_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Chọn lớp */}
            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Gửi đến lớp:
              </label>
              <select
                name="sendTo"
                value={formData.sendTo}
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
                {getClass.map((c) => (
                  <option key={c.class_id} value={c.class_id}>
                    {c.class_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tiêu đề */}
            <div className="mb-6">
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
            <div className="mb-6">
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

            {/* Gửi */}
            <div className="flex justify-end gap-4">
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

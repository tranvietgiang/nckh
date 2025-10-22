import { useEffect, useState } from "react";
import axios from "../../../../config/axios";
import { useNavigate } from "react-router-dom";
import IsLogin from "../../../ReUse/IsLogin/IsLogin";
import { getAuth } from "../../../Constants/INFO_USER";
export default function CreateClass({ stateOpen, onClose }) {
  const { user, token } = getAuth();
  IsLogin(user, token);

  const [majors, setMajors] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loadingMajors, setLoadingMajors] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    class_name: "",
    class_code: "",
    major_id: "",
    semester: "",
    academic_year: "",
  });

  useEffect(() => {
    setLoadingMajors(true);
    axios
      .get("/majors")
      .then((res) => {
        if (Array.isArray(res.data)) setMajors(res.data);
        else throw new Error("Dữ liệu ngành trả về không hợp lệ!");
      })
      .catch((err) => {
        console.error("Lỗi tải danh sách ngành:", err);
        alert("⚠️ Không thể tải danh sách ngành. Vui lòng thử lại!");
        setMajors([]);
      })
      .finally(() => setLoadingMajors(false));
  }, []);

  useEffect(() => {
    axios
      .get("/classes")
      .then((res) => setClasses(res.data))
      .catch((err) => {
        console.warn("Không thể tải danh sách lớp:", err);
        setClasses([]);
      });
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value.trim(),
    });
  };

  const validateForm = () => {
    const { class_name, class_code, major_id, semester, academic_year } =
      formData;

    if (
      !class_name ||
      !class_code ||
      !major_id ||
      !semester ||
      !academic_year
    ) {
      alert("⚠️ Vui lòng nhập đầy đủ tất cả các trường!");
      return false;
    }

    // Kiểm tra ngành tồn tại
    const validMajor = majors.some((m) => m.major_id == major_id);
    if (!validMajor) {
      alert("❌ Ngành học không tồn tại. Vui lòng chọn lại!");
      return false;
    }

    // Kiểm tra trùng mã lớp
    const duplicate = classes.some(
      (cls) => cls.class_code?.toLowerCase() === class_code.toLowerCase()
    );
    if (duplicate) {
      alert("❌ Mã lớp này đã tồn tại trong hệ thống!");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await axios.post("/classes", formData);

      if (res.status === 401) {
        alert("⚠️ Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
        navigate("/nckh-login");
        return;
      }

      if (res.data.status) {
        alert("✅ Tạo lớp học thành công!");
        setFormData({
          class_name: "",
          class_code: "",
          major_id: "",
          semester: "",
          academic_year: "",
        });
        onClose(false);
        window.location.reload();
      } else {
        alert(`❌ Lỗi: ${res.data.message_error || "Không rõ nguyên nhân"}`);
      }
    } catch (error) {
      console.error("Lỗi tạo lớp học:", error);
      if (!error.response) {
        alert("⚠️ Không thể kết nối đến máy chủ. Kiểm tra lại mạng!");
      } else if (error.response.status === 401) {
        alert("⚠️ Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
        window.location.href = "/login";
      } else if (error.response.status === 402) {
        alert(
          `❌ ${error.response.data?.message_error || "Lỗi không xác định"}`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (!stateOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={() => onClose(false)}
      ></div>

      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-2xl bg-white rounded-xl shadow-2xl z-50 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600 text-white flex justify-between items-center">
          <h3 className="text-2xl font-bold">🏫 Tạo Lớp Học Mới</h3>
          <button
            onClick={() => onClose(false)}
            className="text-white hover:text-gray-200 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto max-h-[70vh] space-y-5"
        >
          {/* Tên lớp */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              📝 Tên lớp học *
            </label>
            <input
              type="text"
              name="class_name"
              value={formData.class_name}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
              placeholder="VD: Lập trình Cơ bản - Nhóm 1"
            />
          </div>

          {/* Mã lớp */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              🔤 Mã lớp *
            </label>
            <input
              type="text"
              name="class_code"
              value={formData.class_code}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
              placeholder="VD: CT101.1"
            />
          </div>

          {/* Ngành học */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              🧑‍💻 Ngành học *
            </label>
            {loadingMajors ? (
              <p>⏳ Đang tải danh sách ngành...</p>
            ) : (
              <select
                name="major_id"
                value={formData.major_id}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Chọn ngành --</option>
                {majors.map((mj) => (
                  <option key={mj.major_id} value={mj.major_id}>
                    {mj.major_name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Học kỳ */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              📅 Học kỳ *
            </label>
            <select
              name="semester"
              value={formData.semester}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Chọn học kỳ</option>
              <option value="1">Học kỳ 1</option>
              <option value="2">Học kỳ 2</option>
            </select>
          </div>

          {/* Năm học */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              🗓️ Năm học *
            </label>
            <input
              type="text"
              name="academic_year"
              value={formData.academic_year}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
              placeholder="VD: 2024-2025"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => onClose(false)}
              className="flex-1 border border-gray-300 rounded-lg py-3 hover:bg-gray-50"
            >
              ❌ Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-500 text-white rounded-lg py-3 hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? "⏳ Đang tạo..." : "✅ Tạo lớp học"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

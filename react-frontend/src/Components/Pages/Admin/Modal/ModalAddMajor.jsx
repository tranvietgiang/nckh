import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import IsLogin from "../../../ReUse/IsLogin/IsLogin";
import { getAuth } from "../../../Constants/INFO_USER";
import axios from "../../../../config/axios";
import {
  getSafeJSON,
  setSafeJSON,
} from "../../../ReUse/LocalStorage/LocalStorageSafeJSON";

export default function ModalMajor({ stateOpen, onClose }) {
  const { user, token } = getAuth();
  IsLogin(user, token);
  const navigate = useNavigate();

  const [majors, setMajors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    major_name: "",
    major_abbreviate: "",
  });

  // Lấy danh sách ngành khi mở modal
  useEffect(() => {
    if (stateOpen) fetchMajors();
  }, [stateOpen]);

  // === Gọi API ===
  const fetchMajors = async () => {
    setLoading(true);
    const data_majors = getSafeJSON("data_majors");
    if (data_majors) {
      setMajors(data_majors);
    }

    try {
      const res = await axios.get("/get-majors");
      if (Array.isArray(res.data)) {
        setSafeJSON("data_majors", res.data);
        setMajors(res.data);
      } else throw new Error("Dữ liệu ngành không hợp lệ!");
    } catch (err) {
      console.error("❌ Lỗi tải danh sách ngành:", err);
      setError("⚠️ Không thể tải danh sách ngành!");
    } finally {
      setLoading(false);
    }
  };

  const createMajor = async (data) => {
    const res = await axios.post("/majors", data);
    return res.data;
  };

  const updateMajor = async (id, data) => {
    const res = await axios.put(`/create-majors/${id}`, data);
    return res.data;
  };

  const deleteMajor = async (id) => {
    const res = await axios.delete(`/majors/${id}`);
    return res.data;
  };

  // === Form ===
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.major_name.trim()) {
      alert("⚠️ Vui lòng nhập tên ngành!");
      return false;
    }
    if (!formData.major_abbreviate.trim()) {
      alert("⚠️ Vui lòng nhập tên viết tắt ngành!");
      return false;
    }
    const duplicate = majors.some(
      (m) =>
        m.major_abbreviate?.toLowerCase() ===
          formData.major_abbreviate.toLowerCase() &&
        (!isEditing || m.major_id !== formData.major_id)
    );
    if (duplicate) {
      alert("❌ Mã viết tắt ngành đã tồn tại!");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitLoading(true);
    try {
      const res = isEditing
        ? await updateMajor(formData.major_id, formData)
        : await createMajor(formData);

      if (res.status) {
        alert(`✅ ${isEditing ? "Cập nhật" : "Tạo"} ngành học thành công!`);
        resetForm();
        await fetchMajors();
        window.onMajorActionSuccess?.();
      } else {
        alert(`❌ ${res.message_error || "Không rõ nguyên nhân"}`);
      }
    } catch (err) {
      console.error("❌ Lỗi xử lý:", err);
      if (err.response?.status === 401) {
        alert("⚠️ Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!");
        navigate("/nckh-login");
      } else {
        alert("⚠️ Không thể kết nối đến máy chủ!");
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = (major) => {
    setIsEditing(true);
    setFormData({
      major_id: major.major_id,
      major_name: major.major_name,
      major_abbreviate: major.major_abbreviate,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa ngành học này?")) return;

    try {
      const res = await deleteMajor(id);
      if (res.status) {
        alert("✅ Xóa ngành học thành công!");
        await fetchMajors();
        window.onMajorActionSuccess?.();
      } else {
        alert(`❌ ${res.message_error || "Không thể xóa ngành học"}`);
      }
    } catch (err) {
      console.error("❌ Lỗi xóa ngành:", err);
      alert("⚠️ Không thể kết nối tới máy chủ!");
    }
  };

  const resetForm = () => {
    setFormData({ major_name: "", major_abbreviate: "" });
    setIsEditing(false);
    setError("");
  };

  const handleClose = () => {
    resetForm();
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
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-5xl bg-white rounded-xl shadow-2xl z-50 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-500 to-green-600 text-white flex justify-between items-center">
          <h3 className="text-2xl font-bold">🎓 Quản lý Ngành học</h3>
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-200 text-2xl font-bold transition-colors"
          >
            ×
          </button>
        </div>

        <div className="flex h-[70vh]">
          {/* Sidebar danh sách ngành */}
          <div className="w-1/3 border-r border-gray-200 bg-gray-50 overflow-y-auto">
            <div className="p-4">
              <button
                onClick={resetForm}
                className="w-full bg-green-500 text-white rounded-lg py-3 hover:bg-green-600 transition mb-4 font-medium"
              >
                ➕ Thêm ngành mới
              </button>

              {loading ? (
                <p className="text-center text-gray-500 py-4">
                  ⏳ Đang tải danh sách...
                </p>
              ) : majors.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  📝 Chưa có ngành học nào
                </p>
              ) : (
                <div className="space-y-3">
                  {majors.map((m) => (
                    <div
                      key={m.major_id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        isEditing && formData.major_id === m.major_id
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 bg-white hover:border-green-300"
                      }`}
                      onClick={() => handleEdit(m)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">
                            {m.major_name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Viết tắt: {m.major_abbreviate}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(m.major_id);
                          }}
                          className="text-red-500 hover:text-red-700 ml-2"
                          title="Xóa ngành"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Form thêm/sửa ngành */}
          <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <h4 className="text-xl font-bold text-gray-800 border-b pb-2">
                {isEditing ? "✏️ Chỉnh sửa Ngành học" : "➕ Tạo Ngành học Mới"}
              </h4>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {/* Tên ngành */}
              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  🏫 Tên ngành *
                </label>
                <input
                  type="text"
                  name="major_name"
                  value={formData.major_name}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500"
                  placeholder="VD: Công nghệ Thông tin"
                />
              </div>

              {/* Viết tắt ngành */}
              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  🔤 Viết tắt ngành *
                </label>
                <input
                  type="text"
                  name="major_abbreviate"
                  value={formData.major_abbreviate}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500"
                  placeholder="VD: CNTT"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 border border-gray-300 rounded-lg py-3 hover:bg-gray-50 transition-colors"
                  disabled={submitLoading}
                >
                  ❌ Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 bg-green-500 text-white rounded-lg py-3 hover:bg-green-600 disabled:opacity-50 transition-colors"
                >
                  {submitLoading
                    ? "⏳ Đang xử lý..."
                    : isEditing
                    ? "💾 Cập nhật ngành học"
                    : "✅ Tạo ngành học"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

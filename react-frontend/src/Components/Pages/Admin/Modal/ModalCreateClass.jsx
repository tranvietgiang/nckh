import { useEffect, useState } from "react";
import axios from "../../../../config/axios";
import IsLogin from "../../../ReUse/IsLogin/IsLogin";
import { getAuth } from "../../../Constants/INFO_USER";
import RoleAdmin from "../../../ReUse/IsLogin/RoleAdmin";

export default function CreateClass({ stateOpen, onClose }) {
  const { user, token } = getAuth();
  IsLogin(user, token);
  RoleAdmin(user?.role);

  const [majors, setMajors] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    class_name: "",
    class_code: "",
    major_id: "",
    teacher_id: "",
    subject_id: "",
    semester: "",
    academic_year: "",
  });

  // 🧩 Load ngành
  useEffect(() => {
    axios
      .get("/get-majors")
      .then((res) => setMajors(res.data || []))
      .catch(() => setMajors([]));
  }, []);

  // 🧩 Load lớp (để check trùng)
  useEffect(() => {
    axios
      .get("/tvg/get-classes")
      .then((res) => setClasses(res.data || []))
      .catch(() => setClasses([]));
  }, []);
  // 🧩 Khi chọn ngành → load giáo viên và môn học
  useEffect(() => {
    if (!formData.major_id) {
      setTeachers([]);
      setSubjects([]);
      return;
    }

    const majorId = formData.major_id;
    setLoading(true);

    // --- Gọi song song 2 API ---
    const getTeachers = axios
      .get("/get-teacher-by-major", { params: { major_id: majorId } })
      .then((res) => (Array.isArray(res.data) ? res.data : []))
      .catch(() => []);

    const getSubjects = axios
      .get(`/get-subjects-majors/${majorId}`)
      .then((res) => (Array.isArray(res.data) ? res.data : []))
      .catch(() => []);

    Promise.all([getTeachers, getSubjects])
      .then(([tRes, sRes]) => {
        // Nếu cả hai mảng đều trống
        if (tRes.length === 0 && sRes.length === 0) {
          alert("❌ Ngành này chưa có giảng viên và môn học nào!");
        } else if (tRes.length === 0) {
          alert("❌ Ngành này chưa có giảng viên nào!");
        } else if (sRes.length === 0) {
          alert("❌ Ngành này chưa có môn học nào!");
        }

        setTeachers(tRes);
        setSubjects(sRes);
      })
      .catch(() => {
        alert("⚠️ Không thể tải dữ liệu giáo viên/môn học!");
        setTeachers([]);
        setSubjects([]);
      })
      .finally(() => setLoading(false));
  }, [formData.major_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const createClasses = async (e) => {
    e.preventDefault();

    const {
      class_name,
      class_code,
      major_id,
      teacher_id,
      subject_id,
      semester,
      academic_year,
    } = formData;

    if (
      !class_name ||
      !class_code ||
      !major_id ||
      !teacher_id ||
      !subject_id ||
      !semester ||
      !academic_year
    ) {
      alert("⚠️ Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    if (class_code.includes(" ")) {
      alert("❌ Mã lớp không được chứa khoảng trắng!");
      return;
    }

    const duplicate = classes.some(
      (cls) => cls.class_code?.toLowerCase() === class_code.toLowerCase()
    );
    if (duplicate) {
      alert("❌ Mã lớp đã tồn tại trong hệ thống!");
      return;
    }

    const yearRegex = /^\d{4}-\d{4}$/;
    if (!yearRegex.test(academic_year)) {
      alert("❌ Năm học phải có định dạng YYYY-YYYY!");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("/create-classes", formData);

      if (res.data?.status) {
        alert("✅ Tạo lớp học thành công!");
        onClose(false);
        window.location.reload();
      } else {
        alert(`❌ ${res.data?.message_error || "Tạo lớp thất bại!"}`);
      }
    } catch (err) {
      console.log(err);
      alert("⚠️ Lỗi kết nối đến máy chủ!");
    } finally {
      setLoading(false);
    }
  };

  if (!stateOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={() => onClose(false)}
      ></div>

      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-2xl bg-white rounded-xl shadow-2xl z-50 max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b bg-blue-600 text-white flex justify-between items-center">
          <h3 className="text-2xl font-bold">🏫 Tạo Lớp Học Mới</h3>
          <button
            onClick={() => onClose(false)}
            className="text-white hover:text-gray-200 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <form
          onSubmit={createClasses}
          className="p-6 overflow-y-auto max-h-[70vh] space-y-5"
        >
          <div>
            <label className="block mb-2 font-medium">📝 Tên lớp *</label>
            <input
              type="text"
              name="class_name"
              value={formData.class_name}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">🔤 Mã lớp *</label>
            <input
              type="text"
              name="class_code"
              value={formData.class_code}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">🧑‍💻 Ngành *</label>
            <select
              name="major_id"
              value={formData.major_id}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3"
            >
              <option value="">-- Chọn ngành --</option>
              {majors.map((m) => (
                <option key={m.major_id} value={m.major_id}>
                  {m.major_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium">👩‍🏫 Giáo viên *</label>
            <select
              name="teacher_id"
              value={formData.teacher_id}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3"
            >
              <option value="">-- Chọn giáo viên --</option>
              {teachers.map((t) => (
                <option key={t.user_id} value={t.user_id}>
                  {t.fullname}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium">📘 Môn học *</label>
            <select
              name="subject_id"
              value={formData.subject_id}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3"
            >
              <option value="">-- Chọn môn học --</option>
              {subjects.map((s) => (
                <option key={s.subject_id} value={s.subject_id}>
                  {s.subject_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium">📅 Học kỳ *</label>
            <select
              name="semester"
              value={formData.semester}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3"
            >
              <option value="">-- Chọn học kỳ --</option>
              <option value="1">Học kỳ 1</option>
              <option value="2">Học kỳ 2</option>
              <option value="3">Học kỳ Hè</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium">🗓️ Năm học *</label>
            <input
              type="text"
              name="academic_year"
              value={formData.academic_year}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3"
              placeholder="VD: 2024-2025"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => onClose(false)}
              className="flex-1 border rounded-lg py-3 hover:bg-gray-50"
            >
              ❌ Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-500 text-white rounded-lg py-3 hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? "⏳ Đang tạo..." : "✅ Tạo lớp"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

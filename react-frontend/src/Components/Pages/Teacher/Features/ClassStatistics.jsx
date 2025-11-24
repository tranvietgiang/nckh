import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../../../config/axios";
import { getAuth } from "../../../Constants/INFO_USER";

export default function ClassStatistics() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔍 Tìm kiếm + lọc
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");

  // 🧩 Lấy thông tin user
  const { token } = getAuth();

  // ==========================
  // 🔥 LẤY DANH SÁCH SINH VIÊN - ĐÃ SỬA
  // ==========================
  useEffect(() => {
    // ✅ CHUYỂN classId SANG NUMBER
    const numericClassId = parseInt(classId);

    if (!numericClassId || isNaN(numericClassId)) {
      setError("❌ Lỗi: ID lớp học không hợp lệ");
      setLoading(false);
      return;
    }

    console.log("🔍 Gọi API với classId (number):", numericClassId);

    // ✅ SỬA ENDPOINT: Dùng endpoint mới
    axios
      .get(`/classes/students/${numericClassId}`, { // ✅ ĐÃ SỬA
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        console.log("📊 API Response:", res.data);
        // ✅ SỬA: res.data.data thay vì res.data.list_student
        if (res.data.success) {
          setStudents(res.data.data || []);
        } else {
          setError(res.data.message || "Không thể tải danh sách sinh viên");
        }
      })
      .catch((err) => {
        console.error("❌ Lỗi khi tải danh sách sinh viên:", err);
        setError("Lỗi kết nối server khi tải danh sách sinh viên");
      })
      .finally(() => setLoading(false));
  }, [classId, token]);

  // ==========================
  // 🎯 HIỂN THỊ TRẠNG THÁI
  // ==========================
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <p className="text-center mt-10 text-gray-600">⏳ Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center mt-10">
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
          >
            ⬅ Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (!students || students.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center mt-10">
          <p className="text-red-500">Không tìm thấy sinh viên nào trong lớp này!</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-3 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
          >
            ⬅ Quay lại
          </button>
        </div>
      </div>
    );
  }

  // ==========================
  // 📊 Thống kê số liệu
  // ==========================
  const total = students.length;
  const submitted = students.filter((s) => s.status === "Đã nộp").length;
  const graded = students.filter((s) => s.status === "Đã chấm").length;
  const rejected = students.filter((s) => s.status === "Bị từ chối").length;
  const notSubmitted = students.filter((s) => s.status === "Chưa nộp").length;

  // 🔍 Lọc theo tên, mã và trạng thái
  const filteredStudents = students.filter((sv) => {
    const matchNameOrId =
      sv.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sv.user_id.toString().includes(searchTerm);

    const matchStatus =
      statusFilter === "Tất cả" ? true : sv.status === statusFilter;

    return matchNameOrId && matchStatus;
  });

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-xl mt-8">
      {/* Quay lại */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded"
      >
        ⬅ Quay lại
      </button>

      {/* Tiêu đề */}
      <h1 className="text-2xl font-bold text-blue-700 mb-2">
        📊 Thống kê sinh viên của lớp {students[0]?.class_name}
      </h1>
      <p className="text-gray-600 mb-6">Tổng cộng {total} sinh viên</p>

      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded-lg text-center">
          <p className="text-3xl font-bold text-blue-700">{total}</p>
          <p>Tổng SV</p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg text-center">
          <p className="text-3xl font-bold text-green-700">{submitted}</p>
          <p>Đã nộp</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-lg text-center">
          <p className="text-3xl font-bold text-yellow-700">{notSubmitted}</p>
          <p>Chưa nộp</p>
        </div>
        <div className="bg-purple-100 p-4 rounded-lg text-center">
          <p className="text-3xl font-bold text-purple-700">{graded}</p>
          <p>Đã chấm</p>
        </div>
        <div className="bg-red-100 p-4 rounded-lg text-center">
          <p className="text-3xl font-bold text-red-700">{rejected}</p>
          <p>Bị từ chối</p>
        </div>
      </div>

      {/* Bộ lọc */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <input
          type="text"
          placeholder="🔍 Tìm theo tên hoặc mã sinh viên..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded w-full md:w-1/2"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border p-2 rounded w-full md:w-1/4"
        >
          <option value="Tất cả">Tất cả</option>
          <option value="Đã nộp">Đã nộp</option>
          <option value="Chưa nộp">Chưa nộp</option>
          <option value="Đã chấm">Đã chấm</option>
          <option value="Bị từ chối">Bị từ chối</option>
        </select>
      </div>

      {/* Bảng danh sách sinh viên */}
      <table className="w-full border border-gray-200 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2 text-center">#</th>
            <th className="border p-2">Mã SV</th>
            <th className="border p-2">Họ tên</th>
            <th className="border p-2">Email</th>
            <th className="border p-2 text-center">Trạng thái</th>
          </tr>
        </thead>

        <tbody>
          {filteredStudents.length > 0 ? (
            filteredStudents.map((sv, i) => (
              <tr key={sv.user_id}>
                <td className="border p-2 text-center">{i + 1}</td>
                <td className="border p-2">{sv.user_id}</td>
                <td className="border p-2">{sv.fullname}</td>
                <td className="border p-2">{sv.email}</td>
                <td
                  className={`border p-2 text-center font-semibold ${sv.status === "Đã nộp"
                      ? "text-green-600"
                      : sv.status === "Đã chấm"
                        ? "text-blue-600"
                        : sv.status === "Bị từ chối"
                          ? "text-red-600"
                          : "text-gray-500"
                    }`}
                >
                  {sv.status}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center text-gray-500 p-4">
                Không có sinh viên nào phù hợp với tiêu chí tìm kiếm.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
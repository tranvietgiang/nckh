import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../../../config/axios";

export default function ClassStatistics() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔍 State cho tìm kiếm và lọc
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");

  useEffect(() => {
    axios
      .get(`/classes/${classId}/students`)
      .then((res) => {
        setStudents(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Lỗi khi tải danh sách sinh viên:", err);
        setLoading(false);
      });
  }, [classId]);

  if (loading)
    return <p className="text-center mt-10 text-gray-600">⏳ Đang tải dữ liệu...</p>;

  if (!students || students.length === 0)
    return (
      <div className="text-center mt-10">
        <p className="text-red-500">Không tìm thấy sinh viên nào trong lớp này!</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-3 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
        >
          ⬅ Quay lại
        </button>
      </div>
    );

  // ✅ Tính toán thống kê
  const total = students.length;
  const submitted = students.filter((s) => s.status === "Đã nộp").length;
  const graded = students.filter((s) => s.status === "Đã chấm").length;
  const rejected = students.filter((s) => s.status === "Bị từ chối").length;
  const notSubmitted = students.filter((s) => s.status === "Chưa nộp").length;

  // ✅ Lọc dữ liệu theo ô tìm kiếm & dropdown trạng thái
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
      {/* Nút quay lại */}
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

      {/* Bộ lọc tìm kiếm + trạng thái */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        {/* Ô tìm kiếm */}
        <input
          type="text"
          placeholder="🔍 Tìm theo tên hoặc mã sinh viên..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded w-full md:w-1/2"
        />

        {/* Dropdown lọc trạng thái */}
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
            <th className="border p-2">#</th>
            <th className="border p-2 text-left">Mã SV</th>
            <th className="border p-2 text-left">Họ tên</th>
            <th className="border p-2 text-left">Email</th>
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
                  className={`border p-2 text-center font-semibold ${
                    sv.status === "Đã nộp"
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

import React, { useEffect, useState } from "react";
import axios from "../../../../config/axios";

export default function ReportsManagement() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // 🔹 Lấy danh sách lớp
  useEffect(() => {
    axios
      .get("/classes")
      .then((res) => setClasses(res.data.data || res.data))
      .catch((err) => console.error("❌ Lỗi khi tải danh sách lớp:", err));
  }, []);

  // 🔹 Khi chọn lớp → lấy danh sách báo cáo
  useEffect(() => {
    if (!selectedClass) return;
    axios
      .get(`/reports?class_id=${selectedClass}`)
      .then((res) => {
        setReports(res.data.data || res.data);
        setSelectedReport("");
        setSubmissions([]);
      })
      .catch((err) => console.error("❌ Lỗi khi tải báo cáo:", err));
  }, [selectedClass]);

  // 🔹 Khi chọn báo cáo → lấy danh sách submissions
  useEffect(() => {
    if (!selectedReport) return;
    axios
      .get(`/submissionsreport?report_id=${selectedReport}`)
      .then((res) => {
        setSubmissions(res.data.data || res.data);
        setCurrentPage(1);
      })
      .catch((err) => console.error("❌ Lỗi khi tải submissions:", err));
  }, [selectedReport]);

  // 🔹 Phân trang
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = submissions.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(submissions.length / itemsPerPage);

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
        Quản Lý Báo Cáo
      </h2>

      {/* Chọn lớp */}
      <div className="mb-4">
        <label className="mr-2 font-medium text-gray-700">Chọn lớp:</label>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1 focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Chọn lớp --</option>
          {classes.map((cls) => (
            <option key={cls.class_id} value={cls.class_id}>
              {cls.class_name}
            </option>
          ))}
        </select>
      </div>

      {/* Chọn báo cáo */}
      {reports.length > 0 && (
        <div className="mb-4">
          <label className="mr-2 font-medium text-gray-700">Chọn báo cáo:</label>
          <select
            value={selectedReport}
            onChange={(e) => setSelectedReport(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Chọn báo cáo --</option>
            {reports.map((rep) => (
              <option key={rep.report_id} value={rep.report_id}>
                {rep.report_name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Bảng submissions */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 overflow-x-auto">
        {!selectedClass ? (
          <p className="text-gray-500 text-sm">Vui lòng chọn một lớp.</p>
        ) : !selectedReport ? (
          <p className="text-gray-500 text-sm">
            Vui lòng chọn một báo cáo để xem chi tiết.
          </p>
        ) : submissions.length === 0 ? (
          <p className="text-gray-500 text-sm">Chưa có bài nộp nào cho báo cáo này.</p>
        ) : (
          <>
            <table className="w-full border-collapse text-sm sm:text-base">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="p-2 text-left">Mã sinh viên</th>
                  <th className="p-2 text-left">Tên sinh viên</th>
                  <th className="p-2 text-left">Trạng thái</th>
                  <th className="p-2 text-left">Ngày nộp</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((sub, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-2">{sub.student_id}</td>
                    <td className="p-2">{sub.student_name}</td>
                    <td
                      className={`p-2 font-semibold ${
                        sub.status === "graded"
                          ? "text-green-600"
                          : sub.status === "submitted"
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {sub.status === "graded"
                        ? "✅ Đã chấm"
                        : sub.status === "submitted"
                        ? "📄 Đã nộp"
                        : "❌ Lỗi"}
                    </td>
                    <td className="p-2">
                      {new Date(sub.submission_time).toLocaleDateString("vi-VN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Phân trang */}
            <div className="flex justify-center mt-4 space-x-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                ← Trước
              </button>
              <span className="px-2">
                Trang {currentPage}/{totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Sau →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

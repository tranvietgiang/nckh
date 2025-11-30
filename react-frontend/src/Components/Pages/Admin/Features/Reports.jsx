import React, { useEffect, useState } from "react";
import axios from "../../../../config/axios";
import { getAuth } from "../../../Constants/INFO_USER";
import useIsLogin from "../../../ReUse/IsLogin/IsLogin";

export default function ReportsManagement() {
  const { user, token } = getAuth();
  useIsLogin(user, token, "admin");

  const [majors, setMajors] = useState([]);
  const [classes, setClasses] = useState([]);
  const [reports, setReports] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  const [selectedMajor, setSelectedMajor] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedReport, setSelectedReport] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Danh sách 5 năm gần nhất
  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i
  );

  // 🔹 Lấy danh sách ngành
  useEffect(() => {
    axios
      .get("/tvg/get-majors")
      .then((res) => setMajors(res.data.data || res.data))
      .catch((err) => console.error("❌ Lỗi khi tải danh sách ngành:", err));
  }, []);

  // 🔹 Khi chọn ngành hoặc năm → lấy danh sách lớp
  useEffect(() => {
    if (!selectedMajor) {
      setClasses([]); // Nếu bỏ chọn ngành thì reset lớp
      return;
    }

    const params = { major_id: selectedMajor };
    if (selectedYear) params.year = selectedYear; // gửi year nếu có

    axios
      .get("/nhhh/admin/classes", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        params,
      })
      .then((res) => setClasses(res.data))
      .catch((err) => console.error("❌ Lỗi khi tải lớp:", err));
  }, [selectedMajor, selectedYear]);

  // 🔹 Khi chọn lớp hoặc năm → lấy danh sách báo cáo
  useEffect(() => {
    if (!selectedClass) {
      setReports([]); // Nếu bỏ chọn lớp thì reset báo cáo
      return;
    }

    const params = { class_id: selectedClass };
    if (selectedYear) params.year = selectedYear;

    axios
      .get("/reports", { params })
      .then((res) => {
        setReports(res.data.data || res.data);
      })
      .catch((err) => console.error("❌ Lỗi khi tải báo cáo:", err));
  }, [selectedClass, selectedYear]);

  // 🔹 [SỬA] Khi chọn báo cáo HOẶC chọn năm → lấy danh sách submissions
  useEffect(() => {
    // Flow 1: ĐÃ chọn báo cáo
    if (selectedReport) {
      const params = {
        report_id: selectedReport,
      };
      if (selectedYear) {
        params.year = selectedYear; // Thêm year làm bộ lọc
      }

      axios
        .get(`/submissionsreport`, { params })
        .then((res) => {
          setSubmissions(res.data.data || res.data);
          setCurrentPage(1);
        })
        .catch((err) => {
          console.error("❌ Lỗi khi tải submissions:", err);
          setSubmissions([]);
        });
    }
    // Flow 2: CHỈ chọn năm (không chọn ngành/báo cáo)
    else if (selectedYear && !selectedMajor && !selectedReport) {
      axios
        .get("/nhhh/submission/reports", {
          // API mới của bạn
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          params: { year: selectedYear },
        })
        .then((res) => {
          setSubmissions(res.data.data || res.data);
          setCurrentPage(1);
        })
        .catch((err) => {
          console.error("❌ Lỗi khi tải submissions theo năm:", err);
          setSubmissions([]);
        });
    }
    // Flow 3: Không chọn gì cả (hoặc bỏ chọn)
    else {
      setSubmissions([]); // Clear danh sách nếu không rơi vào 2 trường hợp trên
    }
  }, [selectedReport, selectedYear, selectedMajor]);

  // 🔹 Phân trang
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = submissions.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(submissions.length / itemsPerPage);

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 text-center">
        📊 Quản Lý Báo Cáo
      </h2>

      {/* Bộ chọn năm - ngành - lớp - báo cáo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Chọn ngành */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ngành học
          </label>
          <select
            value={selectedMajor}
            onChange={(e) => {
              setSelectedMajor(e.target.value);
              setSelectedClass("");
              setSelectedReport("");
              setClasses([]);
              setReports([]);
            }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Chọn ngành --</option>
            {majors.map((m) => (
              <option key={m.major_id} value={m.major_id}>
                {m.major_name}
              </option>
            ))}
          </select>
        </div>

        {/* Chọn lớp */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lớp học
          </label>
          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setSelectedReport("");
            }}
            disabled={!selectedMajor}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Báo cáo
          </label>
          <select
            value={selectedReport}
            onChange={(e) => setSelectedReport(e.target.value)}
            disabled={!selectedClass}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="">-- Chọn báo cáo --</option>
            {reports.map((rep) => (
              <option key={rep.report_id} value={rep.report_id}>
                {rep.report_name}
              </option>
            ))}
          </select>
        </div>

        {/* Chọn năm */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Năm học
          </label>
          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
            }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Chọn năm --</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bảng danh sách submissions */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 overflow-x-auto">
        {/* Cập nhật logic hiển thị */}
        {!selectedYear && !selectedMajor ? (
          <p className="text-gray-500 text-sm">
            Vui lòng chọn Ngành học hoặc Năm học.
          </p>
        ) : selectedMajor && !selectedClass ? (
          <p className="text-gray-500 text-sm">Vui lòng chọn Lớp học.</p>
        ) : selectedClass && !selectedReport ? (
          <p className="text-gray-500 text-sm">Vui lòng chọn Báo cáo.</p>
        ) : // [ĐÃ SỬA] Cập nhật logic hiển thị khi không có submissions
        submissions.length === 0 ? (
          selectedYear ? (
            <p className="text-gray-500 text-sm">
              Không có báo cáo nào tồn tại cho năm {selectedYear}.
            </p>
          ) : (
            <p className="text-gray-500 text-sm">
              Không có bài nộp nào phù hợp.
            </p>
          )
        ) : (
          <>
            <table className="w-full border-collapse text-sm sm:text-base">
              <thead>
                <tr className="bg-blue-100 text-blue-700 text-left">
                  {/* [THÊM MỚI] Cột tên báo cáo */}
                  <th className="p-2">Tên báo cáo</th>
                  <th className="p-2">Mã SV</th>
                  <th className="p-2">Tên sinh viên</th>
                  <th className="p-2">Trạng thái</th>
                  <th className="p-2">Ngày nộp</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((sub, index) => (
                  <tr
                    key={index}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    {/* [THÊM MỚI] Dữ liệu tên báo cáo */}
                    <td className="p-2">{sub.report_name}</td>
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
                      {new Date(sub.submission_time).toLocaleDateString(
                        "vi-VN"
                      )}
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
                className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
              >
                ← Trước
              </button>
              <span className="px-2 text-sm text-gray-700">
                Trang {currentPage}/{totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
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

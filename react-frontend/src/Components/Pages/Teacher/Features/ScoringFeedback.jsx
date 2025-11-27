import React, { useState, useEffect } from "react";
import Navbar from "../../../ReUse/Navbar/Navbar";
import Footer from "../../Student/Home/Footer";
import RouterBack from "../../../ReUse/Back/RouterBack";
import { getAuth } from "../../../Constants/INFO_USER";
import {
  Eye,
  Send,
  RefreshCw,
  Download,
  Search,
  Filter,
  Calendar,
  Users,
  BookOpen,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ScoringFeedback() {
  useEffect(() => {
    document.title = "Quản lý chấm điểm & phản hồi";
  }, []);

  // Mock data
  const [majors, setMajors] = useState([
    { major_id: "1", major_name: "Công nghệ thông tin" },
    { major_id: "2", major_name: "Kỹ thuật phần mềm" },
    { major_id: "3", major_name: "Khoa học máy tính" },
  ]);
  const [selectedMajor, setSelectedMajor] = useState("");

  // Tất cả báo cáo cần chấm - sẽ được lọc theo ngành
  const [allReports, setAllReports] = useState([
    {
      submission_id: "1",
      rm_name: "Nhóm 1 - Web Development",
      student_id: "SV001",
      student_name: "Nguyễn Văn A",
      submission_time: "2024-01-15 14:30",
      score: 0,
      file_path: "/reports/report1.pdf",
      status: "pending",
      subject_name: "Lập trình Web",
      class_name: "D20_TH01",
      academic_year: "2023-2024",
      report_name: "Báo cáo giữa kỳ",
      major_id: "1",
    },
    {
      submission_id: "2",
      rm_name: "Nhóm 2 - Database Project",
      student_id: "SV002",
      student_name: "Trần Thị B",
      submission_time: "2024-01-16 09:15",
      score: 0,
      file_path: "/reports/report2.pdf",
      status: "pending",
      subject_name: "Cơ sở dữ liệu",
      class_name: "D20_TH02",
      academic_year: "2023-2024",
      report_name: "Bài tập lớn",
      major_id: "1",
    },
    {
      submission_id: "3",
      rm_name: "Nhóm 3 - AI Research",
      student_id: "SV003",
      student_name: "Lê Văn C",
      submission_time: "2024-01-14 16:45",
      score: 8.5,
      file_path: "/reports/report3.pdf",
      status: "graded",
      subject_name: "Trí tuệ nhân tạo",
      class_name: "D21_TH01",
      academic_year: "2024-2025",
      report_name: "Báo cáo cuối kỳ",
      major_id: "2",
    },
    {
      submission_id: "4",
      rm_name: "Nhóm 4 - Mobile App",
      student_id: "SV004",
      student_name: "Phạm Thị D",
      submission_time: "2024-01-17 11:20",
      score: 0,
      file_path: "/reports/report4.pdf",
      status: "pending",
      subject_name: "Lập trình di động",
      class_name: "D20_TH03",
      academic_year: "2023-2024",
      report_name: "Báo cáo giữa kỳ",
      major_id: "1",
    },
    {
      submission_id: "5",
      rm_name: "Nhóm 5 - Network Security",
      student_id: "SV005",
      student_name: "Hoàng Văn E",
      submission_time: "2024-01-13 13:45",
      score: 7.5,
      file_path: "/reports/report5.pdf",
      status: "graded",
      subject_name: "An toàn mạng",
      class_name: "D21_TH02",
      academic_year: "2024-2025",
      report_name: "Báo cáo thực hành",
      major_id: "3",
    },
  ]);

  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const navigate = useNavigate();
  const { user } = getAuth();
  const idTeacher = user?.user_id ?? "GV001";

  // 🔹 Lọc báo cáo theo ngành được chọn
  const filteredReports = allReports.filter((report) => {
    const matchesMajor = !selectedMajor || report.major_id === selectedMajor;
    const matchesSearch =
      report.rm_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.subject_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "pending" && report.score === 0) ||
      (filterStatus === "graded" && report.score > 0);

    return matchesMajor && matchesSearch && matchesStatus;
  });

  // 🔹 Xử lý chấm điểm
  const handleSubmit = async (submission) => {
    if (!score || !feedback.trim())
      return alert("⚠️ Vui lòng nhập đủ điểm và phản hồi!");

    try {
      setLoading(true);

      // Mock API call
      console.log("Gửi điểm:", {
        submission_id: submission.submission_id,
        teacher_id: idTeacher,
        score: parseFloat(score),
        feedback: feedback.trim(),
      });

      // Cập nhật local state
      setAllReports((prev) =>
        prev.map((report) =>
          report.submission_id === submission.submission_id
            ? { ...report, score: parseFloat(score), status: "graded" }
            : report
        )
      );

      setSuccessMessage(
        `✅ Đã chấm điểm thành công cho ${submission.student_name}`
      );
      resetForm();

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Lỗi khi chấm điểm:", err);
      alert(`❌ Chấm điểm thất bại!`);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Reset form
  const resetForm = () => {
    setSelectedSubmissionId(null);
    setScore("");
    setFeedback("");
  };

  // 🔹 Phân trang
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filteredReports.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);

  // 🔹 Thống kê
  const pendingCount = allReports.filter((r) => r.score === 0).length;
  const gradedCount = allReports.filter((r) => r.score > 0).length;

  return (
    <>
      <Navbar />
      <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
        <RouterBack navigate={navigate} />

        <div className="bg-white shadow-lg rounded-2xl p-4 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                <div className="w-3 h-8 bg-blue-600 rounded-full"></div>
                Quản lý chấm điểm & phản hồi
              </h1>
              <p className="text-gray-600">
                Chấm điểm và gửi phản hồi cho tất cả báo cáo của sinh viên
              </p>
            </div>
          </div>

          {successMessage && (
            <div className="fixed bottom-5 right-5 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg animate-fadeIn z-50 flex items-center gap-2">
              ✅ {successMessage}
            </div>
          )}

          {/* 🔹 Bộ lọc đơn giản - Chỉ chọn ngành */}
          <div className="bg-blue-50 rounded-2xl p-6 mb-8 border border-blue-100">
            <div className="flex items-center gap-2 mb-4">
              <Filter size={20} className="text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-800">
                Lọc báo cáo
              </h2>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
              <div className="flex-1">
                <label className="block mb-2 font-medium text-gray-700 text-sm">
                  Chọn ngành
                </label>
                <select
                  value={selectedMajor}
                  onChange={(e) => {
                    setSelectedMajor(e.target.value);
                    setCurrentPage(1); // Reset về trang 1 khi đổi ngành
                  }}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="">Tất cả ngành</option>
                  {majors.map((m) => (
                    <option key={m.major_id} value={m.major_id}>
                      {m.major_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <label className="block mb-2 font-medium text-gray-700 text-sm">
                  Tìm kiếm
                </label>
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Tìm theo tên nhóm, mã SV, tên SV, môn học..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="w-full sm:w-48">
                <label className="block mb-2 font-medium text-gray-700 text-sm">
                  Trạng thái
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="pending">Chưa chấm</option>
                  <option value="graded">Đã chấm</option>
                </select>
              </div>
            </div>
          </div>

          {/* 🔹 Thống kê nhanh */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
              <div className="text-2xl font-bold text-gray-800">
                {allReports.length}
              </div>
              <div className="text-gray-600 text-sm flex items-center gap-1">
                <BookOpen size={16} />
                Tổng báo cáo
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
              <div className="text-2xl font-bold text-blue-600">
                {filteredReports.length}
              </div>
              <div className="text-gray-600 text-sm flex items-center gap-1">
                <Filter size={16} />
                Đang hiển thị
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
              <div className="text-2xl font-bold text-orange-500">
                {pendingCount}
              </div>
              <div className="text-gray-600 text-sm flex items-center gap-1">
                <Users size={16} />
                Chờ chấm
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
              <div className="text-2xl font-bold text-green-600">
                {gradedCount}
              </div>
              <div className="text-gray-600 text-sm flex items-center gap-1">
                <Send size={16} />
                Đã chấm
              </div>
            </div>
          </div>

          {/* 🔹 Bảng tất cả báo cáo */}
          {currentItems.length > 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr className="text-gray-700 uppercase text-xs">
                      <th className="px-4 py-4 text-left font-semibold">
                        Thông tin nhóm & môn học
                      </th>
                      <th className="px-4 py-4 text-left font-semibold">
                        Thời gian & Lớp
                      </th>
                      <th className="px-4 py-4 text-center font-semibold">
                        Điểm
                      </th>
                      <th className="px-4 py-4 text-center font-semibold">
                        Trạng thái
                      </th>
                      <th className="px-4 py-4 text-center font-semibold">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentItems.map((report) => (
                      <React.Fragment key={report.submission_id}>
                        <tr
                          className={`hover:bg-gray-50 transition-colors ${
                            selectedSubmissionId === report.submission_id
                              ? "bg-blue-50"
                              : ""
                          }`}
                        >
                          <td className="px-4 py-4">
                            <div>
                              <div className="font-semibold text-gray-800 text-base mb-1">
                                {report.rm_name}
                              </div>
                              <div className="text-gray-600 text-sm mb-1">
                                <span className="font-medium">Môn:</span>{" "}
                                {report.subject_name}
                              </div>
                              <div className="text-gray-600 text-sm mb-1">
                                <span className="font-medium">Báo cáo:</span>{" "}
                                {report.report_name}
                              </div>
                              <div className="text-gray-500 text-xs">
                                SV: {report.student_name} (MSSV:{" "}
                                {report.student_id})
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-gray-600 text-sm">
                                <Calendar size={14} />
                                {report.submission_time}
                              </div>
                              <div className="flex items-center gap-1 text-gray-600 text-sm">
                                <Users size={14} />
                                {report.class_name}
                              </div>
                              <div className="text-gray-500 text-xs">
                                Năm: {report.academic_year}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                report.score > 0
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {report.score > 0
                                ? report.score.toFixed(1)
                                : "Chưa chấm"}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                report.score > 0
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-orange-100 text-orange-800"
                              }`}
                            >
                              {report.score > 0 ? "Đã chấm" : "Chờ chấm"}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() =>
                                  window.open(report.file_path, "_blank")
                                }
                                className="flex items-center gap-1 px-3 py-2 text-gray-600 hover:text-blue-600 transition-colors rounded-lg border border-gray-300 hover:border-blue-300"
                                title="Xem báo cáo"
                              >
                                <Eye size={16} />
                                <span className="text-xs">Xem</span>
                              </button>
                              <button
                                onClick={() =>
                                  setSelectedSubmissionId(
                                    selectedSubmissionId ===
                                      report.submission_id
                                      ? null
                                      : report.submission_id
                                  )
                                }
                                className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                                  selectedSubmissionId === report.submission_id
                                    ? "bg-blue-100 text-blue-700 border border-blue-300"
                                    : "bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700 border border-gray-300 hover:border-blue-300"
                                }`}
                              >
                                <Send size={16} />
                                <span className="text-xs">
                                  {selectedSubmissionId === report.submission_id
                                    ? "Đóng"
                                    : "Chấm điểm"}
                                </span>
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* 🔹 Form chấm điểm */}
                        {selectedSubmissionId === report.submission_id && (
                          <tr>
                            <td
                              colSpan="5"
                              className="px-4 py-6 bg-blue-50 border-t border-blue-100"
                            >
                              <div className="max-w-4xl">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                  📝 Chấm điểm cho
                                  <span className="text-blue-600">
                                    {report.student_name}
                                  </span>
                                  -{" "}
                                  <span className="text-gray-700">
                                    {report.rm_name}
                                  </span>
                                </h3>

                                <div className="bg-white rounded-xl p-4 border border-blue-200 mb-4">
                                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="font-medium">
                                        Môn học:
                                      </span>{" "}
                                      {report.subject_name}
                                    </div>
                                    <div>
                                      <span className="font-medium">Lớp:</span>{" "}
                                      {report.class_name}
                                    </div>
                                    <div>
                                      <span className="font-medium">
                                        Báo cáo:
                                      </span>{" "}
                                      {report.report_name}
                                    </div>
                                    <div>
                                      <span className="font-medium">
                                        Năm học:
                                      </span>{" "}
                                      {report.academic_year}
                                    </div>
                                  </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                  <div>
                                    <label className="block mb-2 font-medium text-gray-700">
                                      Điểm số (0 - 10)
                                    </label>
                                    <input
                                      type="number"
                                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                      value={score}
                                      onChange={(e) => setScore(e.target.value)}
                                      min="0"
                                      max="10"
                                      step="0.1"
                                      placeholder="Nhập điểm từ 0 đến 10"
                                    />
                                  </div>
                                  <div className="md:col-span-2">
                                    <label className="block mb-2 font-medium text-gray-700">
                                      Nhận xét & Phản hồi
                                    </label>
                                    <textarea
                                      rows="4"
                                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                      value={feedback}
                                      onChange={(e) =>
                                        setFeedback(e.target.value)
                                      }
                                      placeholder="Nhập nhận xét chi tiết cho bài làm của sinh viên..."
                                    />
                                  </div>
                                </div>

                                <div className="flex flex-wrap gap-3 mt-6">
                                  <button
                                    onClick={() => handleSubmit(report)}
                                    disabled={loading}
                                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <Send size={18} />
                                    {loading
                                      ? "Đang gửi..."
                                      : "Lưu & Gửi phản hồi"}
                                  </button>
                                  <button
                                    onClick={resetForm}
                                    className="flex items-center gap-2 bg-gray-200 text-gray-800 px-6 py-3 rounded-xl hover:bg-gray-300 transition-colors"
                                  >
                                    <RefreshCw size={18} />
                                    Hủy bỏ
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 🔹 Phân trang */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div className="text-gray-600 text-sm">
                      Hiển thị {indexOfFirst + 1}-
                      {Math.min(indexOfLast, filteredReports.length)} của{" "}
                      {filteredReports.length} báo cáo
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Trước
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-4 py-2 border rounded-lg transition-colors ${
                              currentPage === page
                                ? "bg-blue-600 text-white border-blue-600"
                                : "border-gray-300 hover:bg-gray-100"
                            }`}
                          >
                            {page}
                          </button>
                        )
                      )}
                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Sau
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 bg-white border border-gray-200 rounded-2xl">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <div className="text-gray-500 text-lg mb-2">
                Không có báo cáo nào
              </div>
              <div className="text-gray-400 text-sm">
                Hãy thay đổi bộ lọc để tìm kiếm báo cáo cần chấm
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

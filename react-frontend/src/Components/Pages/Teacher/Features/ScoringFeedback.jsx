import React, { useState, useEffect } from "react";
import axios from "../../../../config/axios";
import Navbar from "../../../ReUse/Navbar/Navbar";
import Footer from "../../Student/Home/Footer";
import RouterBack from "../../../ReUse/Back/RouterBack";
import { getAuth } from "../../../Constants/INFO_USER";
import { Eye, Send, RefreshCw, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ScoringFeedback() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [reports, setReports] = useState([]);
  const [selectedReportId, setSelectedReportId] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [successMessage, setSuccessMessage] = useState("");
  const itemsPerPage = 10;
  const navigate = useNavigate();
  const { user } = getAuth();
  const idTeacher = user?.user_id ?? null;

  // === Khởi tạo: lấy CSRF cookie trước khi fetch classes ===
  useEffect(() => {
    const initialize = async () => {
      try {
        // Nếu dùng Sanctum
        await axios.get("/sanctum/csrf-cookie");
        fetchClasses();
      } catch (err) {
        console.error("Không thể lấy CSRF cookie:", err);
      }
    };
    initialize();
  }, []);

  // === Lấy danh sách lớp ===
  const fetchClasses = async () => {
    try {
      const res = await axios.get("/nhhh/classes"); // đã có baseURL + withCredentials từ config
      setClasses(res.data.data || res.data);
    } catch (err) {
      console.error("Lỗi tải danh sách lớp:", err);
    }
  };

  // === Khi chọn lớp, lấy báo cáo ===
  useEffect(() => {
    if (!selectedClass) return;
    fetchReports(selectedClass);
    setSelectedReportId("");
    setSubmissions([]);
  }, [selectedClass]);

  const fetchReports = async (classId) => {
    try {
      const res = await axios.get(`/reports?class_id=${classId}`);
      setReports(res.data.data || res.data);
    } catch (err) {
      console.error("Lỗi tải báo cáo:", err);
    }
  };

  // === Khi chọn report, lấy submissions ===
  useEffect(() => {
    if (!selectedReportId) return;
    fetchSubmissions(selectedReportId);
    setSelectedSubmissionId(null);
  }, [selectedReportId]);

  const fetchSubmissions = async (reportId) => {
    try {
      const res = await axios.get(`/submissionsreport?report_id=${reportId}`);
      setSubmissions(res.data.data || res.data);
    } catch (err) {
      console.error("Lỗi tải submissions:", err);
    }
  };

  // === Mở/đóng form chấm điểm ===
  const handleOpenForm = (sub) => {
    if (selectedSubmissionId === sub.submission_id) {
      setSelectedSubmissionId(null);
      setScore("");
      setFeedback("");
    } else {
      setSelectedSubmissionId(sub.submission_id);
      setScore("");
      setFeedback("");
    }
  };

  // === Chấm điểm & gửi feedback ===
  const handleSubmit = async (submission) => {
    if (score === "" || feedback.trim() === "")
      return alert("⚠️ Vui lòng nhập đủ điểm và phản hồi!");

    try {
      setLoading(true);
      await axios.post("/grades", {
        submission_id: submission.submission_id,
        teacher_id: idTeacher,
        score: parseFloat(score),
        feedback,
      });

      setSuccessMessage(`✅ Đã chấm điểm cho ${submission.student_name}!`);
      setSelectedSubmissionId(null);
      setScore("");
      setFeedback("");
      fetchSubmissions(selectedReportId);

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Lỗi khi chấm điểm:", err);
      alert("❌ Không thể gửi phản hồi!");
    } finally {
      setLoading(false);
    }
  };

  // === Phân trang ===
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = submissions.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(submissions.length / itemsPerPage);

  return (
    <div className="p-4 sm:p-6 bg-gray-100 min-h-screen">
      <Navbar />
      <RouterBack navigate={navigate} />

      <div className="bg-white shadow-md rounded-xl p-4 sm:p-6 relative">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-700">
            🎯 Chấm điểm & Phản hồi
          </h1>
          {selectedSubmissionId && (
            <button
              onClick={() => setSelectedSubmissionId(null)}
              className="flex items-center gap-2 bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 transition text-sm sm:text-base"
            >
              <ArrowLeft size={18} /> Quay lại
            </button>
          )}
        </div>

        {successMessage && (
          <div className="fixed bottom-5 right-5 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg animate-fadeIn z-50">
            {successMessage}
          </div>
        )}

        {/* Chọn lớp */}
        <div className="mb-4">
          <label className="block mb-2 font-medium text-gray-700">Chọn lớp:</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="border p-2 rounded-lg w-full max-w-xs focus:ring focus:ring-blue-300"
          >
            <option value="">-- Chọn lớp --</option>
            {classes.map((cls) => (
              <option key={cls.class_id} value={cls.class_id}>
                {cls.class_name}
              </option>
            ))}
          </select>
        </div>

        {/* Chọn report */}
        {selectedClass && reports.length > 0 && (
          <select
            value={selectedReportId}
            onChange={(e) => setSelectedReportId(e.target.value)}
            className="border p-2 rounded-lg w-full max-w-xs focus:ring focus:ring-blue-300"
          >
            <option value="">-- Chọn báo cáo --</option>
            {reports.map((rep) => (
              <option key={rep.report_id} value={rep.report_id}>
                {rep.report_name}
              </option>
            ))}
          </select>
        )}
        {selectedClass && reports.length === 0 && (
          <p className="text-gray-500 mt-2">Không có báo cáo nào</p>
        )}

        {/* Table submissions */}
        {selectedReportId ? (
          submissions.length > 0 ? (
            <>
              <div className="overflow-x-auto border rounded-lg shadow-sm">
                <table className="w-full text-sm text-left text-gray-600">
                  <thead className="bg-gray-200 text-gray-700 uppercase text-xs">
                    <tr>
                      <th className="px-3 py-2 sm:px-4 sm:py-3">Mã SV</th>
                      <th className="px-3 py-2 sm:px-4 sm:py-3">Tên SV</th>
                      <th className="px-3 py-2 sm:px-4 sm:py-3 hidden md:table-cell">Thời gian nộp</th>
                      <th className="px-3 py-2 sm:px-4 sm:py-3">Trạng thái</th>
                      <th className="px-3 py-2 sm:px-4 sm:py-3 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((sub) => (
                      <React.Fragment key={sub.submission_id}>
                        <tr
                          className={`border-b hover:bg-blue-50 transition ${selectedSubmissionId === sub.submission_id ? "bg-blue-100" : ""}`}
                        >
                          <td className="px-3 py-2 sm:px-4 sm:py-3 font-medium">{sub.student_id}</td>
                          <td className="px-3 py-2 sm:px-4 sm:py-3">{sub.student_name}</td>
                          <td className="px-3 py-2 sm:px-4 sm:py-3 hidden md:table-cell">{sub.submission_time}</td>
                          <td className="px-3 py-2 sm:px-4 sm:py-3 text-blue-600 font-semibold capitalize">{sub.status}</td>
                          <td className="px-3 py-2 sm:px-4 sm:py-3 text-center">
                            <button
                              onClick={() => handleOpenForm(sub)}
                              className="flex items-center gap-1 mx-auto text-blue-600 hover:text-blue-800 transition"
                            >
                              <Eye size={16} />
                              {selectedSubmissionId === sub.submission_id ? "Đóng" : "Xem chi tiết"}
                            </button>
                          </td>
                        </tr>

                        {selectedSubmissionId === sub.submission_id && (
                          <tr className="bg-gray-50 animate-fadeIn">
                            <td colSpan="5" className="p-4 sm:p-5">
                              <div className="border-t pt-4">
                                <h2 className="text-lg font-semibold text-gray-700 mb-2">
                                  📝 Chấm điểm cho: <span className="text-blue-600">{sub.student_name}</span>
                                </h2>
                                <div className="grid sm:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block mb-1 font-medium">Điểm (0 - 10)</label>
                                    <input
                                      type="number"
                                      className="w-full border p-2 rounded-lg focus:ring focus:ring-blue-300"
                                      value={score}
                                      onChange={(e) => setScore(e.target.value)}
                                      min="0"
                                      max="10"
                                      step="0.1"
                                    />
                                  </div>
                                  <div className="sm:col-span-2">
                                    <label className="block mb-1 font-medium">Phản hồi</label>
                                    <textarea
                                      rows="3"
                                      className="w-full border p-2 rounded-lg focus:ring focus:ring-blue-300"
                                      value={feedback}
                                      onChange={(e) => setFeedback(e.target.value)}
                                      placeholder="Nhập nhận xét, hướng dẫn cải thiện..."
                                    />
                                  </div>
                                </div>
                                <div className="mt-4 flex flex-wrap gap-3">
                                  <button
                                    onClick={() => handleSubmit(sub)}
                                    disabled={loading}
                                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                                  >
                                    <Send size={16} /> {loading ? "Đang gửi..." : "Lưu & Gửi phản hồi"}
                                  </button>
                                  <button
                                    onClick={() => setSelectedSubmissionId(null)}
                                    className="flex items-center gap-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                                  >
                                    <RefreshCw size={16} /> Hủy
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

              {/* Phân trang */}
              <div className="flex justify-center mt-6 flex-wrap gap-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 rounded-lg border text-sm font-medium ${currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-white hover:bg-blue-50"}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="text-gray-500 mt-6">Chưa có submissions trong báo cáo này.</div>
          )
        ) : (
          <div className="text-gray-500 mt-6">
            Vui lòng chọn lớp và báo cáo để hiển thị danh sách cần chấm điểm.
          </div>
        )}
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
      <Footer />
    </div>
  );
}

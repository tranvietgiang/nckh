import React, { useState, useEffect } from "react";
import axios from "../../../../config/axios"; // Đảm bảo axios này đã set withCredentials=true
import Navbar from "../../../ReUse/Navbar/Navbar";
import Footer from "../../Student/Home/Footer";
import RouterBack from "../../../ReUse/Back/RouterBack";
import { getAuth } from "../../../Constants/INFO_USER";
import { Eye, Send, RefreshCw, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ScoringFeedback() {
  // State cho 3 cấp
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");

  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");

  const [reports, setReports] = useState([]);
  const [selectedReportId, setSelectedReportId] = useState("");

  // State cho submissions và form
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");

  // State chung
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [successMessage, setSuccessMessage] = useState("");
  const itemsPerPage = 10;
  const navigate = useNavigate();
  const { user } = getAuth();
  const idTeacher = user?.user_id ?? null;

  // === 1. Tải Môn học của Giảng viên khi component mount ===
  useEffect(() => {
    // TÁCH HÀM:
    // Hàm 1: Chỉ fetch môn học (sẽ được gọi sau khi có CSRF)
    const fetchSubjects = async () => {
      try {
        // API mới: Lấy các môn học của giảng viên
        const res = await axios.get("/teacher/subjects");
        setSubjects(res.data || []);
      } catch (err) {
        console.error("Lỗi tải danh sách môn học:", err);
        // LỖI 403 (CORS) CÓ THỂ VẪN XUẤT HIỆN Ở ĐÂY NẾU CHƯA SỬA BACKEND
      }
    };

    // Hàm 2: Hàm khởi tạo, lấy CSRF trước
    const initialize = async () => {
      try {
        // Lấy base URL từ VITE_API_URL (ví dụ: http://.../api -> http://...)
        // VITE_API_URL của bạn phải được set là http://192.168.33.11:8000/api
        const baseUrl = import.meta.env.VITE_API_URL.replace("/api", "");
        
        // Dùng đường dẫn đầy đủ, KHÔNG dùng baseURL của axios instance
        // Bước này để lấy cookie XSRF-TOKEN (Sửa lỗi CSRF Token Mismatch)
        await axios.get(`${baseUrl}/sanctum/csrf-cookie`);

        // Sau khi có cookie, gọi hàm fetch môn học
        fetchSubjects();

      } catch (csrfErr) {
         console.error("LỖI NGHIÊM TRỌNG: Không thể lấy CSRF cookie:", csrfErr);
         console.error("Kiểm tra xem /sanctum/csrf-cookie có hoạt động không và VITE_API_URL có đúng không");
      }
    }

    initialize(); // Gọi hàm khởi tạo
  }, []); // Chỉ chạy 1 lần

  // === 2. Khi chọn Môn học, tải danh sách Lớp ===
  useEffect(() => {
    if (!selectedSubject) {
      setClasses([]); // Xóa danh sách lớp cũ
      setSelectedClass(""); // Reset
      setReports([]); // Xóa báo cáo
      setSelectedReportId("");
      setSubmissions([]); // Xóa nộp bài
      return;
    }

    const fetchClasses = async () => {
      try {
        // API mới: Lấy lớp theo môn học
        const res = await axios.get(`/teacher/classes/${selectedSubject}`);
        setClasses(res.data || []);
      } catch (err) {
        console.error("Lỗi tải danh sách lớp:", err);
      }
    };

    fetchClasses();
    // Reset các dropdown con
    setSelectedClass("");
    setReports([]);
    setSelectedReportId("");
    setSubmissions([]);
  }, [selectedSubject]); // Chạy khi 'selectedSubject' thay đổi

  // === 3. Khi chọn Lớp, tải danh sách Báo cáo ===
  useEffect(() => {
    if (!selectedClass) {
      setReports([]); // Xóa báo cáo cũ
      setSelectedReportId(""); // Reset
      setSubmissions([]); // Xóa nộp bài
      return;
    }

    const fetchReports = async () => {
      try {
        // API mới: Lấy báo cáo theo lớp
        const res = await axios.get(`/teacher/reports/${selectedClass}`);
        setReports(res.data || []);
      } catch (err) {
        console.error("Lỗi tải báo cáo:", err);
      }
    };

    fetchReports();
    // Reset dropdown con
    setSelectedReportId("");
    setSubmissions([]);
  }, [selectedClass]); // Chạy khi 'selectedClass' thay đổi

  // === 4. Khi chọn Báo cáo, tải danh sách Submissions ===
  useEffect(() => {
    if (!selectedReportId) {
      setSubmissions([]); // Xóa submissions cũ
      return;
    }

    const fetchSubmissions = async () => {
      try {
        // API mới: Lấy submissions theo báo cáo
        const res = await axios.get(`/teacher/submissions/${selectedReportId}`);
        setSubmissions(res.data || []);
      } catch (err) {
        console.error("Lỗi tải submissions:", err);
      }
    };

    fetchSubmissions();
    setSelectedSubmissionId(null); // Đóng form chấm điểm cũ (nếu có)
  }, [selectedReportId]); // Chạy khi 'selectedReportId' thay đổi

  // === Mở/đóng form chấm điểm ===
  const handleOpenForm = (sub) => {
    if (selectedSubmissionId === sub.submission_id) {
      setSelectedSubmissionId(null);
      setScore("");
      setFeedback("");
    } else {
      setSelectedSubmissionId(sub.submission_id);
      setScore(""); // Reset score/feedback cũ
      setFeedback("");
    }
  };

  // === Chấm điểm & gửi feedback ===
  const handleSubmit = async (submission) => {
    if (score === "" || feedback.trim() === "")
      return alert("⚠️ Vui lòng nhập đủ điểm và phản hồi!"); // Cân nhắc đổi alert sang modal

    try {
      setLoading(true);
      // API này bạn cần đảm bảo nó cũng có trong file routes/api.php
      await axios.post("/grades", { 
        submission_id: submission.submission_id,
        teacher_id: idTeacher,
        score: parseFloat(score),
        feedback,
      });

      setSuccessMessage(`✅ Đã chấm điểm cho ${submission.student_name}!`);
      setSelectedSubmissionId(null); // Đóng form
      setScore("");
      setFeedback("");

      // Tải lại submissions để cập nhật trạng thái
      const res = await axios.get(`/teacher/submissions/${selectedReportId}`);
      setSubmissions(res.data || []);

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Lỗi khi chấm điểm:", err);
      // Lỗi "CSRF token mismatch" thường xảy ra ở đây
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

        {/* Cập nhật JSX: 3 Dropdowns */}
        <div className="flex flex-wrap gap-4 mb-4">
          {/* 1. Chọn Môn học */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">1. Chọn môn học:</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="border p-2 rounded-lg w-full max-w-xs focus:ring focus:ring-blue-300"
            >
              <option value="">-- Chọn môn học --</option>
              {subjects.map((sub) => (
                <option key={sub.subject_id} value={sub.subject_id}>
                  {sub.subject_name} ({sub.subject_code})
                </option>
              ))}
            </select>
          </div>

          {/* 2. Chọn lớp (chỉ active khi đã chọn môn) */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">2. Chọn lớp:</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="border p-2 rounded-lg w-full max-w-xs focus:ring focus:ring-blue-300"
              disabled={!selectedSubject || classes.length === 0} // Disabled nếu chưa chọn môn
            >
              <option value="">-- Chọn lớp --</option>
              {classes.map((cls) => (
                <option key={cls.class_id} value={cls.class_id}>
                  {cls.class_name}
                </option>
              ))}
            </select>
            {!selectedSubject && <p className="text-xs text-gray-400 mt-1">Vui lòng chọn môn học</p>}
            {selectedSubject && classes.length === 0 && <p className="text-xs text-gray-400 mt-1">Không có lớp</p>}
          </div>

          {/* 3. Chọn report (chỉ active khi đã chọn lớp) */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">3. Chọn báo cáo:</label>
            <select
              value={selectedReportId}
              onChange={(e) => setSelectedReportId(e.target.value)}
              className="border p-2 rounded-lg w-full max-w-xs focus:ring focus:ring-blue-300"
              disabled={!selectedClass || reports.length === 0} // Disabled nếu chưa chọn lớp
            >
              <option value="">-- Chọn báo cáo --</option>
              {reports.map((rep) => (
                <option key={rep.report_id} value={rep.report_id}>
                  {rep.report_name}
                </option>
              ))}
            </select>
            {!selectedClass && <p className="text-xs text-gray-400 mt-1">Vui lòng chọn lớp</p>}
            {selectedClass && reports.length === 0 && <p className="text-xs text-gray-400 mt-1">Không có báo cáo</p>}
          </div>
        </div>

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
            Vui lòng chọn Môn học, Lớp, và Báo cáo để hiển thị danh sách.
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
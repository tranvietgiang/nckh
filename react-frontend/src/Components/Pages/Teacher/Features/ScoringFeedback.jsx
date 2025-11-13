import React, { useState, useEffect } from "react";
import axios from "../../../../config/axios";
import Navbar from "../../../ReUse/Navbar/Navbar";
import Footer from "../../Student/Home/Footer";
import RouterBack from "../../../ReUse/Back/RouterBack";
import { getAuth } from "../../../Constants/INFO_USER";
import { Eye, Send, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ScoringFeedback() {
  useEffect(() => {
    document.title = "Quản lý chấm điểm & phản hồi";
  }, []);

  const [majors, setMajors] = useState([]);
  const [selectedMajor, setSelectedMajor] = useState("");

  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");

  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");

  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");

  const [reports, setReports] = useState([]);
  const [selectedReportId, setSelectedReportId] = useState("");

  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();
  const { user } = getAuth();
  const idTeacher = user?.user_id ?? null;

  // === 1️⃣ Lấy danh sách ngành của giảng viên ===
  useEffect(() => {
    const fetchMajors = async () => {
      try {
        const res = await axios.get(`/major-by-teacher/${idTeacher}`);
        setMajors(res.data || []);
      } catch (err) {
        console.error("Lỗi tải danh sách ngành:", err);
        setMajors([]);
      }
    };
    fetchMajors();
  }, []);

  // === 2️⃣ Khi chọn ngành → tải danh sách môn học ===
  useEffect(() => {
    if (!selectedMajor) {
      setSubjects([]);
      setSelectedSubject("");
      setClasses([]);
      setSelectedClass("");
      setYears([]);
      setSelectedYear("");
      setReports([]);
      setSelectedReportId("");
      setSubmissions([]);
      return;
    }

    const fetchSubjects = async () => {
      try {
        const res = await axios.get(
          `/getSubject-major-class-teacher/${selectedMajor}`
        );
        setSubjects(res.data || []);
      } catch (err) {
        console.error("Lỗi tải môn học:", err);
        setSubjects([]);
      }
    };
    fetchSubjects();
  }, [selectedMajor]);

  // === 3️⃣ Khi chọn môn học → tải danh sách lớp ===
  useEffect(() => {
    if (!selectedSubject) {
      setClasses([]);
      setSelectedClass("");
      setYears([]);
      setSelectedYear("");
      setReports([]);
      setSelectedReportId("");
      setSubmissions([]);
      return;
    }

    const fetchClasses = async () => {
      try {
        const res = await axios.get(
          `/classes-by-subject/${selectedMajor}/${selectedSubject}`
        );
        setClasses(res.data || []);
      } catch (err) {
        console.error("Lỗi tải lớp:", err);
        setClasses([]);
      }
    };
    fetchClasses();
  }, [selectedSubject]);

  // === 4️⃣ Khi chọn lớp → tải danh sách năm học ===
  useEffect(() => {
    if (!selectedClass) {
      setYears([]);
      setSelectedYear("");
      setReports([]);
      setSelectedReportId("");
      setSubmissions([]);
      return;
    }

    const fetchYears = async () => {
      try {
        const res = await axios.get(`/years-by-class/${selectedClass}`);
        setYears(res.data || []);
      } catch (err) {
        console.log("Lỗi tải năm học:", err);
        setYears([]);
      }
    };
    fetchYears();
  }, [selectedClass]);

  // === 5️⃣ Khi chọn năm học → tải danh sách báo cáo ===
  useEffect(() => {
    if (!selectedYear) {
      setReports([]);
      setSelectedReportId("");
      setSubmissions([]);
      return;
    }

    const fetchReports = async () => {
      try {
        const res = await axios.get(
          `/reports-filter/${selectedMajor}/${selectedSubject}/${selectedClass}/${selectedYear}`
        );
        setReports(res.data || []);
      } catch (err) {
        console.error("Lỗi tải báo cáo:", err);
        setReports([]);
      }
    };
    fetchReports();
  }, [selectedYear]);

  // === 6️⃣ Khi chọn báo cáo → tải danh sách submissions ===
  useEffect(() => {
    if (!selectedReportId) {
      setSubmissions([]);
      return;
    }

    const fetchSubmissions = async () => {
      try {
        const res = await axios.get(
          `/submission-filter/${selectedMajor}/${selectedSubject}/${selectedClass}/${selectedYear}/${selectedReportId}`
        );
        setSubmissions(res.data || []);
      } catch (err) {
        console.error("Lỗi tải submissions:", err);
        setSubmissions([]);
      }
    };
    fetchSubmissions();
  }, [selectedReportId]);

  // === Gửi điểm & phản hồi ===
  const handleSubmit = async (submission) => {
    if (!score || !feedback.trim())
      return alert("⚠️ Vui lòng nhập đủ điểm và phản hồi!");

    try {
      setLoading(true);

      await axios.post("/grades/update", {
        submission_id: submission.submission_id,
        teacher_id: idTeacher,
        report_id: selectedReportId,
        class_id: selectedClass,
        subject_id: selectedSubject,
        major_id: selectedMajor,
        academic_year: selectedYear,
        score: parseFloat(score),
        feedback: feedback.trim(),
      });

      setSuccessMessage(`✅ Đã chấm điểm thành công`);
      setSelectedSubmissionId(null);
      setScore("");
      setFeedback("");

      // Refresh list
      const refresh = await axios.get(
        `/submission-filter/${selectedMajor}/${selectedSubject}/${selectedClass}/${selectedYear}/${selectedReportId}`
      );
      setSubmissions(refresh.data || []);

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Lỗi khi chấm điểm:", err);
      alert(`❌ ${err.response?.data?.message || "Chấm điểm thất bại!"}`);
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
    <>
      <Navbar />
      <div className="p-4 sm:p-6 bg-gray-100 min-h-screen">
        <RouterBack navigate={navigate} />

        <div className="bg-white shadow-md rounded-xl p-4 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-700 mb-6 flex items-center gap-2">
            📊 Quản lý chấm điểm & phản hồi
          </h1>

          {successMessage && (
            <div className="fixed bottom-5 right-5 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg animate-fadeIn z-50">
              {successMessage}
            </div>
          )}

          {/* 🔹 Bộ lọc 4 cấp */}
          <div className="flex flex-wrap gap-4 mb-6">
            {/* Ngành */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                1️⃣ Ngành học:
              </label>
              <select
                value={selectedMajor}
                onChange={(e) => setSelectedMajor(e.target.value)}
                className="border p-2 rounded-lg w-full max-w-xs focus:ring focus:ring-blue-300"
              >
                <option value="">-- Chọn ngành --</option>
                {majors.map((m) => (
                  <option key={m.major_id} value={m.major_id}>
                    {m.major_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Môn học */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                2️⃣ Môn học:
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="border p-2 rounded-lg w-full max-w-xs focus:ring focus:ring-blue-300"
                disabled={!selectedMajor}
              >
                <option value="">-- Chọn môn học --</option>
                {subjects.map((s) => (
                  <option key={s.subject_id} value={s.subject_id}>
                    {s.subject_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Lớp */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                3️⃣ Lớp học:
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="border p-2 rounded-lg w-full max-w-xs focus:ring focus:ring-blue-300"
                disabled={!selectedSubject}
              >
                <option value="">-- Chọn lớp học --</option>
                {classes.map((c) => (
                  <option key={c.class_id} value={c.class_id}>
                    {c.class_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Năm học */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                4️⃣ Năm học:
              </label>
              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                }}
                className="border p-2 rounded-lg w-full max-w-xs focus:ring focus:ring-blue-300"
                disabled={!selectedClass}
              >
                <option value="">-- Chọn năm học --</option>
                {years.map((y) => (
                  <option key={y.year_id} value={y.year_id}>
                    {y.academic_year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Báo cáo */}
          {selectedYear && (
            <div className="mb-6">
              <label className="block mb-2 font-medium text-gray-700">
                5️⃣ Báo cáo:
              </label>
              <select
                value={selectedReportId}
                onChange={(e) => setSelectedReportId(e.target.value)}
                className="border p-2 rounded-lg w-full max-w-xs focus:ring focus:ring-blue-300"
              >
                <option value="">-- Chọn báo cáo --</option>
                {reports.map((r) => (
                  <option key={r.report_id} value={r.report_id}>
                    {r.report_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Bảng submissions */}
          {selectedReportId ? (
            submissions.length > 0 ? (
              <>
                <div className="overflow-x-auto border rounded-lg shadow-sm">
                  <table className="w-full text-sm text-left text-gray-600">
                    <thead className="bg-gray-200 text-gray-700 uppercase text-xs">
                      <tr>
                        <th className="px-3 py-2">Tên nhóm</th>
                        <th className="px-3 py-2">Mã SV nhóm trưởng</th>
                        <th className="px-3 py-2">Thời gian nộp</th>
                        <th className="px-3 py-2">Trạng thái</th>
                        <th className="px-3 py-2 text-center">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.map((sub) => (
                        <React.Fragment key={sub.submission_id}>
                          <tr
                            className={`border-b hover:bg-blue-50 transition ${
                              selectedSubmissionId === sub.submission_id
                                ? "bg-blue-100"
                                : ""
                            }`}
                          >
                            <td className="px-3 py-2 font-medium">
                              {sub?.rm_name ?? "N/A"}
                            </td>
                            <td className="px-3 py-2">{sub.student_id}</td>
                            <td className="px-3 py-2">{sub.submission_time}</td>
                            <td className="px-3 py-2 text-blue-600 font-semibold">
                              {sub.score === 0 ? "Chưa chấm" : ""}
                            </td>
                            <td className="px-3 py-2 text-center">
                              <button
                                onClick={() =>
                                  setSelectedSubmissionId(
                                    selectedSubmissionId === sub.submission_id
                                      ? null
                                      : sub.submission_id
                                  )
                                }
                                className="flex items-center gap-1 mx-auto text-blue-600 hover:text-blue-800 transition"
                              >
                                <Eye size={16} />
                                {selectedSubmissionId === sub.submission_id
                                  ? "Đóng"
                                  : "Xem chi tiết"}
                              </button>
                            </td>
                          </tr>
                          <a
                            href={sub?.file_path ?? ""}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Xem báo cáo
                          </a>

                          {selectedSubmissionId === sub.submission_id && (
                            <tr className="bg-gray-50">
                              <td colSpan="5" className="p-4">
                                <div className="border-t pt-4">
                                  <h2 className="text-lg font-semibold text-gray-700 mb-2">
                                    📝 Chấm điểm cho{" "}
                                    <span className="text-blue-600">
                                      {sub.student_name}
                                    </span>
                                  </h2>
                                  <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                      <label className="block mb-1 font-medium">
                                        Điểm (0 - 10)
                                      </label>
                                      <input
                                        type="number"
                                        className="w-full border p-2 rounded-lg focus:ring focus:ring-blue-300"
                                        value={score}
                                        onChange={(e) =>
                                          setScore(e.target.value)
                                        }
                                        min="0"
                                        max="10"
                                        step="0.1"
                                      />
                                    </div>
                                    <div className="sm:col-span-2">
                                      <label className="block mb-1 font-medium">
                                        Phản hồi
                                      </label>
                                      <textarea
                                        rows="3"
                                        className="w-full border p-2 rounded-lg focus:ring focus:ring-blue-300"
                                        value={feedback}
                                        onChange={(e) =>
                                          setFeedback(e.target.value)
                                        }
                                        placeholder="Nhập nhận xét..."
                                      />
                                    </div>
                                  </div>
                                  <div className="mt-4 flex gap-3">
                                    <button
                                      onClick={() => handleSubmit(sub)}
                                      disabled={loading}
                                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                                    >
                                      <Send size={16} />{" "}
                                      {loading
                                        ? "Đang gửi..."
                                        : "Lưu & Gửi phản hồi"}
                                    </button>
                                    <button
                                      onClick={() =>
                                        setSelectedSubmissionId(null)
                                      }
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
              </>
            ) : (
              <div className="text-gray-500 mt-6">
                Chưa có submissions trong báo cáo này.
              </div>
            )
          ) : (
            <div className="text-gray-500 mt-6">
              Vui lòng chọn Ngành → Môn → Lớp → Năm → Báo cáo.
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

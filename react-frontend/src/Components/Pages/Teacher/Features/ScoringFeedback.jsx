import React, { useState, useEffect } from "react";
import Navbar from "../../../ReUse/Navbar/Navbar";
import Footer from "../../Student/Home/Footer";
import RouterBack from "../../../ReUse/Back/RouterBack";
import { getAuth } from "../../../Constants/INFO_USER";
import axios from "../../../../config/axios";
import {
  Eye,
  Send,
  RefreshCw,
  Filter,
  Calendar,
  Users,
  BookOpen,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ScoringFeedbackBySubject() {
  const navigate = useNavigate();
  const { user } = getAuth();

  useEffect(() => {
    document.title = "Chấm điểm theo môn học";
  }, []);

  // ===================== STATE =====================
  const [majors, setMajors] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [reportGroups, setReportGroups] = useState([]); // [{report_id, report_name, classes:[...]}]

  const [selectedMajor, setSelectedMajor] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  const [expandedClassKey, setExpandedClassKey] = useState(null);
  const [classSubmissions, setClassSubmissions] = useState({});

  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");


  // ===================== LOAD NGÀNH (MẪU) =====================
  const fetchMajors = async () => {
    try {
      const response = await axios.get(`/major-by-teacher/${user?.user_id}`);
      setMajors(response.data || []);
    } catch (err) {
      setMajors([]);
      console.log(err);
    }
  };
  useEffect(() => {
    fetchMajors();
  }, []);

  // ===================== LOAD MÔN THEO NGÀNH (MẪU) =====================
  useEffect(() => {
    if (!selectedMajor) {
      setSubjects([]);
      setReportGroups([]);
      return;
    }

    axios
      .get(`/getSubject-major-class-teacher/${selectedMajor}`)
      .then((res) => {
        setSubjects(res.data || []);
      })
      .catch((err) => {
        setSubjects([]);
        console.log(err);
      });
    setReportGroups([]);
  }, [selectedMajor]);

  // ===================== TẢI DANH SÁCH REPORT THEO MÔN (MẪU) =====================
  useEffect(() => {
    if (!selectedMajor || !selectedSubject) {
      setReportGroups([]);
      return;
    }

    axios
      .get(`/reports-filter/${selectedMajor}/${selectedSubject}`)
      .then((res) => {
        setReportGroups(res.data || []);
        console.log(res.data); // Reset lại state
        setClassSubmissions({});
        setExpandedClassKey(null);
        setSelectedSubmissionId(null);
      })
      .catch((err) => {
        setReportGroups([]);
        console.log(err);
      });
  }, [selectedMajor, selectedSubject]);

  // ===================== MỞ / ĐÓNG LỚP + LOAD SUBMISSION =====================
  const handleToggleClass = async (report, cls) => {
    const key = `${report.report_id}-${cls.class_id}`;

    // Nếu đang mở → đóng
    if (expandedClassKey === key) {
      setExpandedClassKey(null);
      return;
    }

    // Mở class
    setExpandedClassKey(key);

    // Nếu đã load trước đó → không load lại
    if (classSubmissions[key]) return;

    try {
      const res = await axios.get(
        `/teacher/reports/${report.report_id}/classes/${cls.class_id}/submissions`
      );

      setClassSubmissions((prev) => ({
        ...prev,
        [key]: res.data || [],
      }));

      console.log(res.data);
    } catch (err) {
      console.log("Lỗi load submissions:", err);

      setClassSubmissions((prev) => ({
        ...prev,
        [key]: [], // Không crash UI
      }));
    }
  };

  // ===================== GỬI ĐIỂM =====================
  const handleSubmitScore = async (report, cls, submission) => {
    if (!score || !feedback.trim()) {
      alert("⚠️ Vui lòng nhập đầy đủ điểm và phản hồi!");
      return;
    }

    const key = `${report.report_id}-${cls.class_id}`;

    try {
      setLoading(true);

      // ============================
      // 🔥 GỬI API CHẤM ĐIỂM
      // ============================
      const res = await axios.post("/grades/update", {
        submission_id: submission.submission_id,
        report_id: report.report_id,
        score: score,
        feedback: feedback,
      });

      console.log("Đã chấm:", res.data);

      // ============================
      // 🔥 CẬP NHẬT UI LOCAL
      // ============================
      setClassSubmissions((prev) => ({
        ...prev,
        [key]: prev[key].map((s) =>
          s.submission_id === submission.submission_id
            ? { ...s, score: parseFloat(score) } // cập nhật ngay trên UI
            : s
        ),
      }));

      setSuccessMessage(
        submission.score > 0
          ? `Đã cập nhật điểm cho ${submission.rm_name}`
          : `Đã chấm nhóm ${submission.rm_name}`
      );

      // Reset form
      setSelectedSubmissionId(null);
      setScore("");
      setFeedback("");

      setTimeout(() => setSuccessMessage(""), 2000);
    } catch (err) {
      console.log("Lỗi khi chấm bài:", err);
      alert(err.response?.data?.message || "Đã xảy ra lỗi khi chấm bài.");
    } finally {
      setLoading(false);
    }
  };

  // ===================== SUMMARY =====================
  const allSubs = Object.values(classSubmissions).flat();
  const pending = allSubs.filter((s) => !s.score || s.score === 0).length;
  const graded = allSubs.filter((s) => s.score > 0).length;

  // ===================== UI =====================
  return (
    <>
      <Navbar />

      <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
        <RouterBack navigate={navigate} />

        {successMessage && (
          <div className="fixed bottom-5 right-5 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg">
            {successMessage}
          </div>
        )}

        <div className="bg-white shadow-lg rounded-2xl p-6">
          <h1 className="text-2xl font-bold mb-6 flex items-center gap-3">
            Chấm điểm theo môn
          </h1>

          {/* FILTER */}
          <div className="bg-blue-50 p-5 rounded-2xl border mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="text-blue-600" />
              <span className="font-semibold">Chọn ngành & môn học</span>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Ngành */}
              <select
                value={selectedMajor}
                onChange={(e) => setSelectedMajor(e.target.value)}
                className="p-3 border rounded-xl"
              >
                <option value="">-- Chọn ngành --</option>
                {majors.map((m) => (
                  <option key={m.major_id} value={m.major_id}>
                    {m.major_name}
                  </option>
                ))}
              </select>

              {/* Môn */}
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="p-3 border rounded-xl"
                disabled={!selectedMajor}
              >
                <option value="">-- Chọn môn học --</option>
                {subjects.map((s) => (
                  <option key={s.subject_id} value={s.subject_id}>
                    {s?.subject_name} - {s?.class_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* SUMMARY */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <StatBox
              label="Tổng báo cáo"
              value={reportGroups.length}
              icon={<BookOpen />}
            />
            <StatBox
              label="Đã chấm"
              value={graded}
              icon={<Send />}
              color="green"
            />
            <StatBox
              label="Chờ chấm"
              value={pending}
              icon={<Users />}
              color="orange"
            />
          </div>

          {/* DANH SÁCH BÁO CÁO */}
          {selectedMajor && selectedSubject ? (
            reportGroups.length > 0 ? (
              <div className="space-y-6">
                {reportGroups.map((report) => (
                  <div
                    key={report.report_id}
                    className="border rounded-2xl shadow-sm"
                  >
                    <div className="px-4 py-3 bg-gray-100 border-b">
                      <h2 className="font-semibold text-lg">
                        📄 Báo cáo:{" "}
                        <span className="text-blue-700">
                          {report.report_name}
                        </span>
                      </h2>
                    </div>

                    {/* CLASS LIST */}
                    {report.classes.map((cls) => {
                      const key = `${report.report_id}-${cls.class_id}`;
                      const submissions = classSubmissions[key] || [];
                      const isOpen = expandedClassKey === key;

                      return (
                        <div
                          key={cls.class_id}
                          className="border-b last:border-0"
                        >
                          <button
                            onClick={() => handleToggleClass(report, cls)}
                            className="w-full px-4 py-3 flex justify-between hover:bg-gray-50"
                          >
                            <div className="flex items-center gap-3">
                              {isOpen ? <ChevronDown /> : <ChevronRight />}
                              <div>
                                <div className="font-semibold">
                                  Lớp {cls.class_name}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  Tổng nhóm: {cls.total_submissions}
                                </div>
                              </div>
                            </div>
                          </button>

                          {/* SUBMISSIONS */}
                          {isOpen && (
                            <div className="bg-blue-50 p-4">
                              {submissions.length > 0 ? (
                                <table className="w-full bg-white border rounded-xl overflow-hidden">
                                  <thead className="bg-gray-100 text-gray-600 text-xs uppercase">
                                    <tr>
                                      <th className="p-3 text-left">Nhóm</th>
                                      <th className="p-3 text-left">
                                        SV trưởng
                                      </th>
                                      <th className="p-3 text-left">
                                        Thời gian
                                      </th>
                                      <th className="p-3 text-center">Điểm</th>
                                      <th className="p-3 text-center">
                                        Thao tác
                                      </th>
                                    </tr>
                                  </thead>

                                  <tbody className="divide-y">
                                    {submissions.map((sub) => {
                                      // 🔥 Key duy nhất cho từng nhóm (kể cả nhóm chưa nộp)
                                      const uniqueKey = `${report.report_id}-${
                                        cls.class_id
                                      }-${sub.student_id || sub.rm_name}`;

                                      return (
                                        <React.Fragment key={uniqueKey}>
                                          <tr
                                            className={
                                              selectedSubmissionId === uniqueKey
                                                ? "bg-blue-50"
                                                : ""
                                            }
                                          >
                                            <td className="p-3 font-semibold">
                                              {sub.rm_name}
                                            </td>

                                            <td className="p-3">
                                              {sub.student_name ? (
                                                <>
                                                  {sub.student_name} (
                                                  {sub.student_id})
                                                </>
                                              ) : (
                                                <span className="text-gray-400 italic">
                                                  Chưa có nhóm trưởng
                                                </span>
                                              )}
                                            </td>

                                            <td className="p-3 flex items-center gap-2">
                                              <Calendar size={14} />{" "}
                                              {sub.submission_time ||
                                                "Chưa nộp"}
                                            </td>

                                            <td className="p-3 text-center">
                                              {sub.score ? (
                                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                                                  {sub.score}
                                                </span>
                                              ) : (
                                                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                                                  Chưa chấm
                                                </span>
                                              )}
                                            </td>

                                            <td className="p-3 text-center">
                                              <div className="flex justify-center gap-2">
                                                <button
                                                  onClick={() =>
                                                    sub.file_path &&
                                                    window.open(sub.file_path)
                                                  }
                                                  disabled={!sub.file_path}
                                                  className="px-3 py-1 border rounded-lg text-xs flex items-center gap-1 disabled:opacity-40"
                                                >
                                                  <Eye size={14} /> Xem
                                                </button>

                                                <button
                                                  onClick={() =>
                                                    setSelectedSubmissionId(
                                                      selectedSubmissionId ===
                                                        uniqueKey
                                                        ? null
                                                        : uniqueKey
                                                    )
                                                  }
                                                  className="px-3 py-1 border rounded-lg text-xs flex items-center gap-1"
                                                >
                                                  <Send size={14} />

                                                  {selectedSubmissionId ===
                                                  uniqueKey
                                                    ? "Đóng"
                                                    : sub.score > 0
                                                    ? "Cập nhật"
                                                    : "Chấm"}
                                                </button>
                                              </div>
                                            </td>
                                          </tr>

                                          {/* FORM CHẤM ĐIỂM */}
                                          {selectedSubmissionId ===
                                            uniqueKey && (
                                            <tr>
                                              <td
                                                colSpan="5"
                                                className="bg-blue-50 p-4"
                                              >
                                                <h4 className="font-semibold mb-3">
                                                  Chấm điểm cho{" "}
                                                  {sub.student_name ||
                                                    sub.rm_name}
                                                </h4>

                                                <div className="grid md:grid-cols-2 gap-4">
                                                  <input
                                                    type="number"
                                                    min="0"
                                                    max="10"
                                                    step="0.1"
                                                    value={score}
                                                    onChange={(e) =>
                                                      setScore(e.target.value)
                                                    }
                                                    className="border p-3 rounded-xl"
                                                    placeholder="Điểm (0 - 10)"
                                                  />

                                                  <textarea
                                                    rows={3}
                                                    value={feedback}
                                                    onChange={(e) =>
                                                      setFeedback(
                                                        e.target.value
                                                      )
                                                    }
                                                    className="border p-3 rounded-xl md:col-span-2"
                                                    placeholder="Phản hồi..."
                                                  />

                                                  <div className="flex gap-3">
                                                    <button
                                                      className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm"
                                                      onClick={() =>
                                                        handleSubmitScore(
                                                          report,
                                                          cls,
                                                          sub
                                                        )
                                                      }
                                                      disabled={loading}
                                                    >
                                                      {loading
                                                        ? "Đang gửi..."
                                                        : "Lưu & Gửi"}
                                                    </button>

                                                    <button
                                                      className="bg-gray-200 text-gray-800 px-5 py-2 rounded-xl text-sm flex items-center gap-1"
                                                      onClick={() => {
                                                        setSelectedSubmissionId(
                                                          null
                                                        );
                                                        setScore("");
                                                        setFeedback("");
                                                      }}
                                                    >
                                                      <RefreshCw size={14} />{" "}
                                                      Hủy
                                                    </button>
                                                  </div>
                                                </div>
                                              </td>
                                            </tr>
                                          )}
                                        </React.Fragment>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              ) : (
                                <p className="text-sm text-gray-500">
                                  Chưa có nhóm nào nộp.
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                Không có báo cáo cho môn này.
              </p>
            )
          ) : (
            <p className="text-center text-gray-500 py-8">
              Vui lòng chọn Ngành & Môn học.
            </p>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}

// ===================== COMPONENT THỐNG KÊ =====================
function StatBox({ label, value, icon, color = "blue" }) {
  const colors = {
    blue: "text-blue-600",
    orange: "text-orange-600",
    green: "text-green-600",
  };

  return (
    <div className="bg-white border p-4 rounded-2xl shadow-sm">
      <div className={`text-2xl font-bold ${colors[color]}`}>{value}</div>
      <div className="text-gray-600 text-sm flex items-center gap-1">
        {icon} {label}
      </div>
    </div>
  );
}

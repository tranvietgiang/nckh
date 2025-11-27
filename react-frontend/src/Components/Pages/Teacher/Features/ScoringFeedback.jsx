import React, { useState, useEffect } from "react";
import Navbar from "../../../ReUse/Navbar/Navbar";
import Footer from "../../Student/Home/Footer";
import RouterBack from "../../../ReUse/Back/RouterBack";
import { getAuth } from "../../../Constants/INFO_USER";
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
  const idTeacher = user?.user_id ?? null;

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

  // ===================== DỮ LIỆU MẪU =====================
  const fakeReports = [
    {
      report_id: 1,
      report_name: "Chương 2 – Phân tích hệ thống",
      classes: [
        { class_id: 5, class_name: "22T1", total_submissions: 5 },
        { class_id: 6, class_name: "22T2", total_submissions: 3 },
      ],
    },
    {
      report_id: 2,
      report_name: "Bài tập lớn OOP",
      classes: [
        { class_id: 5, class_name: "22T1", total_submissions: 4 },
        { class_id: 9, class_name: "22T5", total_submissions: 2 },
      ],
    },
  ];

  const fakeSubmissions = {
    "1-5": [
      {
        submission_id: 1001,
        rm_name: "Nhóm 1",
        student_id: "23211TT1234",
        student_name: "Nguyễn Văn A",
        submission_time: "2025-01-12 13:40",
        file_path: "https://drive/file1.pdf",
        score: 0,
      },
      {
        submission_id: 1002,
        rm_name: "Nhóm 2",
        student_id: "23211TT5678",
        student_name: "Trần Văn B",
        submission_time: "2025-01-12 14:10",
        file_path: "https://drive/file2.pdf",
        score: 8.5,
      },
    ],

    "1-6": [
      {
        submission_id: 1010,
        rm_name: "Nhóm 4",
        student_id: "22211TT4455",
        student_name: "Lê Minh C",
        submission_time: "2025-01-13 09:50",
        file_path: "https://drive/file3.pdf",
        score: 0,
      },
    ],

    "2-5": [
      {
        submission_id: 2001,
        rm_name: "Nhóm 1",
        student_id: "23211TT8888",
        student_name: "Phạm Văn D",
        submission_time: "2025-02-01 10:15",
        file_path: "https://drive/file4.pdf",
        score: 7,
      },
    ],

    "2-9": [
      {
        submission_id: 2010,
        rm_name: "Nhóm 3",
        student_id: "24211TT9999",
        student_name: "Võ Hoài Nam",
        submission_time: "2025-02-01 11:00",
        file_path: "https://drive/file5.pdf",
        score: 0,
      },
    ],
  };

  // ===================== LOAD NGÀNH (MẪU) =====================
  useEffect(() => {
    setMajors([
      { major_id: 1, major_name: "Công nghệ thông tin" },
      { major_id: 2, major_name: "Quản trị kinh doanh" },
    ]);
  }, []);

  // ===================== LOAD MÔN THEO NGÀNH (MẪU) =====================
  useEffect(() => {
    if (!selectedMajor) {
      setSubjects([]);
      setReportGroups([]);
      return;
    }

    setSubjects([
      { subject_id: 1, subject_name: "Phân tích thiết kế hệ thống" },
      { subject_id: 2, subject_name: "Lập trình OOP" },
    ]);

    setReportGroups([]);
  }, [selectedMajor]);

  // ===================== TẢI DANH SÁCH REPORT THEO MÔN (MẪU) =====================
  useEffect(() => {
    if (!selectedMajor || !selectedSubject) {
      setReportGroups([]);
      return;
    }

    // Load dữ liệu mẫu
    setReportGroups(fakeReports);

    // Reset lại state
    setClassSubmissions({});
    setExpandedClassKey(null);
    setSelectedSubmissionId(null);
  }, [selectedMajor, selectedSubject]);

  // ===================== MỞ / ĐÓNG LỚP + LOAD SUBMISSION =====================
  const handleToggleClass = (report, cls) => {
    const key = `${report.report_id}-${cls.class_id}`;

    if (expandedClassKey === key) {
      setExpandedClassKey(null);
      return;
    }

    setExpandedClassKey(key);

    // Nếu đã load rồi thì không load lại
    if (classSubmissions[key]) return;

    // Load mẫu
    setClassSubmissions((prev) => ({
      ...prev,
      [key]: fakeSubmissions[key] || [],
    }));
  };

  // ===================== GỬI ĐIỂM =====================
  const handleSubmitScore = (report, cls, submission) => {
    if (!score || !feedback.trim()) {
      alert("⚠️ Vui lòng nhập điểm + phản hồi");
      return;
    }

    const key = `${report.report_id}-${cls.class_id}`;

    setClassSubmissions((prev) => ({
      ...prev,
      [key]: prev[key].map((s) =>
        s.submission_id === submission.submission_id
          ? { ...s, score: parseFloat(score) }
          : s
      ),
    }));

    setSelectedSubmissionId(null);
    setScore("");
    setFeedback("");
    setSuccessMessage(`Đã chấm nhóm ${submission.rm_name}`);

    setTimeout(() => setSuccessMessage(""), 2000);
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
            <div className="w-3 h-8 bg-blue-600 rounded-full" />
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
                    {s.subject_name}
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
                                    {submissions.map((sub) => (
                                      <React.Fragment key={sub.submission_id}>
                                        <tr
                                          className={
                                            selectedSubmissionId ===
                                            sub.submission_id
                                              ? "bg-blue-50"
                                              : ""
                                          }
                                        >
                                          <td className="p-3 font-semibold">
                                            {sub.rm_name}
                                          </td>
                                          <td className="p-3">
                                            {sub.student_name} ({sub.student_id}
                                            )
                                          </td>
                                          <td className="p-3 flex items-center gap-2">
                                            <Calendar size={14} />{" "}
                                            {sub.submission_time}
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
                                                  window.open(
                                                    sub.file_path,
                                                    "_blank"
                                                  )
                                                }
                                                className="px-3 py-1 border rounded-lg text-xs flex items-center gap-1"
                                              >
                                                <Eye size={14} /> Xem
                                              </button>

                                              <button
                                                onClick={() =>
                                                  setSelectedSubmissionId(
                                                    selectedSubmissionId ===
                                                      sub.submission_id
                                                      ? null
                                                      : sub.submission_id
                                                  )
                                                }
                                                className="px-3 py-1 border rounded-lg text-xs flex items-center gap-1"
                                              >
                                                <Send size={14} />
                                                {selectedSubmissionId ===
                                                sub.submission_id
                                                  ? "Đóng"
                                                  : "Chấm"}
                                              </button>
                                            </div>
                                          </td>
                                        </tr>

                                        {/* FORM CHẤM ĐIỂM */}
                                        {selectedSubmissionId ===
                                          sub.submission_id && (
                                          <tr>
                                            <td
                                              colSpan="5"
                                              className="bg-blue-50 p-4"
                                            >
                                              <h4 className="font-semibold mb-3">
                                                Chấm điểm cho {sub.student_name}
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
                                                    setFeedback(e.target.value)
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
                                                    <RefreshCw size={14} />
                                                    Hủy
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

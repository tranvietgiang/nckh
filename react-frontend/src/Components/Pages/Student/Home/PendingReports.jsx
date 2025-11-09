import { useEffect, useState } from "react";
import axios from "../../../../config/axios";
import ReportSubmissionModal from "../Features/ReportSubmissionPage";
import { getUser } from "../../../Constants/INFO_USER";

// 🌀 Hiệu ứng loading
function DotLoading({ text = "Đang tải", color = "gray" }) {
  const dotColor =
    color === "white"
      ? "bg-white"
      : color === "blue"
      ? "bg-blue-500"
      : "bg-gray-500";
  return (
    <div className="inline-flex items-center space-x-2">
      <span>{text}</span>
      <div className="flex items-center space-x-1 ml-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={`${dotColor} w-2 h-2 rounded-full animate-pulse`}
            style={{ animationDelay: `${i * 0.2}s` }}
          ></span>
        ))}
      </div>
    </div>
  );
}

export default function PendingReports() {
  const user = getUser();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [submissionMap, setSubmissionMap] = useState({}); // ✅ lưu trạng thái + file_path

  // 🔹 Lấy danh sách báo cáo
  useEffect(() => {
    axios
      .post("/tvg/get-report-by-student")
      .then((res) => {
        setReports(res.data);
        console.log("📄 Report data:", res.data);
      })
      .catch((error) => {
        console.log("❌ Lỗi khi load report:", error);
      })
      .finally(() => setLoading(false));
  }, []);

  // 🔹 Lấy trạng thái nộp và link file thực tế
  useEffect(() => {
    if (reports.length === 0) return;

    axios
      .get("/tvg/get-submission/submitted")
      .then((res) => {
        const map = {};
        res.data.forEach((item) => {
          map[item.report_id] = {
            status: item.status,
            file_path: item.file_path,
          };
        });
        setSubmissionMap(map);
        console.log("✅ Submission map:", map);
      })
      .catch((error) => {
        console.log("❌ Lỗi khi lấy submission:", error);
      });
  }, [reports]);

  // 🔹 Hàm nộp báo cáo
  const handleSubmit = async (file) => {
    if (!file || !selectedReport) {
      alert("Vui lòng chọn file trước!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("email", user?.email);
    formData.append("report_id", selectedReport.report_id);
    formData.append("teacher_id", selectedReport.teacher_id);

    try {
      setUploading(true);
      const res = await axios.post("/drive-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("✅ Upload thành công:", res.data);
      alert("📤 Nộp báo cáo thành công!");

      window.location.reload();
      setIsModalOpen(false);
      setSelectedReport(null);
    } catch (err) {
      console.error("❌ Upload lỗi:", err.response?.data || err.message);
      alert(err.response?.data?.message_error || "Nộp báo cáo thất bại!");
    } finally {
      setUploading(false);
    }
  };

  // 🔹 Render nút hành động
  const renderActionButton = (report) => {
    const isLeader = report.report_m_role === "NT";
    const submission = submissionMap[report.report_id];
    const isSubmitted = submission?.status === "submitted";

    if (!isLeader) {
      return (
        <div className="space-y-2 mt-4">
          <div className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-center">
            👥 Bạn là thành viên trong nhóm
          </div>
          {isSubmitted && submission.file_path && (
            <a
              href={submission.file_path}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-center"
            >
              🔗 Xem báo cáo đã nộp
            </a>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-2 mt-4">
        {isSubmitted && submission.file_path && (
          <a
            href={submission.file_path}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-center"
          >
            🔗 Xem báo cáo đã nộp
          </a>
        )}
        <button
          onClick={() => {
            setSelectedReport(report);
            setIsModalOpen(true);
          }}
          className={`w-full ${
            isSubmitted
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-red-600 hover:bg-red-700"
          } text-white py-2 px-4 rounded-lg`}
        >
          {isSubmitted ? "📤 Nộp lại báo cáo" : "📤 Nộp báo cáo"}
        </button>
      </div>
    );
  };

  // ===== Render chính =====
  return (
    <div className="max-w-6xl mx-auto bg-gray-50 min-h-screen p-4 rounded-lg shadow-md mt-[10px]">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-900">
        DANH SÁCH BÁO CÁO
      </h1>

      {loading ? (
        <div className="flex justify-center items-center mt-10">
          <DotLoading text="Đang tải danh sách báo cáo..." color="blue" />
        </div>
      ) : reports.length === 0 ? (
        <p className="text-center text-gray-500 italic">
          Không có báo cáo nào cần nộp.
        </p>
      ) : (
        reports.map((report) => {
          const submission = submissionMap[report.report_id];
          const isSubmitted = submission?.status === "submitted";

          return (
            <div key={report.report_id} className="mb-6">
              <div
                className={`border border-gray-300 rounded-lg p-4 transition ${
                  isSubmitted
                    ? "bg-white hover:shadow-md"
                    : "bg-red-50 border-red-300"
                }`}
              >
                <h2 className="font-semibold text-lg mb-2 text-gray-800">
                  {report.report_name}
                </h2>

                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    <strong>Môn học:</strong> {report.report_name}
                  </p>
                  <p>
                    <strong>Giáo viên phụ trách:</strong> {report.teacher_id}
                  </p>
                  <p>
                    <strong>Hạn nộp:</strong>{" "}
                    {new Date(report.end_date).toLocaleDateString("vi-VN")}
                  </p>

                  {report.rm_name ? (
                    <>
                      <p>
                        <strong>Nhóm:</strong> {report.rm_name}
                      </p>
                      <p>
                        <strong>Vai trò:</strong>{" "}
                        <span
                          className={`px-2 font-semibold ${
                            report.report_m_role === "NT"
                              ? "text-blue-600"
                              : report.report_m_role === "NP"
                              ? "text-green-600"
                              : "text-gray-600"
                          }`}
                        >
                          {report.report_m_role === "NT"
                            ? "Nhóm trưởng"
                            : report.report_m_role === "NP"
                            ? "Nhóm phó"
                            : "Thành viên"}
                        </span>
                      </p>
                    </>
                  ) : (
                    <p className="text-red-500 font-medium">
                      🚫 Bạn chưa có nhóm
                    </p>
                  )}

                  {/* ✅ Trạng thái nộp + link xem file */}
                  <p>
                    <strong>Trạng thái nộp:</strong>{" "}
                    <span
                      className={`px-2 font-semibold ${
                        isSubmitted ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {isSubmitted ? "✅ Đã nộp" : "❌ Chưa nộp"}
                    </span>
                  </p>

                  {isSubmitted && submission?.file_path && (
                    <p>
                      <a
                        href={submission.file_path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        🔗 Xem báo cáo đã nộp trên Google Drive
                      </a>
                    </p>
                  )}
                </div>

                {renderActionButton(report)}
              </div>
            </div>
          );
        })
      )}

      <ReportSubmissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        reportData={selectedReport}
      />

      {uploading && (
        <div className="mt-6 flex justify-center">
          <DotLoading text="Đang upload lên Google Drive..." color="blue" />
        </div>
      )}
    </div>
  );
}

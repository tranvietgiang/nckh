import React, { useEffect, useState } from "react";
import axios from "../../../../config/axios";
import ReportSubmissionModal from "../Features/ReportSubmissionPage";
import { getUser } from "../../../Constants/INFO_USER";

// 🌀 Hiệu ứng loading 3 chấm
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
  const [getReport, setReports] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(true);

  // 🔹 Lấy danh sách báo cáo
  useEffect(() => {
    setLoading(true);
    axios
      .get("/get-report")
      .then((res) => {
        setReports(res.data);
        console.log("📄 Report data:", res.data);
      })
      .catch((error) => {
        console.log("❌ Lỗi khi load report:", error);
      })
      .finally(() => setLoading(false));
  }, []);

  // 🔹 Nộp báo cáo
  const handleSubmit = async (file) => {
    if (!file || !selectedReport) {
      alert("Vui lòng chọn file trước!");
      return;
    }

    console.log("File submitted:", file);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("email", user?.email);
    formData.append("report_id", selectedReport.report_id);

    try {
      setUploading(true);
      const res = await axios.post("/drive-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("✅ Upload thành công:", res.data);
      setMessage(res.data.message);
      setLink(res.data.drive_url);

      // Đóng modal + reload danh sách
      setIsModalOpen(false);
      setSelectedReport(null);

      const newReports = await axios.get("/get-report");
      setReports(newReports.data);
    } catch (err) {
      console.error("❌ Upload lỗi:", err.response?.data || err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-gray-50 min-h-screen p-4 rounded-lg shadow-md mt-[10px]">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-900">
        DANH SÁCH BÁO CÁO CHƯA NỘP
      </h1>

      {/* 🔹 Hiệu ứng loading khi fetch */}
      {loading ? (
        <div className="flex justify-center items-center mt-10">
          <DotLoading text="Đang tải danh sách báo cáo..." color="blue" />
        </div>
      ) : getReport.length === 0 ? (
        <p className="text-center text-gray-500 italic">
          Không có báo cáo nào cần nộp.
        </p>
      ) : (
        getReport.map((report, index) => (
          <div key={index} className="mb-6">
            <div className="border border-gray-300 rounded-lg p-4 bg-white hover:shadow-md transition">
              <h2 className="font-semibold text-lg mb-2 text-gray-800">
                {report.report_name}
              </h2>

              <div className="space-y-1 text-sm text-gray-600">
                <p>
                  <strong>Môn học:</strong> {report.report_name}
                </p>
                <p>
                  <strong>Lớp:</strong> {report.class_name}
                </p>
                <p>
                  <strong>Năm học:</strong> {report.academic_year}
                </p>
                <p>
                  <strong>Hạn nộp:</strong>{" "}
                  {new Date(report.end_date).toLocaleDateString("vi-VN")}
                </p>
                <strong>Trạng thái nộp:</strong>{" "}
                <span
                  className={`${
                    report.student_status === "submitted"
                      ? "text-green-600"
                      : "text-orange-500"
                  }`}
                >
                  {report.student_status === "submitted"
                    ? "Đã nộp"
                    : "Chưa nộp"}
                </span>
              </div>

              <button
                onClick={() => {
                  setSelectedReport(report);
                  setIsModalOpen(true);
                }}
                className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg flex items-center justify-center"
              >
                <span className="mr-2">📤</span>
                Nộp báo cáo
              </button>
            </div>
          </div>
        ))
      )}

      {/* 🔹 Modal nộp báo cáo */}
      <ReportSubmissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        reportData={selectedReport}
      />

      {/* 🔹 Trạng thái Upload */}
      {uploading && (
        <div className="mt-6 flex justify-center">
          <DotLoading text="Đang upload lên Google Drive..." color="blue" />
        </div>
      )}

      {message && (
        <div className="mt-4 text-center">
          <p className="text-gray-700">{message}</p>
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              🔗 Xem file trên Google Drive
            </a>
          )}
        </div>
      )}
    </div>
  );
}

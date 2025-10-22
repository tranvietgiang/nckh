import React, { useEffect, useState } from "react";
import axios from "../../../../config/axios";
import ReportSubmissionModal from "../Features/ReportSubmissionPage";
import { getUser } from "../../../Constants/INFO_USER";
export default function PendingReports() {
  const user = getUser();
  const [getReport, setReports] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");

  useEffect(() => {
    axios
      .get("/get-report")
      .then((res) => {
        setReports(res.data);
        console.log(res.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const handleSubmit = async (file) => {
    if (!file) {
      alert("Vui lòng chọn file trước!");
      return;
    }

    console.log("File submitted:", file);

    const formData = new FormData();
    formData.append("file", file); // 👈 đúng key Laravel cần
    formData.append("email", user?.email); // 👈 hoặc email động

    try {
      const res = await axios.post("/drive-upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data", // 👈 rất quan trọng
        },
      });
      setMessage(res.data.message);
      setLink(res.data.drive_url);
      console.log("✅ Upload thành công:", res.data);
    } catch (err) {
      console.error("❌ Upload lỗi:", err.response?.data || err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-gray-50 min-h-screen p-4 rounded-lg shadow-md mt-[10px]">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-900">
        DANH SÁCH BÁO CÁO CHƯA NỘP
      </h1>

      {getReport?.map((report, index) => (
        <div key={index} className="mb-6">
          <div className="border border-gray-300 rounded-lg p-4 bg-white hover:shadow-md transition">
            <h2 className="font-semibold text-lg mb-2 text-gray-800">
              {report.title}
            </h2>

            <div className="space-y-1 text-sm text-gray-600">
              <p>
                <strong>Môn:</strong> {report.report_name}
              </p>
              <p>
                <strong>Hạn nộp:</strong> {report.end_date}
              </p>
              <p>
                <strong>Yêu cầu:</strong> {report.yeuCau}
              </p>
              <p>
                <strong>Trạng thái:</strong>{" "}
                <span className="text-orange-500">{report.trangThai}</span>
              </p>
              <p>
                <strong>Năm:</strong> {report.nam}
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg flex items-center justify-center"
            >
              <span className="mr-2">📤</span>
              Nộp báo cáo
            </button>
          </div>
        </div>
      ))}

      {/* Modal Nộp Báo Cáo */}
      <ReportSubmissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />

      {/* Trạng thái Upload */}
      {uploading && (
        <p className="mt-4 text-blue-600 font-medium text-center">
          ⏳ Đang upload lên Google Drive...
        </p>
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

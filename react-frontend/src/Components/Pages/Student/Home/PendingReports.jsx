import { useEffect, useState } from "react";
import axios from "../../../../config/axios";
import ReportSubmissionModal from "../Features/ReportSubmissionPage";
import { getUser } from "../../../Constants/INFO_USER";

// Hiệu ứng loading 3 chấm
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
  const [loading, setLoading] = useState(true);
  const [checkStatusSubmit, setCheckStatusSubmit] = useState({});
  const [getCheckLeader, setCheckLeader] = useState({});
  const [getRmCodeLeader, setRmCodeLeader] = useState({});

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

  // 🔹 Lấy thông tin nhóm và submission
  useEffect(() => {
    // Lấy thông tin vai trò trong nhóm
    axios
      .get(`/tvg/get-group-member`)
      .then((res) => {
        setCheckLeader(res.data);
        console.log("Group member:", res.data);

        // Sau khi có thông tin nhóm, lấy submission của nhóm trưởng
        if (res.data?.rm_code) {
          axios
            .get(`/tvg/get-student-leader/${res.data.rm_code}`)
            .then((leaderRes) => {
              setRmCodeLeader(leaderRes.data);
              console.log("Leader info:", leaderRes.data);

              // Lấy submission của nhóm trưởng
              if (leaderRes.data?.student_id) {
                axios
                  .get(
                    `/tvg/get-submission/${leaderRes.data.student_id}/submitted`
                  )
                  .then((submissionRes) => {
                    setCheckStatusSubmit(submissionRes.data);
                    console.log("Submission:", submissionRes.data);
                  })
                  .catch((error) => {
                    console.log("Lỗi load submission:", error);
                  });
              }
            })
            .catch((error) => {
              console.log("Lỗi load leader:", error);
            });
        }
      })
      .catch((error) => {
        console.log("Lỗi load group member:", error);
      });
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
    formData.append("teacher_id", selectedReport.teacher_id);

    try {
      setUploading(true);
      const res = await axios.post("/drive-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("✅ Upload thành công:", res.data);

      setIsModalOpen(false);
      setSelectedReport(null);

      // Reload data
      const newReports = await axios.get("/get-report");
      setReports(newReports.data);

      // Reload submission data
      if (getRmCodeLeader?.student_id) {
        const submissionRes = await axios.get(
          `/tvg/get-submission/${getRmCodeLeader.student_id}`
        );
        setCheckStatusSubmit(submissionRes.data);
      }

      alert("Nộp báo cáo thành công");
    } catch (err) {
      console.error("❌ Upload lỗi:", err.response?.data || err.message);
      alert(err.response?.data?.message_error || "Nộp báo cáo thất bại!");
    } finally {
      setUploading(false);
    }
  };

  // Hàm render action button theo vai trò
  const renderActionButton = (report) => {
    const isLeader = getCheckLeader?.report_m_role === "NT";
    const isSubmitted = checkStatusSubmit?.status === "submitted";

    // Thành viên (TV) - chỉ hiển thị thông tin
    if (!isLeader) {
      return (
        <div className="space-y-2 mt-4">
          <div className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-center">
            👥 Bạn là thành viên trong nhóm
          </div>
          {isSubmitted && (
            <a
              href={checkStatusSubmit?.file_path || "#"}
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

    // Nhóm trưởng (NT) - có quyền nộp/nộp lại
    if (isSubmitted) {
      return (
        <div className="space-y-2 mt-4">
          <a
            href={checkStatusSubmit?.file_path || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-center"
          >
            🔗 Xem file trên Google Drive
          </a>
          <button
            onClick={() => {
              setSelectedReport(report);
              setIsModalOpen(true);
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
          >
            📤 Nộp lại báo cáo
          </button>
        </div>
      );
    } else {
      return (
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
      );
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-gray-50 min-h-screen p-4 rounded-lg shadow-md mt-[10px]">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-900">
        DANH SÁCH BÁO CÁO
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
                  <strong>Giáo viên phụ trách:</strong> {report.teacher_id}
                </p>
                <p>
                  <strong>Năm học:</strong> {report.academic_year}
                </p>
                <p>
                  <strong>Hạn nộp:</strong>{" "}
                  {new Date(report.end_date).toLocaleDateString("vi-VN")}
                </p>
                <p>
                  <strong>Nhóm:</strong>
                  <span className="px-2 font-semibold">
                    {getCheckLeader?.rm_name || "Chưa có nhóm"}
                  </span>
                </p>
                <p>
                  <strong>Vai trò:</strong>
                  <span
                    className={`px-2 font-semibold ${
                      getCheckLeader?.report_m_role === "NT"
                        ? "text-blue-600"
                        : "text-green-600"
                    }`}
                  >
                    {getCheckLeader?.report_m_role === "NT"
                      ? "Nhóm trưởng"
                      : getCheckLeader?.report_m_role === "NP"
                      ? "Nhóm phó"
                      : "Thành viên"}
                  </span>
                </p>
                <p>
                  <strong>Trạng thái nộp:</strong>
                  <span
                    className={`px-2 font-semibold ${
                      checkStatusSubmit?.status === "submitted"
                        ? "text-green-600"
                        : "text-orange-500"
                    }`}
                  >
                    {checkStatusSubmit?.status === "submitted"
                      ? "Đã nộp"
                      : "Chưa nộp"}
                  </span>
                </p>
              </div>

              {/* Render action button theo vai trò */}
              {renderActionButton(report)}
            </div>
          </div>
        ))
      )}

      {/* 🔹 Modal nộp báo cáo (chỉ nhóm trưởng sử dụng) */}
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
    </div>
  );
}

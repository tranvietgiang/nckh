import React, { useState, useEffect } from "react";
import axios from "../../../config/axios";
import { Eye, Send, RefreshCw } from "lucide-react";

export default function ScoringFeedback() {
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // 🔹 Lỗi validation hiển thị dưới form

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await axios.get("/submissions");
      setSubmissions(res.data.data || res.data);
    } catch (err) {
      console.error("Lỗi tải danh sách:", err);
      setError("Không thể tải danh sách bài nộp. Vui lòng thử lại.");
    }
  };

  const validateInput = () => {
    if (!selectedSubmission) {
      setError("Chưa chọn bài nộp!");
      return false;
    }

    // Kiểm tra điểm
    const numScore = parseFloat(score);
    if (isNaN(numScore)) {
      setError("Điểm phải là số.");
      return false;
    }
    if (numScore < 0 || numScore > 10) {
      setError("Điểm không hợp lệ, vui lòng nhập từ 0 đến 10.");
      return false;
    }

    // Kiểm tra feedback
    if (!feedback.trim()) {
      setError("Vui lòng nhập phản hồi trước khi lưu.");
      return false;
    }

    // Kiểm tra trạng thái bài nộp
    if (selectedSubmission.status === "graded") {
      setError("Bài này đã được chấm trước đó.");
      return false;
    }

    // Kiểm tra quyền chấm (giả lập teacher_id)
    if (selectedSubmission.teacher_id && selectedSubmission.teacher_id !== "gv001") {
      setError("Bạn không được phép chấm bài này.");
      return false;
    }

    // Nếu tất cả hợp lệ
    setError("");
    return true;
  };

  const handleSubmit = async () => {
    if (!validateInput()) return;

    try {
      setLoading(true);
      await axios.post("/grades", {
        submission_id: selectedSubmission.submission_id,
        teacher_id: "gv001",
        score: parseFloat(score),
        feedback,
      });
      alert("Đã gửi phản hồi thành công!");
      setSelectedSubmission(null);
      setScore("");
      setFeedback("");
      fetchSubmissions();
    } catch (err) {
      console.error("Lỗi khi chấm điểm:", err);
      setError("Không thể gửi phản hồi. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      <div className="bg-white shadow-md rounded-xl p-4 md:p-5">
        <h1 className="text-xl md:text-2xl font-bold text-gray-700 mb-4">
          🎯 Chấm điểm & Phản hồi
        </h1>

        {/* Danh sách bài nộp */}
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm md:text-base text-left text-gray-600">
            <thead className="bg-gray-200 text-gray-700 uppercase text-xs md:text-sm">
              <tr>
                <th className="px-2 md:px-4 py-2">Mã SV</th>
                <th className="px-2 md:px-4 py-2">Tên SV</th>
                <th className="px-2 md:px-4 py-2">Thời gian nộp</th>
                <th className="px-2 md:px-4 py-2">Trạng thái</th>
                <th className="px-2 md:px-4 py-2 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => (
                <tr
                  key={sub.id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="px-2 md:px-4 py-2">{sub.student_id}</td>
                  <td className="px-2 md:px-4 py-2">{sub.student_name}</td>
                  <td className="px-2 md:px-4 py-2">{sub.submission_time}</td>
                  <td className={`px-2 md:px-4 py-2 font-medium ${sub.status === "graded" ? "text-green-600" :
                      sub.status === "rejected" ? "text-red-600" : "text-blue-600"
                    }`}>
                    {sub.status}
                  </td>
                  <td className="px-2 md:px-4 py-2 text-center">
                    <button
                      onClick={() => setSelectedSubmission(sub)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs md:text-sm"
                    >
                      <Eye size={16} /> Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Form chấm điểm */}
        {selectedSubmission && (
          <div className="mt-4 md:mt-6 p-4 md:p-5 border-t bg-gray-50 rounded-lg">
            <h2 className="text-base md:text-lg font-semibold text-gray-700 mb-2">
              📝 Chấm điểm cho: {selectedSubmission.student_name}
            </h2>

            {error && (
              <div className="mb-3 md:mb-4 text-red-600 font-medium text-sm md:text-base">
                ⚠️ {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className="block mb-1 font-medium text-sm md:text-base">Điểm (0 - 10)</label>
                <input
                  type="number"
                  className="w-full border p-2 rounded-lg focus:ring focus:ring-blue-300 text-sm md:text-base"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  min="0"
                  max="10"
                  step="0.1"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block mb-1 font-medium text-sm md:text-base">Phản hồi</label>
                <textarea
                  rows="3"
                  className="w-full border p-2 rounded-lg focus:ring focus:ring-blue-300 text-sm md:text-base"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Nhập nhận xét, hướng dẫn cải thiện..."
                />
              </div>
            </div>

            <div className="mt-3 md:mt-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm md:text-base"
              >
                <Send size={16} />
                {loading ? "Đang gửi..." : "Lưu & Gửi phản hồi"}
              </button>
              <button
                onClick={() => {
                  setSelectedSubmission(null);
                  setError("");
                }}
                className="flex items-center justify-center gap-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 text-sm md:text-base"
              >
                <RefreshCw size={16} /> Hủy
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

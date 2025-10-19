import React, { useState, useEffect } from "react";
import axios from "../../../../config/axios";
import { Eye, Send, RefreshCw } from "lucide-react";

export default function ScoringFeedback() {
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  // 📦 Giả sử backend có API lấy danh sách bài nộp
  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await axios.get("/submissions");
      setSubmissions(res.data.data || res.data);
    } catch (err) {
      console.error("Lỗi tải danh sách:", err);
    }
  };

  const handleSubmit = async () => {
    if (!selectedSubmission) return alert("Chưa chọn bài nộp!");
    if (score === "" || feedback.trim() === "")
      return alert("Vui lòng nhập đủ điểm và phản hồi!");

    try {
      setLoading(true);
      await axios.post("/grades", {
        submission_id: selectedSubmission.submission_id,
        teacher_id: "gv001", // 👈 Giả lập ID giảng viên
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
      alert("Không thể gửi phản hồi. Vui lòng .");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white shadow-md rounded-xl p-5">
        <h1 className="text-2xl font-bold text-gray-700 mb-4">
          🎯 Chấm điểm & Phản hồi
        </h1>

        {/* Danh sách bài nộp */}
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="bg-gray-200 text-gray-700 uppercase text-xs">
              <tr>
                <th className="px-4 py-2">Mã SV</th>
                <th className="px-4 py-2">Tên SV</th>
                <th className="px-4 py-2">Thời gian nộp</th>
                <th className="px-4 py-2">Trạng thái</th>
                <th className="px-4 py-2 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => (
                <tr
                  key={sub.id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-2">{sub.student_id}</td>
                  <td className="px-4 py-2">{sub.student_name}</td>
                  <td className="px-4 py-2">{sub.submission_time}</td>
                  <td className="px-4 py-2 text-blue-600 font-medium">
                    {sub.status}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => setSelectedSubmission(sub)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
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
          <div className="mt-6 p-5 border-t bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              📝 Chấm điểm cho: {selectedSubmission.student_name}
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
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

              <div className="md:col-span-2">
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

            <div className="mt-4 flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Send size={16} />
                {loading ? "Đang gửi..." : "Lưu & Gửi phản hồi"}
              </button>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="flex items-center gap-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
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

import { useState } from "react";
import axios from "../../../../config/axios";

export default function CreateReports({ classId }) {
  const [form, setForm] = useState({
    report_name: "",
    description: "",
    start_date: "",
    end_date: "",
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      const res = await axios.post("/reports/create", {
        ...form,
        class_id: classId,
      });
      setSuccessMsg("✅ " + res.data.message);
      setForm({
        report_name: "",
        description: "",
        start_date: "",
        end_date: "",
      });
    } catch (error) {
      setErrorMsg("❌ Tạo báo cáo thất bại! Vui lòng kiểm tra lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-xl p-8 border border-gray-200">
        <h1 className="text-2xl font-semibold text-blue-700 mb-6 text-center">
          🧾 TẠO BÁO CÁO MỚI
        </h1>

        {/* Thông báo */}
        {successMsg && (
          <div className="bg-green-100 border border-green-400 text-green-700 p-3 rounded mb-4">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded mb-4">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-medium text-gray-700">
              Tên báo cáo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="report_name"
              value={form.report_name}
              onChange={handleChange}
              placeholder="VD: Báo cáo chuyên đề 1"
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700">Mô tả</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="3"
              placeholder="Nhập mô tả, yêu cầu hoặc hướng dẫn nộp báo cáo..."
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-gray-700">
                Ngày bắt đầu
              </label>
              <input
                type="date"
                name="start_date"
                value={form.start_date}
                onChange={handleChange}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700">
                Hạn nộp
              </label>
              <input
                type="date"
                name="end_date"
                value={form.end_date}
                onChange={handleChange}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 rounded-lg text-white font-medium transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Đang tạo..." : "➕ Tạo báo cáo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

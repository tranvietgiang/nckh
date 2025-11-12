import React, { useState } from "react";
import axios from "../../../../config/axios";

export default function ImportTeacher() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setStatus("");
    setResult(null);
  };

  const handleImport = async () => {
    if (!file) {
      alert("⚠️ Vui lòng chọn file Excel trước!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setStatus("⏳ Đang tải lên và xử lý dữ liệu...");
      setResult(null);

      const response = await axios.post("/nhhh/admin/import-teachers", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = response.data;
      setStatus(data.failed === 0 ? "✅ Import hoàn tất!" : "⚠️ Import có lỗi!");
      setResult(data);
    } catch (error) {
      console.error("Lỗi import:", error);
      if (error.response && error.response.data) {
        setStatus(`❌ ${error.response.data.message || "Lỗi xử lý file Excel!"}`);
      } else {
        setStatus("⚠️ Không thể kết nối đến máy chủ. Vui lòng thử lại!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 space-y-8">
      {/* --- PHẦN UPLOAD FILE --- */}
      <div className="p-6 bg-gray-900 text-white rounded-2xl shadow-lg border border-gray-700">
        <h2 className="text-2xl font-bold mb-4 text-center text-blue-400">
          📚 Import Danh Sách Giảng Viên
        </h2>

        <div className="flex flex-col items-center">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="mb-4 block w-full text-sm text-gray-300 
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-full file:border-0 file:text-sm file:font-semibold
                       file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
          />

          <button
            onClick={handleImport}
            disabled={loading}
            className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors
                       ${loading ? "bg-gray-600 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
          >
            {loading ? "Đang xử lý..." : "📤 Tải Lên File Excel"}
          </button>

          {status && (
            <div
              className={`mt-4 p-3 text-sm rounded-md w-full text-center ${
                status.includes("✅")
                  ? "bg-green-700/50 border border-green-500"
                  : status.includes("❌") || status.includes("⚠️")
                  ? "bg-red-700/50 border border-red-500"
                  : "bg-blue-700/50 border border-blue-500"
              }`}
            >
              {status}
            </div>
          )}
        </div>
      </div>

      {/* --- PHẦN KẾT QUẢ IMPORT --- */}
      {result && (
        <div className="p-6 bg-gray-900 text-white rounded-2xl shadow-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-yellow-400 mb-4">
            📊 Kết quả Import
          </h3>

          <ul className="list-disc pl-6 text-sm text-gray-300 mb-6">
            <li>Tổng số giảng viên trong file: <b>{result.total || 0}</b></li>
            <li>Thành công: <b className="text-green-400">{result.success || 0}</b></li>
            <li>Thất bại: <b className="text-red-400">{result.failed || 0}</b></li>
          </ul>

          {/* --- BẢNG IMPORT THÀNH CÔNG --- */}
          {result.success > 0 && result.successList?.length > 0 && (
            <div className="mb-8">
              <h4 className="text-md font-semibold text-green-400 mb-2">
                ✅ Danh sách import thành công
              </h4>
              <div className="bg-gray-800 rounded-lg p-3 max-h-60 overflow-y-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-700">
                      <th className="text-left p-2">STT</th>
                      <th className="text-left p-2">User ID</th>
                      <th className="text-left p-2">Họ và tên</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.successList.map((user, idx) => (
                      <tr key={idx} className="border-b border-gray-700 hover:bg-gray-700/30">
                        <td className="p-2">{idx + 1}</td>
                        <td className="p-2">{user.user_id}</td>
                        <td className="p-2">{user.fullname}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* --- BẢNG IMPORT THẤT BẠI --- */}
          {result.errors?.length > 0 && (
            <div>
              <h4 className="text-md font-semibold text-red-400 mb-2">
                ❌ Danh sách import thất bại
              </h4>
              <div className="bg-gray-800 rounded-lg p-3 max-h-60 overflow-y-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-700">
                      <th className="text-left p-2">STT</th>
                      <th className="text-left p-2">User ID</th>
                      <th className="text-left p-2">Lý do lỗi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.errors.map((err, idx) => (
                      <tr key={idx} className="border-b border-gray-700 hover:bg-gray-700/30">
                        <td className="p-2">{idx + 1}</td>
                        <td className="p-2">{err.user_id || "Không rõ"}</td>
                        <td className="p-2 text-red-300">{err.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

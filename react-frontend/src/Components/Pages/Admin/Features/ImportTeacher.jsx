import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../../../config/axios";
import Footer from "../../Student/Home/Footer";
import BackToTop from "../../../ReUse/Top/BackToTop";
import useIsLogin from "../../../ReUse/IsLogin/IsLogin";
import { getAuth } from "../../../Constants/INFO_USER";
export default function ImportTeacher() {
  const { user, token } = getAuth();
  useIsLogin(user, token, "admin");

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

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

      const response = await axios.post(
        "/nhhh/admin/import-teachers",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const data = response.data;
      setStatus(
        data.failed === 0 ? "✅ Import hoàn tất!" : "⚠️ Import có lỗi!"
      );
      setResult(data);
    } catch (error) {
      console.error("Lỗi import:", error);
      if (error.response && error.response.data) {
        setStatus(
          `❌ ${error.response.data.message || "Lỗi xử lý file Excel!"}`
        );
      } else {
        setStatus("⚠️ Không thể kết nối đến máy chủ. Vui lòng thử lại!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                <span className="text-lg">←</span>
                <span>Quay lại</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-800">
                📚 Import Danh Sách Giảng Viên
              </h1>
            </div>
          </div>
          <p className="text-gray-600 mt-2">
            Tải lên file Excel để import dữ liệu giảng viên vào hệ thống
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-full">
          {/* --- PHẦN UPLOAD FILE --- */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="space-y-6">
              {/* File Upload Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn file Excel
                </label>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 
                           file:mr-4 file:py-3 file:px-4 
                           file:rounded-lg file:border-0 
                           file:text-sm file:font-semibold
                           file:bg-blue-50 file:text-blue-700 
                           hover:file:bg-blue-100 cursor-pointer
                           border border-gray-300 rounded-lg p-2"
                />
                {file && (
                  <p className="mt-2 text-sm text-green-600">
                    ✅ Đã chọn: {file.name}
                  </p>
                )}
              </div>

              {/* Upload Button */}
              <button
                onClick={handleImport}
                disabled={loading || !file}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors duration-200 flex items-center justify-center space-x-2 ${
                  loading || !file
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <span>📤</span>
                    <span>Tải Lên File Excel</span>
                  </>
                )}
              </button>

              {/* Status Message */}
              {status && (
                <div
                  className={`p-4 rounded-lg border ${
                    status.includes("✅")
                      ? "bg-green-50 border-green-200 text-green-700"
                      : status.includes("❌")
                      ? "bg-red-50 border-red-200 text-red-700"
                      : status.includes("⚠️")
                      ? "bg-yellow-50 border-yellow-200 text-yellow-700"
                      : "bg-blue-50 border-blue-200 text-blue-700"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{status.split(" ")[0]}</span>
                    <span>{status.split(" ").slice(1).join(" ")}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* --- PHẦN KẾT QUẢ IMPORT --- */}
          {result && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  📊 Kết quả Import
                </h2>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-blue-50 rounded-lg p-6 text-center border border-blue-200">
                  <div className="text-3xl font-bold text-blue-600">
                    {result.total || 0}
                  </div>
                  <div className="text-gray-600 text-sm mt-2">
                    Tổng số giảng viên
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-6 text-center border border-green-200">
                  <div className="text-3xl font-bold text-green-600">
                    {result.success || 0}
                  </div>
                  <div className="text-gray-600 text-sm mt-2">Thành công</div>
                </div>
                <div className="bg-red-50 rounded-lg p-6 text-center border border-red-200">
                  <div className="text-3xl font-bold text-red-600">
                    {result.failed || 0}
                  </div>
                  <div className="text-gray-600 text-sm mt-2">Thất bại</div>
                </div>
              </div>

              {/* --- BẢNG IMPORT THÀNH CÔNG --- */}
              {result.success > 0 && result.successList?.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-green-600 text-xl">✅</span>
                    <h3 className="text-xl font-semibold text-green-700">
                      Danh sách import thành công
                    </h3>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                      {result.success} giảng viên
                    </span>
                  </div>
                  <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                    <div className="max-h-96 overflow-y-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100 sticky top-0">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              STT
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              User ID
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Họ và tên
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {result.successList.map((user, idx) => (
                            <tr
                              key={idx}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                {idx + 1}
                              </td>
                              <td className="px-6 py-4 text-sm font-medium text-gray-900 font-mono">
                                {user.user_id}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                {user.fullname}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* --- BẢNG IMPORT THẤT BẠI --- */}
              {result.errors?.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-red-600 text-xl">❌</span>
                    <h3 className="text-xl font-semibold text-red-700">
                      Danh sách import thất bại
                    </h3>
                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                      {result.errors.length} lỗi
                    </span>
                  </div>
                  <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                    <div className="max-h-96 overflow-y-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100 sticky top-0">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              STT
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              User ID
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Lý do lỗi
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {result.errors.map((err, idx) => (
                            <tr
                              key={idx}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                {idx + 1}
                              </td>
                              <td className="px-6 py-4 text-sm font-medium text-gray-900 font-mono">
                                {err.user_id || "Không rõ"}
                              </td>
                              <td className="px-6 py-4 text-sm text-red-600">
                                {err.reason}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <BackToTop />
      <Footer />
    </div>
  );
}

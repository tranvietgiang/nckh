import React, { useEffect, useRef, useState } from "react";
import axios from "../../../../config/axios";
import ModalMajor from "../Modal/ModalAddMajor";

export default function MajorImportPage() {
  const [getMajors, setMajors] = useState([]);
  const [openModalMajor, setOpenModalMajor] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ state cho Import
  const [importing, setImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchMajors();
  }, []);

  const fetchMajors = () => {
    setLoading(true);
    axios
      .get("/get-majors")
      .then((res) => setMajors(res.data || []))
      .catch((error) => {
        console.error("Lỗi tải danh sách ngành:", error);
        setMajors([]);
      })
      .finally(() => setLoading(false));
  };

  const handleEdit = (major) => {
    // Mở modal chỉnh sửa (tuỳ bạn triển khai trong ModalMajor)
    console.log("Sửa ngành:", major);
    setOpenModalMajor(true);
  };

  // === IMPORT EXCEL ===
  const openFileDialog = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("❌ Vui lòng chọn file Excel trước!");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setImporting(true);
      // ⚠️ Endpoint import: dùng đúng với backend của bạn
      // Nếu bạn đang dùng /majors/import trong API, giữ nguyên dòng dưới:
      const res = await axios.post("/majors/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert(
        `${res.data.message || "✅ Import xong!"}\n` +
          `✅ Thành công: ${res.data.total_success ?? 0}\n` +
          `❌ Lỗi: ${res.data.total_failed ?? 0}`
      );

      // Reset input file
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      // Refresh list
      fetchMajors();
    } catch (err) {
      console.error("Import lỗi:", err?.response?.data || err);
      const msg =
        err?.response?.data?.message_error ||
        err?.response?.data?.message ||
        "❌ Lỗi import file!";
      alert(msg);
      // Nếu muốn xử lý 401/403:
      // if (err.response?.status === 401) alert("Bạn chưa đăng nhập!");
      // if (err.response?.status === 403) alert("Bạn không có quyền!");
    } finally {
      setImporting(false);
    }
  };

  const handleCloseModal = () => setOpenModalMajor(false);

  const handleMajorSuccess = () => {
    // Callback khi thêm/sửa xong trong modal
    fetchMajors();
  };

  // Định dạng ngày tháng như trong hình (27/10/2025)
  const formatDate = (dateString) => {
    if (!dateString) return "27/10/2025"; // default như bạn để
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  useEffect(() => {
    window.onMajorActionSuccess = handleMajorSuccess;
    return () => {
      delete window.onMajorActionSuccess;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Main Content */}
        <div className="flex-1">
          <div className="p-6">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Quản lý Ngành
              </h1>
              <p className="text-gray-600 mt-1">
                Quản lý danh sách các ngành học trong hệ thống
              </p>
            </div>

            {/* Stat + Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  Tổng {getMajors?.length || 0} ngành
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                {/* Nút Import */}
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    id="fileInputMajors"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={openFileDialog}
                    className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition duration-200"
                  >
                    <span>📁</span>
                    Chọn file Excel
                  </button>

                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={!selectedFile || importing}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white transition duration-200 ${
                      !selectedFile || importing
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {importing ? "Đang import..." : "Import Ngành"}
                  </button>
                </div>

                {/* Hiển thị tên file đã chọn */}
                {selectedFile && (
                  <div className="text-sm text-gray-600 self-center">
                    📄 Đã chọn: <b>{selectedFile.name}</b>
                  </div>
                )}
              </div>
            </div>

            {/* Nút Thêm mới */}
            <button
              onClick={() => setOpenModalMajor(true)}
              className="flex items-center gap-2 mb-5 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
            >
              <span>➕</span>
              Thêm Ngành
            </button>
            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">
                    Đang tải dữ liệu...
                  </span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          TÊN NGÀNH
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          MÃ VIẾT TẮT
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          NGÀY TẠO
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          CẬP NHẬT
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          THAO TÁC
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getMajors?.map((major) => (
                        <tr key={major.major_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                            {`${major.major_id}`.padStart(2, "0")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {major.major_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {major.major_abbreviate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(major.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(major.updated_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleEdit(major)}
                              className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600 transition duration-200"
                            >
                              Sửa
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Empty State */}
                  {getMajors?.length === 0 && (
                    <div className="text-center py-12">
                      <svg
                        className="mx-auto h-16 w-16 text-gray-400 mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Không có ngành nào
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Bắt đầu bằng cách import file ngành.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ModalMajor stateOpen={openModalMajor} onClose={handleCloseModal} />
    </div>
  );
}

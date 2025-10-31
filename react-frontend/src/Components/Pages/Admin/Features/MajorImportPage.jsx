import React, { useEffect, useRef, useState } from "react";
import axios from "../../../../config/axios";
import ModalMajor from "../Modal/ModalAddMajor";

export default function MajorImportPage() {
  const [majors, setMajors] = useState([]);
  const [majorErrors, setMajorErrors] = useState([]);
  const [openModalMajor, setOpenModalMajor] = useState(false);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  // 🟢 Load danh sách ngành và lỗi khi khởi động
  useEffect(() => {
    fetchMajors();
    fetchMajorErrors();
  }, []);

  // ======= LẤY DANH SÁCH NGÀNH =======
  const fetchMajors = () => {
    setLoading(true);
    axios
      .get("/get-majors")
      .then((res) => setMajors(res.data || []))
      .catch((err) => {
        console.error("Lỗi tải danh sách ngành:", err);
        setMajors([]);
      })
      .finally(() => setLoading(false));
  };

  // ======= LẤY DANH SÁCH LỖI IMPORT NGÀNH =======
  const fetchMajorErrors = () => {
    axios
      .get("/pc/get-errors/major")
      .then((res) => setMajorErrors(res.data || []))
      .catch(() => setMajorErrors([]));
  };

  // ======= XOÁ TOÀN BỘ LỖI =======
  const handleDeleteError = () => {
    if (!majorErrors.length) return;
    if (!window.confirm("Bạn có chắc muốn xóa toàn bộ lỗi import ngành?")) return;

    axios
      .delete("/pc/import-errors/major")
      .then(() => {
        alert("🗑️ Đã xóa danh sách lỗi import ngành!");
        setMajorErrors([]);
      })
      .catch(() => alert("❌ Không thể xóa lỗi!"));
  };

  // ======= IMPORT EXCEL =======
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
      const res = await axios.post("/majors/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert(
        `${res.data.message || "✅ Import xong!"}\n` +
        `✅ Thành công: ${res.data.success ?? 0}\n` +
        `❌ Lỗi: ${res.data.failed ?? 0}`
      );

      // Reset
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      // Làm mới danh sách
      fetchMajors();
      fetchMajorErrors();
    } catch (err) {
      if (err.response?.data?.message) alert(err.response.data.message);
      else alert("Lỗi kết nối server!");
    } finally {
      setImporting(false);
    }
  };

  // ======= MODAL =======
  const handleCloseModal = () => setOpenModalMajor(false);

  const handleEdit = (major) => {
    console.log("Sửa ngành:", major);
    setOpenModalMajor(true);
  };

  const handleMajorSuccess = () => {
    fetchMajors();
  };

  useEffect(() => {
    window.onMajorActionSuccess = handleMajorSuccess;
    return () => delete window.onMajorActionSuccess;
  }, []);

  // ======= ĐỊNH DẠNG NGÀY =======
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  // ======= JSX =======
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <div className="flex-1">
          <div className="p-6">
            {/* HEADER */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Quản lý Ngành</h1>
              <p className="text-gray-600 mt-1">
                Quản lý danh sách các ngành học trong hệ thống
              </p>
            </div>

            {/* ACTION BAR */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                Tổng {majors?.length || 0} ngành
              </span>

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
                    onClick={openFileDialog}
                    className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
                  >
                    📁 Chọn file Excel
                  </button>

                  <button
                    onClick={handleUpload}
                    disabled={!selectedFile || importing}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white transition ${!selectedFile || importing
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                      }`}
                  >
                    {importing ? "Đang import..." : "Import Ngành"}
                  </button>
                </div>

                {/* File đã chọn */}
                {selectedFile && (
                  <div className="text-sm text-gray-600 self-center">
                    📄 <b>{selectedFile.name}</b>
                  </div>
                )}
              </div>
            </div>

            {/* Nút thêm ngành */}
            <button
              onClick={() => setOpenModalMajor(true)}
              className="flex items-center gap-2 mb-5 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              ➕ Thêm Ngành
            </button>

            {/* DANH SÁCH LỖI IMPORT */}
            {majorErrors.length > 0 && (
              <div className="mt-8 bg-red-50 border border-red-300 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-red-700 mb-3">
                  ⚠️ Danh sách lỗi import ngành ({majorErrors.length})
                </h3>

                <button
                  className="p-1 w-[100px] mb-5 rounded-md bg-red-500 hover:bg-red-600 text-white"
                  onClick={handleDeleteError}
                >
                  Xóa lỗi
                </button>

                <table className="min-w-full divide-y divide-red-200">
                  <thead className="bg-red-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-red-700 uppercase">
                        Tên ngành
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-red-700 uppercase">
                        Mã viết tắt
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-red-700 uppercase">
                        Lý do lỗi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-red-100">
                    {majorErrors.map((e, i) => (
                      <tr key={i} className="hover:bg-red-50">
                        <td className="px-4 py-2 text-sm text-gray-800">
                          {e.fullname || "-"}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-800">
                          {e.email || "-"}
                        </td>
                        <td className="px-4 py-2 text-sm text-red-600">
                          {e.reason}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* BẢNG NGÀNH */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Đang tải dữ liệu...</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Tên ngành
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Mã viết tắt
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Ngày tạo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Cập nhật
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {majors.map((major) => (
                        <tr key={major.major_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-bold text-gray-900">
                            {`${major.major_id}`.padStart(2, "0")}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {major.major_name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {major.major_abbreviate}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {formatDate(major.created_at)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {formatDate(major.updated_at)}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <button
                              onClick={() => handleEdit(major)}
                              className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600 transition"
                            >
                              Sửa
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {majors.length === 0 && (
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

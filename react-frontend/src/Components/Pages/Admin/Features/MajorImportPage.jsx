import { useEffect, useRef, useState } from "react";
import axios from "../../../../config/axios";
import ModalMajor from "../Modal/ModalAddMajor";

export default function MajorImportPage() {
  const [majors, setMajors] = useState([]);
  const [majorErrors, setMajorErrors] = useState([]);
  const [openModalMajor, setOpenModalMajor] = useState(false);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [q, setQ] = useState("");
  const [searchRows, setSearchRows] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const fileInputRef = useRef(null);
  const typingTimer = useRef(null);
  // 🟢 Load danh sách ngành và lỗi khi khởi động
  useEffect(() => {
    fetchMajors();
    fetchMajorErrors();
  }, []);

  // ======= LẤY DANH SÁCH NGÀNH =======
  const fetchMajors = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/get-majors");
      setMajors(res.data || []);
    } catch (err) {
      console.error("Lỗi tải danh sách ngành:", err);
      setMajors([]);
    } finally {
      setLoading(false);
    }
  };

  // ======= LẤY DANH SÁCH LỖI IMPORT NGÀNH =======
  const fetchMajorErrors = async () => {
    try {
      const res = await axios.get("/pc/get-errors/major");
      setMajorErrors(res.data || []);
    } catch {
      setMajorErrors([]);
    }
  };

  // ======= TÌM KIẾM MEILISEARCH =======
  // 🔍 STATE & TIMER

  // 🔍 SEARCH FUNCTION (Meilisearch)
  const runSearch = async (keyword) => {
    const query = keyword.trim();
    if (!query) {
      setSearchRows([]);
      await fetchMajors(); // trở lại danh sách gốc
      return;
    }

    setLoadingSearch(true);
    try {
      const res = await axios.get(
        `/search/majors?q=${encodeURIComponent(query)}`
      );
      setSearchRows(res.data || []);
    } catch (err) {
      console.error("Lỗi tìm kiếm:", err);
      setSearchRows([]);
    } finally {
      setLoadingSearch(false);
    }
  };

  // ✏️ XỬ LÝ GÕ TỪ KHÓA — chỉ tìm khi ngừng gõ 500ms
  const handleChange = (e) => {
    const value = e.target.value;
    setQ(value);
    if (typingTimer.current) clearTimeout(typingTimer.current);

    typingTimer.current = setTimeout(() => {
      runSearch(value);
    }, 500); // chờ 0.5 giây sau khi ngừng gõ
  };

  // ↩️ ENTER tìm ngay / ESC xoá
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      runSearch(q);
    } else if (e.key === "Escape") {
      setQ("");
      setSearchRows([]);
      fetchMajors();
    }
  };

  // ======= XOÁ TOÀN BỘ LỖI =======
  const handleDeleteError = () => {
    if (!majorErrors.length) return;
    if (!window.confirm("Bạn có chắc muốn xóa toàn bộ lỗi import ngành?"))
      return;

    axios
      .delete("/pc/import-errors/major")
      .then(() => {
        alert("🗑️ Đã xóa danh sách lỗi import ngành!");
        setMajorErrors([]);
      })
      .catch(() => alert("❌ Không thể xóa lỗi!"));
  };

  // ======= IMPORT EXCEL =======
  const openFileDialog = () => fileInputRef.current?.click();

  const handleFileChange = (e) => setSelectedFile(e.target.files?.[0] || null);

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
      await fetchMajors();
      await fetchMajorErrors();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi kết nối server!");
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
    if (q.trim()) runSearch(q);
  };

  useEffect(() => {
    window.onMajorActionSuccess = handleMajorSuccess;
    return () => delete window.onMajorActionSuccess;
  }, [q]);

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
              <h1 className="text-2xl font-bold text-gray-900">
                Quản lý Ngành
              </h1>
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
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <button
                  onClick={openFileDialog}
                  className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
                >
                  📁 Chọn file Excel
                </button>

                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || importing}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white ${
                    !selectedFile || importing
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {importing ? "Đang import..." : "Import Ngành"}
                </button>

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
            {/* TÌM KIẾM */}
            <div className="w-full max-w-xl flex items-center gap-2 mb-5">
              <input
                value={q}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="🔎 Tìm ngành (tên, viết tắt)..."
                className="w-full border rounded px-3 py-2"
              />
              {q && (
                <button
                  onClick={() => {
                    setQ("");
                    setSearchRows([]);
                    fetchMajors();
                  }}
                  className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                >
                  ✖
                </button>
              )}
            </div>

            {/* BẢNG NGÀNH */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {loading || loadingSearch ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">
                    {loadingSearch ? "Đang tìm kiếm..." : "Đang tải dữ liệu..."}
                  </span>
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

                    <tbody className="bg-white divide-y divide-gray-300">
                      {(q.trim() ? searchRows : majors).map((major) => (
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

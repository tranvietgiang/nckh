import { useEffect, useRef, useState } from "react";
import axios from "../../../../config/axios";
import ModalMajor from "../Modal/ModalAddMajor";

export default function MajorImportPage() {
  const [majors, setMajors] = useState([]);
  const [majorErrors, setMajorErrors] = useState([]);
  const [openModalMajor, setOpenModalMajor] = useState(false);
  const [editingMajor, setEditingMajor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  // 🔍 SEARCH STATE
  const [q, setQ] = useState("");
  const [searchRows, setSearchRows] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
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
      console.error("❌ Lỗi tải danh sách ngành:", err);
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
    }, 500);
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
  const handleDeleteError = async () => {
    if (!majorErrors.length) return;
    if (!window.confirm("Bạn có chắc muốn xóa toàn bộ lỗi import ngành?"))
      return;
    try {
      await axios.delete("/pc/import-errors/major");
      alert("🗑️ Đã xóa danh sách lỗi import ngành!");
      setMajorErrors([]);
    } catch {
      alert("❌ Không thể xóa lỗi!");
    }
  };

  // 📂 Import Excel
  const handleUpload = async () => {
    if (!selectedFile) return alert("❌ Vui lòng chọn file Excel trước!");
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setImporting(true);
      const res = await axios.post("/majors/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert(
        `${res.data.message || "✅ Import xong!"}\n✅ Thành công: ${
          res.data.success ?? 0
        }\n❌ Lỗi: ${res.data.failed ?? 0}`
      );

      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchMajors();
      fetchMajorErrors();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.major_abbreviate?.[0] ||
        "❌ Lỗi kết nối server!";
      alert(msg);
    } finally {
      setImporting(false);
    }
  };

  // ✏️ Click "Sửa"
  const handleEdit = (major) => {
    setEditingMajor(major);
    setOpenModalMajor(true);
  };

  // 🗑️ Xóa ngành
  const handleDelete = async (majorId) => {
    if (!window.confirm("Bạn có chắc muốn xóa ngành này?")) return;
    try {
      const res = await axios.delete(`/pc/delete-majors/${majorId}`);
      alert(res.data?.message || "🗑️ Xóa ngành thành công!");
      fetchMajors();
    } catch (err) {
      const msg = err.response?.data?.message || "❌ Xóa thất bại!";
      alert(msg);
    }
  };

  // Callback sau khi thêm hoặc cập nhật
  const handleMajorSuccess = (res) => {
    alert(res?.data?.message || "✅ Thao tác thành công!");
    setOpenModalMajor(false);
    setEditingMajor(null);
    fetchMajors();
    if (q.trim()) runSearch(q);
  };

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString("vi-VN") : "-";

  // ================== UI ==================
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Ngành</h1>
          <p className="text-gray-600 mt-1">
            Quản lý danh sách các ngành học trong hệ thống
          </p>
        </div>

        {/* Thanh công cụ */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            Tổng {majors?.length || 0} ngành
          </span>

          <div className="flex gap-2 items-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current.click()}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              📁 Chọn file Excel
            </button>

            <button
              onClick={handleUpload}
              disabled={!selectedFile || importing}
              className={`px-4 py-2 rounded-lg text-white ${
                importing || !selectedFile
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {importing ? "Đang import..." : "Import Ngành"}
            </button>

            <button
              onClick={() => {
                setEditingMajor(null);
                setOpenModalMajor(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              ➕ Thêm Ngành
            </button>
          </div>
        </div>

        {/* Ô tìm kiếm */}
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

        {/* Danh sách lỗi import */}
        {majorErrors.length > 0 && (
          <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-red-700 mb-3">
              ⚠️ Danh sách lỗi import ngành ({majorErrors.length})
            </h3>
            <button
              className="p-1 w-[100px] mb-5 rounded-md bg-red-500 hover:bg-red-600 text-white"
              onClick={handleDeleteError}
            >
              Xóa lỗi
            </button>
            <table className="min-w-full divide-y divide-red-200 text-sm">
              <thead className="bg-red-100 text-red-700 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-4 py-2 text-left">Tên ngành</th>
                  <th className="px-4 py-2 text-left">Mã viết tắt</th>
                  <th className="px-4 py-2 text-left">Lý do lỗi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-red-100">
                {majorErrors.map((e, i) => (
                  <tr key={i} className="hover:bg-red-50">
                    <td className="px-4 py-2">{e.fullname || "-"}</td>
                    <td className="px-4 py-2">{e.email || "-"}</td>
                    <td className="px-4 py-2 text-red-600">{e.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Bảng ngành */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading || loadingSearch ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">
                {loadingSearch ? "Đang tìm kiếm..." : "Đang tải dữ liệu..."}
              </span>
            </div>
          ) : (q.trim() ? searchRows : majors).length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              Không có ngành nào — hãy thêm hoặc import Excel!
            </div>
          ) : (
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
                {(q.trim() ? searchRows : majors).map((major) => (
                  <tr key={major.major_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                      {`${major.major_id}`.padStart(2, "0")}
                    </td>
                    <td className="px-6 py-4 text-sm">{major.major_name}</td>
                    <td className="px-6 py-4 text-sm">
                      {major.major_abbreviate}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(major.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(major.updated_at)}
                    </td>
                    <td className="px-6 py-4 text-sm flex gap-2">
                      <button
                        onClick={() => handleEdit(major)}
                        className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(major.major_id)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal thêm/sửa ngành */}
      {openModalMajor && (
        <ModalMajor
          stateOpen={true}
          onClose={() => {
            setOpenModalMajor(false);
            setEditingMajor(null);
          }}
          editingMajor={editingMajor}
          onSuccess={handleMajorSuccess}
        />
      )}
    </div>
  );
}

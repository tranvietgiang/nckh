import { useEffect, useRef, useState } from "react";
import axios from "../../../../config/axios";
import ModalSubject from "../Modal/ModalSubject";
import AdminHeader from "../View/AdminHeader";
import Footer from "../../../ReUse/Footer/Footer";
import { getAuth } from "../../../Constants/INFO_USER";
import BackToTop from "../../../ReUse/Top/BackToTop";
import useIsLogin from "../../../ReUse/IsLogin/IsLogin";
import dayjs from "dayjs";

export default function SubjectImportPage() {
  const { user, token } = getAuth();
  useIsLogin(user, token, "admin");

  const [subjects, setSubjects] = useState([]);
  const [subjectErrors, setSubjectErrors] = useState([]);
  const [openModalAdd, setOpenModalAdd] = useState(false);
  const [openModalEdit, setOpenModalEdit] = useState(false);
  const [currentSubject, setCurrentSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedMajorId, setSelectedMajorId] = useState("");
  const fileInputRef = useRef(null);
  const [q, setQ] = useState("");
  const [searchRows, setSearchRows] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const timerRef = useRef(null);

  // gõ để tìm (debounce) + Enter để tìm ngay ========= search engine
  const runSearch = async (value) => {
    if (!value.trim()) {
      setSearchRows([]); // xoá tìm kiếm => về dữ liệu gốc
      return;
    }
    setLoadingSearch(true);
    try {
      const res = await axios.get(
        `/search/subjects?q=${encodeURIComponent(value)}`
      );
      setSearchRows(res.data || []);
    } finally {
      setLoadingSearch(false);
    }
  };

  const onChange = (e) => {
    const v = e.target.value;
    setQ(v);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => runSearch(v), 300);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      runSearch(q); // Enter => tìm ngay
    } else if (e.key === "Escape") {
      setQ("");
      setSearchRows([]);
    }
  };

  /* tập hợp danh sách ngành từ “dữ liệu đang hiển thị” để lọc hợp lý
  Nếu ô tìm kiếm q có ký tự (sau khi trim) → dùng kết quả tìm kiếm (searchRows).
  Nếu ô tìm kiếm rỗng → dùng toàn bộ danh sách (subjects).
  */

  const baseRows = q.trim() ? searchRows : subjects;
  const filteredByMajor =
    selectedMajorId === ""
      ? baseRows
      : baseRows.filter((s) => String(s.major_id) === String(selectedMajorId));

  // displayedSubjects là dữ liệu hiển thị trong bảng
  const displayedSubjects = filteredByMajor;
  //  ========= search engine

  // Load dữ liệu ban đầu
  useEffect(() => {
    fetchSubjects();
    fetchSubjectErrors();
  }, []);

  window.onSubjectActionSuccess = () => {
    fetchSubjects(); // gọi API lấy lại dữ liệu mới nhất (updated_at mới)
  };

  // === Lấy danh sách môn học ===
  const fetchSubjects = () => {
    setLoading(true);
    axios
      .get("/get-subjects")
      .then((res) => {
        console.log(res.data);
        setSubjects(res.data || []);
      })
      .catch((err) => {
        console.error("Lỗi tải danh sách môn học:", err);
        setSubjects([]);
      })
      .finally(() => setLoading(false));
  };

  // === Lấy danh sách lỗi import ===
  const fetchSubjectErrors = () => {
    axios
      .get("/subjects/import-error")
      .then((res) => {
        setSubjectErrors(res.data.data);
        console.log(res.data.data);
      })
      .catch(() => setSubjectErrors([]));
  };

  // Xoá lỗi import
  const handleDeleteError = async () => {
    if (!window.confirm("Bạn có chắc muốn xóa toàn bộ lỗi import không?"))
      return;
    try {
      setLoading(true);
      await axios.delete("/subject/import-errors");
      await fetchSubjectErrors(); // load lại sau khi xóa
    } catch (err) {
      console.error("Lỗi khi xóa lỗi:", err);
    } finally {
      setLoading(false);
    }
  };

  // === Import Excel ===
  const openFileDialog = () => fileInputRef.current?.click();
  const handleFileChange = (e) => setSelectedFile(e.target.files?.[0] || null);

  const handleUpload = async () => {
    if (!selectedFile) return alert("❌ Vui lòng chọn file Excel trước!");
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setImporting(true);
      const res = await axios.post("/subjects/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert(
        `${"✅ Import xong!"}\n✅ Thành công: ${
          res.data.success ?? 0
        }\n❌ Lỗi: ${res.data.failed ?? 0}`
      );
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchSubjects();
      fetchSubjectErrors();
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Lỗi kết nối server!");
    } finally {
      setImporting(false);
    }
  };

  // === Modal xử lý ===
  const handleCloseAdd = () => setOpenModalAdd(false);
  const handleCloseEdit = () => {
    setOpenModalEdit(false);
    setCurrentSubject(null);
  };

  const handleEdit = (subject) => {
    setCurrentSubject(subject);
    setOpenModalEdit(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xoá môn học này?")) return;
    try {
      await axios.delete(`/subjects/${id}`);
      alert("🗑️ Xoá môn học thành công!");
      fetchSubjects();
    } catch (err) {
      alert(err.response?.data?.message_error || "❌ Lỗi khi xoá môn học!");
    }
  };

  const handleSubjectSuccess = () => fetchSubjects();

  useEffect(() => {
    window.onSubjectActionSuccess = handleSubjectSuccess;
    return () => delete window.onSubjectActionSuccess;
  }, []);

  const formatDate = (d) => dayjs(d).format("DD/MM/YYYY");

  // === Màu theo ngành
  const getMajorColor = (majorId) => {
    const colors = [
      "text-blue-600 bg-blue-50",
      "text-green-600 bg-green-50",
      "text-purple-600 bg-purple-50",
      "text-orange-600 bg-orange-50",
      "text-red-600 bg-red-50",
      "text-teal-600 bg-teal-50",
      "text-pink-600 bg-pink-50",
      "text-indigo-600 bg-indigo-50",
      "text-yellow-600 bg-yellow-50",
      "text-cyan-600 bg-cyan-50",
    ];
    const index = (majorId ?? 0) % colors.length;
    return colors[index];
  };

  //Lấy danh sách ngành duy nhất
  const majors = Array.from(
    new Map(subjects.map((s) => [s.major_id, s.major_name])).entries()
  ).map(([id, name]) => ({ id, name }));

  //Lọc theo ngành được chọn
  const filteredSubjects =
    selectedMajorId === ""
      ? subjects
      : subjects.filter((s) => s.major_id === Number(selectedMajorId));

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />
        <div className="flex">
          <div className="flex-1 p-6">
            <h1 className="text-2xl font-bold mb-2">Quản lý Môn Học</h1>
            <p className="text-gray-600 mb-4">
              Quản lý danh sách các môn học trong hệ thống
            </p>

            {/* ACTION BAR */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                Tổng {subjects?.length || 0} môn học
              </span>
              <div className="flex flex-col sm:flex-row gap-2 items-center">
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
                  {importing ? "Đang import..." : "Import Môn Học"}
                </button>
                {selectedFile && (
                  <div className="text-sm text-gray-600">
                    📄 <b>{selectedFile.name}</b>
                  </div>
                )}
              </div>
            </div>

            {/* Danh sách lỗi import (vẫn giữ nguyên) */}
            {subjectErrors?.length > 0 && (
              <div className="mt-2 bg-red-50 border border-red-300 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-red-700 mb-3">
                  ⚠️ Danh sách lỗi import môn học ({subjectErrors.length})
                </h3>

                <button
                  className="p-2 w-[120px] mb-5 rounded-md bg-red-500 hover:bg-red-600 text-white disabled:opacity-60"
                  onClick={handleDeleteError}
                  disabled={loading}
                >
                  {loading ? "Đang xóa..." : "🗑️ Xóa lỗi"}
                </button>

                <table className="min-w-full divide-y divide-red-200">
                  <thead className="bg-red-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-red-700 uppercase">
                        Tên môn
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-red-700 uppercase">
                        Ngành / Mã môn
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-red-700 uppercase">
                        Lý do lỗi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-red-100">
                    {subjectErrors.map((e, i) => (
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

            <div className="flex gap-3">
              {/* Nút thêm */}
              <button
                onClick={() => setOpenModalAdd(true)}
                className="flex items-center gap-2 mb-5 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                ➕ Thêm Môn Học
              </button>

              {/* Select chọn ngành */}
              <div className="mb-6 flex flex-col sm:flex-row items-center gap-3">
                <select
                  value={selectedMajorId}
                  onChange={(e) => setSelectedMajorId(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                >
                  <option value="">-- 🎓 Chọn ngành --</option>
                  {majors.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
                {selectedMajorId && (
                  <button
                    onClick={() => setSelectedMajorId("")}
                    className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                  >
                    ✖ Bỏ lọc
                  </button>
                )}
              </div>
            </div>
            {/** search engine-meilisearch */}
            <div className="w-full max-w-xl flex items-center gap-2">
              <input
                value={q}
                onChange={onChange}
                onKeyDown={onKeyDown}
                placeholder="Tìm môn học (tên, mã)…"
                className="w-full border rounded px-3 py-2"
              />
              {q && (
                <button
                  onClick={() => {
                    setQ("");
                    setSearchRows([]);
                  }}
                  className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                  title="Xoá tìm kiếm"
                >
                  ✖
                </button>
              )}
            </div>

            {/* Badge thống kê */}
            <div className="mt-2 text-sm text-gray-600">
              {loadingSearch ? (
                "🔎 Đang tìm…"
              ) : q.trim() ? (
                <>
                  Kết quả tìm: <b>{displayedSubjects.length}</b> môn học (từ
                  khoá: “{q}”)
                </>
              ) : (
                <>
                  Tổng: <b>{subjects.length}</b> môn học
                </>
              )}
            </div>

            {/* Bảng */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {loading ? (
                <div className="py-12 flex justify-center items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">
                    Đang tải dữ liệu...
                  </span>
                </div>
              ) : (
                <div className="w-full overflow-x-auto">
                  <table className="min-w-full border-collapse divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-2 text-xs font-semibold text-gray-600 uppercase">
                          ID
                        </th>
                        <th className="p-2 text-xs font-semibold text-gray-600 uppercase">
                          Tên môn học
                        </th>
                        <th className="p-2 text-xs font-semibold text-gray-600 uppercase">
                          Mã môn học
                        </th>
                        <th className="p-2 text-xs font-semibold text-gray-600 uppercase">
                          Ngành
                        </th>
                        <th className="p-2 text-xs font-semibold text-gray-600 uppercase">
                          Ngày tạo
                        </th>
                        <th className="p-2 text-xs font-semibold text-gray-600 uppercase">
                          Cập nhật
                        </th>
                        <th className="p-2 text-xs font-semibold text-gray-600 uppercase">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 text-sm">
                      {displayedSubjects.map((s) => (
                        <tr key={s.subject_id} className="hover:bg-gray-50">
                          <td className="p-2 text-center font-semibold text-gray-900">
                            {s.subject_id}
                          </td>
                          <td className="p-2">{s.subject_name}</td>
                          <td className="p-2 text-center">{s.subject_code}</td>
                          <td className="p-2 text-center">
                            <span
                              className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getMajorColor(
                                s.major_id
                              )}`}
                            >
                              {s.major_name}
                            </span>
                          </td>
                          <td className="p-2 text-center text-gray-500">
                            {formatDate(s.created_at)}
                          </td>
                          <td className="p-2 text-center text-gray-500">
                            {formatDate(s.updated_at)}
                          </td>
                          <td className="p-2 text-center">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => handleEdit(s)}
                                className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600"
                              >
                                Sửa
                              </button>
                              <button
                                onClick={() => handleDelete(s.subject_id)}
                                className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
                              >
                                Xoá
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {filteredSubjects.length === 0 && (
                    <div className="py-8 text-center text-gray-500">
                      Không có môn học nào
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/*Modal thêm & sửa */}
        <ModalSubject stateOpen={openModalAdd} onClose={handleCloseAdd} />
        <ModalSubject
          stateOpen={openModalEdit}
          onClose={handleCloseEdit}
          editData={currentSubject}
        />
      </div>

      <BackToTop />
    </>
  );
}

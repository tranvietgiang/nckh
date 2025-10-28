import { useEffect, useRef, useState } from "react";
import axios from "../../../../config/axios";
import { getUser } from "../../../Constants/INFO_USER";
import Navbar from "../../../ReUse/Navbar/Navbar";
import Footer from "../../Student/Home/Footer";
import RouterBack from "../../../ReUse/Back/RouterBack";
import { useNavigate } from "react-router-dom";

export default function ManagerGroups() {
  const navigate = useNavigate();
  const [majors, setMajors] = useState([]);
  const [selectedMajorId, setSelectedMajorId] = useState("");
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [groups, setGroups] = useState([]);
  const [getNameReport, setNameReport] = useState({});
  const [error, setError] = useState("");

  // --- Loading state ---
  const [loadingMajors, setLoadingMajors] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(false);

  // --- Import state ---
  const [importing, setImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileRef = useRef(null);

  // --- Error list (nhóm) ---
  const [groupError, setGroupError] = useState([]);

  const user = getUser();
  const teacherId = user?.user_id;

  // ===== 1) Lấy ngành theo giảng viên =====
  useEffect(() => {
    if (!teacherId) return;
    setLoadingMajors(true);
    axios
      .get(`/major-by-teacher/${teacherId}`)
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setMajors(list);
        if (list.length === 1) setSelectedMajorId(list[0].major_id);
      })
      .catch(() => setError("Không tải được danh sách ngành."))
      .finally(() => setLoadingMajors(false));
  }, [teacherId]);

  // ===== 2) Khi chọn ngành -> lấy lớp =====
  useEffect(() => {
    if (!selectedMajorId) {
      setClasses([]);
      setSelectedClassId("");
      return;
    }
    setLoadingClasses(true);
    axios
      .get(`/get-class-by-major/${selectedMajorId}`)
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setClasses(list);
      })
      .catch(() => setError("Không tải được danh sách lớp của ngành này."))
      .finally(() => setLoadingClasses(false));
  }, [selectedMajorId]);

  // ===== 3) Khi chọn lớp -> lấy nhóm =====
  useEffect(() => {
    if (!selectedClassId) {
      setGroups([]);
      return;
    }
    setLoadingGroups(true);
    axios
      .get(
        `/get-class-by-major-group/classes/${selectedClassId}/majors/${selectedMajorId}`
      )
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setGroups(list);
      })
      .catch(() => setError("Không tải được danh sách nhóm của lớp này."))
      .finally(() => setLoadingGroups(false));
  }, [selectedClassId, selectedMajorId]);

  // ===== 4) Lấy tên báo cáo hiện tại =====
  useEffect(() => {
    if (!selectedMajorId || !selectedClassId) return;
    axios
      .get(`/get-report/majors/${selectedMajorId}/classes/${selectedClassId}`)
      .then((res) => setNameReport(res.data))
      .catch(() => setNameReport({}));
  }, [selectedMajorId, selectedClassId]);

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString("vi-VN") : "");

  // ===== 5) IMPORT nhóm =====
  const openPicker = () => fileRef.current?.click();
  const onFileChange = (e) => setSelectedFile(e.target.files?.[0] || null);

  const handleImportGroups = async () => {
    if (!selectedMajorId) return alert("Vui lòng chọn ngành trước!");
    if (!selectedClassId) return alert("Vui lòng chọn lớp trước!");
    if (!selectedFile) return alert("Vui lòng chọn file Excel!");

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("class_id", selectedClassId);
    formData.append("report_id", getNameReport?.report_id);
    formData.append("major_id", selectedMajorId);
    formData.append("teacher_id", teacherId);

    try {
      setImporting(true);
      const res = await axios.post(`/groups/import`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert(
        `${res.data.message}\n✅ Thành công: ${res.data.success}\n❌ Lỗi: ${res.data.failed}`
      );

      if (res.data.list_import_error?.length > 0) {
        setGroupError(res.data.list_import_error);
      } else {
        setGroupError([]);
      }

      setSelectedFile(null);
      if (fileRef.current) fileRef.current.value = "";

      const r = await axios.get(
        `/get-class-by-major-group/classes/${selectedClassId}/majors/${selectedMajorId}`
      );
      const list = Array.isArray(r.data) ? r.data : r.data?.data || [];
      setGroups(list);
    } catch (err) {
      console.error("Lỗi import nhóm:", err);
      alert("❌ Lỗi import nhóm!");
    } finally {
      setImporting(false);
    }
  };

  // ===== 6) XÓA LỖI NHÓM =====
  const handleDeleteGroupError = async () => {
    if (!teacherId || !selectedClassId) return;
    try {
      if (!window.confirm("Bạn có chắc muốn xóa tất cả lỗi nhóm?")) return;
      await axios.delete(`/import-errors/delete-group-errors`, {
        data: { teacher_id: teacherId, class_id: selectedClassId },
      });
      setGroupError([]);
      alert("✅ Đã xóa danh sách lỗi nhóm.");
    } catch (error) {
      console.error("Lỗi khi xóa lỗi nhóm:", error);
      alert("❌ Không thể xóa danh sách lỗi nhóm.");
    }
  };

  // ==========================
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 p-8">
        <h1 className="text-2xl font-bold mb-2">👥 Quản lý Nhóm theo Lớp</h1>
        <p className="text-gray-600 mb-6">
          Chọn ngành → chọn lớp để xem và import nhóm.
        </p>
        <RouterBack navigate={navigate} />

        {/* ===== Chọn ngành ===== */}
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Ngành
          </label>
          <select
            value={selectedMajorId}
            onChange={(e) => setSelectedMajorId(e.target.value)}
            disabled={loadingMajors}
            className="w-full p-3 border border-gray-300 rounded-lg"
          >
            <option value="">
              {loadingMajors ? "🔄 Đang tải ngành..." : "— Chọn ngành —"}
            </option>
            {majors.map((m) => (
              <option key={m.major_id} value={m.major_id}>
                {m.major_name}
              </option>
            ))}
          </select>
        </div>

        {/* ===== Chọn lớp ===== */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Lớp
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            disabled={loadingClasses || !selectedMajorId}
            className="w-full max-w-md p-3 border border-gray-300 rounded-lg"
          >
            <option value="">
              {!selectedMajorId
                ? "— Chọn ngành trước —"
                : loadingClasses
                ? "🔄 Đang tải lớp..."
                : "— Chọn lớp —"}
            </option>
            {classes.map((c) => (
              <option
                key={c.class_id_teacher ?? c.class_id}
                value={c.class_id_teacher ?? c.class_id}
              >
                {c.class_name || `Lớp #${c.class_id}`}
              </option>
            ))}
          </select>
        </div>

        {/* ===== Import nhóm ===== */}
        {selectedClassId && (
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={onFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={openPicker}
                className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
              >
                <span>📁</span> Chọn file Excel
              </button>
              <button
                type="button"
                onClick={handleImportGroups}
                disabled={!selectedFile || importing}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white transition ${
                  !selectedFile || importing
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {importing ? "Đang import..." : "Import Nhóm"}
              </button>
              {selectedFile && (
                <div className="text-sm text-gray-600">
                  📄 Đã chọn: <b>{selectedFile.name}</b>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== Danh sách nhóm ===== */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-3 border-b">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Danh sách nhóm</span>
              {selectedClassId && (
                <span className="bg-green-100 text-green-800 px-3 py-0.5 rounded-full text-xs">
                  Báo cáo: {getNameReport?.report_name ?? "Chưa có"}
                </span>
              )}
            </div>
          </div>

          {loadingGroups ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Đang tải nhóm...</span>
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              Lớp này chưa có nhóm.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                      Tên nhóm
                    </th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                      Trưởng nhóm
                    </th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                      Số thành viên
                    </th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                      Ngày tạo
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {groups.map((g, idx) => (
                    <tr
                      key={g.rm_code ?? g.report_member_idx ?? idx}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-3">{idx + 1}</td>
                      <td className="px-6 py-3 font-medium text-gray-900">
                        {g?.rm_name ?? "-"}
                      </td>
                      <td className="px-6 py-3">{g?.leader_name || "—"}</td>
                      <td className="px-6 py-3">
                        {g.member_count ?? g.members_count ?? 0}
                      </td>
                      <td className="px-6 py-3">{formatDate(g.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ===== Danh sách lỗi nhóm ===== */}
        {groupError?.length > 0 && (
          <div className="mt-8 bg-red-50 border border-red-300 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-red-700 mb-3">
              ⚠️ Danh sách lỗi nhóm ({groupError.length})
            </h3>

            <button
              className="p-2 mb-5 rounded-md bg-red-500 hover:bg-red-600 text-white"
              onClick={handleDeleteGroupError}
            >
              Xóa lỗi
            </button>

            <table className="min-w-full divide-y divide-red-200">
              <thead className="bg-red-100">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-red-700 uppercase">
                    MSSV
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-red-700 uppercase">
                    Tên nhóm
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-red-700 uppercase">
                    Lý do lỗi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-red-100">
                {groupError.map((e, i) => (
                  <tr key={i} className="hover:bg-red-50">
                    <td className="px-4 py-2 text-sm text-gray-800">
                      {e.user_id}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800">
                      {e.fullname}
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
      </div>
      <Footer />
    </>
  );
}

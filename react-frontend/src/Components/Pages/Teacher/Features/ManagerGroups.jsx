import { useEffect, useRef, useState } from "react";
import axios from "../../../../config/axios";
import { getAuth } from "../../../Constants/INFO_USER";
import Navbar from "../../../ReUse/Navbar/Navbar";
import Footer from "../../Student/Home/Footer";
import RouterBack from "../../../ReUse/Back/RouterBack";
import { useNavigate } from "react-router-dom";
import ModalViewDetailGroups from "../Modal/ModalViewDetailGroups";
import useRoleTeacher from "../../../ReUse/IsLogin/RoleTeacher";
import BackToTop from "../../../ReUse/Top/BackToTop";
import IsLogin from "../../../ReUse/IsLogin/IsLogin";
export default function ManagerGroups() {
  useEffect(() => {
    document.title = "Quản lý Nhóm ";
  }, []);

  const navigate = useNavigate();
  const [majors, setMajors] = useState([]);
  const [selectedMajorId, setSelectedMajorId] = useState("");
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [groups, setGroups] = useState([]);
  const [getErrorImport, setErrorImport] = useState([]);
  const [getNameReport, setNameReport] = useState({});
  const [getRmCode, setRmCode] = useState(null);
  const [statusOpen, setStatusOpen] = useState(false);

  const [loadingMajors, setLoadingMajors] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(false);

  const [importing, setImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileRef = useRef(null);

  const { user, token } = getAuth();
  const teacherId = user?.user_id;
  IsLogin(user, token);
  useRoleTeacher(user?.role);

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
      .catch(console.error)
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
      .get(`/get-class-by-major-teacher/${selectedMajorId}`)
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];

        setClasses(list);
      })
      .catch(console.error)
      .finally(() => setLoadingClasses(false));
  }, [selectedMajorId]);

  // ===== 3) Khi chọn lớp -> lấy nhóm =====
  const fetchGroups = () => {
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
      .catch(console.error)
      .finally(() => setLoadingGroups(false));
  };

  useEffect(() => {
    fetchGroups();
  }, [selectedClassId, selectedMajorId]);

  // ===== 4) Lấy lỗi khi import =====
  useEffect(() => {
    if (!selectedMajorId || !selectedClassId) {
      setErrorImport([]);
      return;
    }
    axios
      .get(
        `/get-group-errors/majors/${selectedMajorId}/classes/${selectedClassId}`
      )
      .then((res) => {
        setErrorImport(res.data);
      })
      .catch((err) => {
        setErrorImport([]);
        console.log(err);
      });
  }, [selectedMajorId, selectedClassId]);

  // ===== 5) Lấy báo cáo hiện tại =====
  useEffect(() => {
    if (!selectedMajorId || !selectedClassId) return;
    axios
      .get(`/get-report/majors/${selectedMajorId}/classes/${selectedClassId}`)
      .then((res) => setNameReport(res.data))
      .catch((error) => {
        console.log(error);
      });
  }, [selectedMajorId, selectedClassId]);

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString("vi-VN") : "");

  // ===== 6) IMPORT nhóm =====
  const openPicker = () => fileRef.current?.click();
  const onFileChange = (e) => setSelectedFile(e.target.files?.[0] || null);

  const handleImportGroups = async () => {
    if (!getNameReport?.report_id) {
      return alert("❌ Lớp này chưa có báo cáo! Không thể import nhóm.");
    }
    if (!selectedMajorId) return alert("Vui lòng chọn ngành trước!");
    if (!selectedClassId) return alert("Vui lòng chọn lớp trước!");
    if (!selectedFile) return alert("Vui lòng chọn file Excel!");

    const formData = new FormData();
    formData.append("file", selectedFile ?? "");
    formData.append("class_id", selectedClassId ?? "");
    formData.append("report_id", getNameReport?.report_id ?? "");
    formData.append("major_id", selectedMajorId ?? "");
    formData.append("teacher_id", teacherId ?? "");

    try {
      setImporting(true);
      const res = await axios.post(`/groups/import`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert(
        `${res.data.message}\n✅ Thành công: ${res.data.success}\n❌ Lỗi: ${res.data.failed}`
      );

      setErrorImport(res.data.list_import_error || []);
      setSelectedFile(null);
      if (fileRef.current) fileRef.current.value = "";
      fetchGroups();
    } catch (err) {
      alert(err.response?.data?.message_error || "Lỗi kết nối server!");
    } finally {
      setImporting(false);
    }
  };

  // ===== 7) XÓA LỖI NHÓM =====
  const handleDeleteGroupError = async () => {
    if (!teacherId || !selectedClassId) return;
    if (!window.confirm("Bạn có chắc muốn xóa tất cả lỗi nhóm?")) return;
    try {
      await axios.delete(`/import-errors/delete-group-errors`, {
        data: { teacher_id: teacherId, class_id: selectedClassId },
      });
      setErrorImport([]);
      alert("✅ Đã xóa danh sách lỗi nhóm.");
    } catch (error) {
      console.error(error);
      alert("❌ Không thể xóa danh sách lỗi nhóm.");
    }
  };

  // ===== 8) XÓA TOÀN BỘ NHÓM =====
  const handleDeleteAllGroups = async () => {
    if (!selectedClassId) return alert("Vui lòng chọn lớp trước!");
    if (!teacherId) return alert("Thiếu thông tin giảng viên!");

    if (
      !window.confirm(
        "⚠️ Bạn có chắc muốn xóa TẤT CẢ nhóm trong lớp này?\nHành động này không thể hoàn tác!"
      )
    )
      return;

    try {
      const res = await axios.delete(`/groups/delete-by-class`, {
        data: {
          class_id: selectedClassId,
          teacher_id: teacherId,
        },
      });

      if (res.data?.success) {
        alert("✅ Đã xóa toàn bộ nhóm trong lớp!");
        setGroups([]);
      } else {
        alert(res.data?.message_error || "❌ Xóa nhóm thất bại!");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi kết nối server khi xóa nhóm!");
    }
  };

  const handleViewDetail = (rm_code) => {
    if (!rm_code) return;
    setRmCode(rm_code);
  };
  console.log(getNameReport);
  // ========================== UI ==========================
  return (
    <>
      <Navbar />
      <BackToTop />
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
                {`Lớp: ${c.class_name} - Tên: ${c.subject_name}`}
              </option>
            ))}
          </select>
        </div>

        {/* ===== Import nhóm + Xóa nhóm ===== */}
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
                📁 Chọn file Excel
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

              {/* ✅ Nút xóa tất cả nhóm */}
              <button
                type="button"
                onClick={handleDeleteAllGroups}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 transition"
              >
                🗑️ Xóa tất cả nhóm
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
          <div className="px-4 py-3 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-lg">Danh sách nhóm</span>
              {selectedClassId && (
                <span className="bg-green-100 text-green-800 px-3 py-0.5 rounded-full text-xs">
                  Báo cáo: {getNameReport?.report_name ?? "Chưa có"}
                </span>
              )}
            </div>
            {/* ✅ Select chọn nhóm nhanh */}
            {groups.length > 0 && (
              <div className="flex items-center gap-2">
                <select
                  onChange={(e) => {
                    const rmCode = e.target.value;
                    if (rmCode) {
                      setRmCode(rmCode);
                      setStatusOpen(true);
                    }
                  }}
                  className="p-2 border border-gray-300 rounded-md text-sm w-full sm:w-auto"
                >
                  <option value="">— Chọn nhóm để xem nhanh —</option>
                  {groups.map((g) => (
                    <option key={g.rm_code} value={g.rm_code}>
                      {`${g.rm_name || "Nhóm chưa đặt tên"} — Trưởng nhóm: ${
                        g?.leader_name ? g?.leader_name : "Chưa có trưởng nhóm"
                      }`}
                    </option>
                  ))}
                </select>

                <button
                  onClick={fetchGroups}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  Làm mới
                </button>
              </div>
            )}
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
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                      Xem chi tiết
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {groups.map((g, idx) => {
                    return (
                      <tr
                        key={g.rm_code ?? g.report_member_idx ?? idx}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-3">{idx + 1}</td>
                        <td className="px-6 py-3 font-medium text-gray-900">
                          {g?.rm_name ?? "-"}
                        </td>
                        <td className={`px-6 py-3 `}>
                          {g?.leader_name || "—"}
                          {g.role === "NT" && " (Trưởng nhóm)"}
                          {g.role === "NP" && " (Phó nhóm)"}
                        </td>
                        <td className="px-6 py-3">
                          {g.member_count ?? g.members_count ?? 0}
                        </td>
                        <td className="px-6 py-3">
                          {formatDate(g.created_at)}
                        </td>
                        <td className="px-6 py-3">
                          <button
                            onClick={() => {
                              handleViewDetail(g?.rm_code);
                              setStatusOpen(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                          >
                            Xem chi tiết
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ===== Danh sách lỗi nhóm ===== */}
        {getErrorImport?.length > 0 && (
          <div className="mt-8 bg-red-50 border border-red-300 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-red-700 mb-3">
              ⚠️ Danh sách lỗi nhóm ({getErrorImport.length})
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
                {getErrorImport.map((e, i) => (
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

      <ModalViewDetailGroups
        statusOpen={statusOpen}
        onClose={setStatusOpen}
        rm_code={getRmCode}
        majorId={selectedMajorId}
        classId={selectedClassId}
      />
      <Footer />
    </>
  );
}

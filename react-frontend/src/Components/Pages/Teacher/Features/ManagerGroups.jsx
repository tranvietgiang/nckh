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

  const [loadingMajors, setLoadingMajors] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [error, setError] = useState("");

  // --- Import state ---
  const [importing, setImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileRef = useRef(null);

  const user = getUser();
  const teacherId = user?.user_id || "";

  // 1) Lấy ngành theo giảng viên
  useEffect(() => {
    if (!teacherId) return;
    setLoadingMajors(true);
    setError("");
    axios
      .get(`/major-by-teacher/${teacherId}`)
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setMajors(list);
        if (list.length === 1) setSelectedMajorId(list[0].major_id);
        else {
          setSelectedMajorId("");
        }
        setClasses([]);
        setSelectedClassId("");
        setGroups([]);
      })
      .catch((err) => {
        console.error("Lỗi tải ngành:", err);
        setError("Không tải được danh sách ngành.");
        setMajors([]);
      })
      .finally(() => setLoadingMajors(false));
  }, [teacherId]);

  // 2) Khi chọn ngành -> lấy lớp theo ngành
  useEffect(() => {
    if (!selectedMajorId) {
      setClasses([]);
      setSelectedClassId("");
      return;
    }
    setLoadingClasses(true);
    setError("");
    axios
      .get(`/get-class-by-major/${selectedMajorId}`)
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setClasses(list);
        setSelectedClassId("");
        setGroups([]);
      })
      .catch((err) => {
        console.error("Lỗi tải lớp:", err);
        setError("Không tải được danh sách lớp của ngành này.");
        setClasses([]);
      })
      .finally(() => setLoadingClasses(false));
  }, [selectedMajorId]);

  // 3) Khi chọn lớp -> lấy nhóm theo lớp + ngành
  useEffect(() => {
    if (!selectedClassId) {
      setGroups([]);
      return;
    }
    setLoadingGroups(true);
    setError("");
    axios
      .get(
        `/get-class-by-major-group/classes/${selectedClassId}/majors/${selectedMajorId}`
      )
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setGroups(list);
      })
      .catch((err) => {
        console.error("Lỗi tải nhóm:", err);
        setError("Không tải được danh sách nhóm của lớp này.");
        setGroups([]);
      })
      .finally(() => setLoadingGroups(false));
  }, [selectedClassId, selectedMajorId]);

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString("vi-VN") : "");

  // ====== IMPORT NHÓM (chỉ hiện khi đã chọn lớp) ======
  const openPicker = () => fileRef.current?.click();
  const onFileChange = (e) => setSelectedFile(e.target.files?.[0] || null);

  const handleImportGroups = async () => {
    if (!selectedMajorId) return alert("Vui lòng chọn ngành trước!");
    if (!selectedClassId) return alert("Vui lòng chọn lớp trước!");
    if (!selectedFile) return alert("Vui lòng chọn file Excel!");

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("class_id", selectedClassId);
    formData.append("major_id", selectedMajorId);

    try {
      setImporting(true);
      // ✅ ĐỔI endpoint này theo backend của bạn nếu khác
      // ví dụ cũng có thể là: /groups/import-by-class/{class_id}
      const res = await axios.post(`/groups/import`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert(
        `${res.data.message || "Import xong!"}\n` +
          `✅ Thành công: ${res.data.total_success ?? 0}\n` +
          `❌ Lỗi: ${res.data.total_failed ?? 0}`
      );

      // reset file
      setSelectedFile(null);
      if (fileRef.current) fileRef.current.value = "";

      // refresh danh sách nhóm
      const r = await axios.get(
        `/get-class-by-major-group/classes/${selectedClassId}/majors/${selectedMajorId}`
      );
      const list = Array.isArray(r.data) ? r.data : r.data?.data || [];
      setGroups(list);
    } catch (err) {
      console.error("Lỗi import nhóm:", err?.response?.data || err);
      const msg =
        err?.response?.data?.message_error ||
        err?.response?.data?.message ||
        "❌ Lỗi import nhóm!";
      alert(msg);
    } finally {
      setImporting(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 p-8">
        <h1 className="text-2xl font-bold mb-2">👥 Quản lý Nhóm theo Lớp</h1>
        <p className="text-gray-600 mb-6">
          Chọn ngành → chọn lớp để xem và import nhóm.
        </p>

        <RouterBack navigate={navigate} />
        {/* Chọn ngành */}
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="w-full md:w-1/2">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Ngành
              </label>

              {majors.length <= 1 ? (
                <div className="flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {loadingMajors
                      ? "🔄 Đang tải..."
                      : majors[0]?.major_name || "Không có ngành"}
                  </span>
                </div>
              ) : (
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
              )}
            </div>

            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
              Tổng {majors.length} ngành
            </span>
          </div>

          {!!error && (
            <div className="mt-3 text-sm text-red-600">❌ {error}</div>
          )}
        </div>

        {/* Chọn lớp */}
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
            {/* Lưu ý: dùng đúng field id mà API trả, ở trên bạn đang dùng class_id_teacher */}
            {classes.map((c) => (
              <option
                key={c.class_id_teacher ?? c.class_id}
                value={c.class_id_teacher ?? c.class_id}
              >
                {c.class_name || `Lớp #${c.class_id_teacher ?? c.class_id}`}
              </option>
            ))}
          </select>
        </div>

        {/* Import nhóm: CHỈ HIỂN THỊ KHI ĐÃ CHỌN LỚP */}
        {selectedClassId && (
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
              <div className="flex items-center gap-2 flex-wrap">
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

              <div className="text-xs text-gray-500">
                (Ngành:{" "}
                <b>
                  {
                    majors.find((m) => m.major_id == selectedMajorId)
                      ?.major_name
                  }
                </b>
                , Lớp:{" "}
                <b>
                  {classes.find(
                    (x) => (x.class_id_teacher ?? x.class_id) == selectedClassId
                  )?.class_name || selectedClassId}
                </b>
                )
              </div>
            </div>
          </div>
        )}

        {/* Danh sách nhóm */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-3 border-b">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Danh sách nhóm</span>
              {selectedClassId && (
                <>
                  <span className="bg-blue-100 text-blue-800 px-3 py-0.5 rounded-full text-xs">
                    Ngành:{" "}
                    {majors.find((m) => m.major_id == selectedMajorId)
                      ?.major_name || selectedMajorId}
                  </span>
                  <span className="bg-green-100 text-green-800 px-3 py-0.5 rounded-full text-xs">
                    Lớp:{" "}
                    {classes.find(
                      (x) =>
                        (x.class_id_teacher ?? x.class_id) == selectedClassId
                    )?.class_name || selectedClassId}
                  </span>
                </>
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
              {!selectedMajorId
                ? "Hãy chọn ngành trước."
                : !selectedClassId
                ? "Hãy chọn lớp."
                : "Lớp này chưa có nhóm."}
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
                      Thao tác
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
                        {g.member_count ??
                          g.members_count ??
                          g.total_members ??
                          0}
                      </td>
                      <td className="px-6 py-3">{formatDate(g.created_at)}</td>
                      <td className="px-6 py-3">
                        <button className="px-3 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700">
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

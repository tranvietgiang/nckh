import { useEffect, useRef, useState } from "react";
import axios from "../../../../config/axios";
import ModalSubject from "../Modal/ModalSubject";
import AdminHeader from "../View/AdminHeader";

export default function SubjectImportPage() {
  const [subjects, setSubjects] = useState([]);
  const [subjectErrors, setSubjectErrors] = useState([]);
  const [openModalAdd, setOpenModalAdd] = useState(false);
  const [openModalEdit, setOpenModalEdit] = useState(false);
  const [currentSubject, setCurrentSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  // 🟢 Load dữ liệu ban đầu
  useEffect(() => {
    fetchSubjects();
    fetchSubjectErrors();
  }, []);

  // === Lấy danh sách môn học ===
  const fetchSubjects = () => {
    setLoading(true);
    axios
      .get("/get-subjects")
      .then((res) => setSubjects(res.data || []))
      .catch((err) => {
        console.error("Lỗi tải danh sách môn học:", err);
        setSubjects([]);
      })
      .finally(() => setLoading(false));
  };

  // === Lấy danh sách lỗi import ===
  const fetchSubjectErrors = () => {
    axios
      .get("/pc/get-errors/subject")
      .then((res) => setSubjectErrors(res.data || []))
      .catch(() => setSubjectErrors([]));
  };

  // === Xoá lỗi import ===
  const handleDeleteError = () => {
    if (!subjectErrors.length) return;
    if (!window.confirm("Bạn có chắc muốn xóa toàn bộ lỗi import môn học?"))
      return;
    axios
      .delete("/pc/import-errors/subject")
      .then(() => {
        alert("🗑️ Đã xóa danh sách lỗi import môn học!");
        setSubjectErrors([]);
      })
      .catch(() => alert("❌ Không thể xóa lỗi!"));
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

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString("vi-VN") : "-");

  // === Hàm lấy màu cho từng ngành ===
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
    const index = majorId % colors.length;
    return colors[index];
  };

  // === Nhóm môn học theo ngành ===
  const groupedSubjects = subjects.reduce((acc, subject) => {
    const majorId = subject.major_id;
    if (!acc[majorId]) {
      acc[majorId] = {
        major_name: subject.major_name,
        subjects: [],
        color: getMajorColor(majorId),
      };
    }
    acc[majorId].subjects.push(subject);
    return acc;
  }, {});

  // === JSX ===
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="flex">
        <div className="flex-1 p-6">
          <h1 className="text-2xl font-bold mb-2">Quản lý Môn Học</h1>
          <p className="text-gray-600 mb-6">
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
          {subjectErrors.length > 0 && (
            <div className="mt-8 bg-red-50 border border-red-300 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-red-700 mb-3">
                ⚠️ Danh sách lỗi import ngành ({subjectErrors.length})
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
          {/* Nút thêm */}
          <button
            onClick={() => setOpenModalAdd(true)}
            className="flex items-center gap-2 mb-5 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            ➕ Thêm Môn Học
          </button>

          {/* Bảng */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="py-12 flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Đang tải dữ liệu...</span>
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
                    {Object.entries(groupedSubjects).map(([, group]) =>
                      group.subjects.map((s) => (
                        <tr key={s.subject_id} className="hover:bg-gray-50">
                          <td className="p-2 text-center font-semibold text-gray-900">
                            {s.subject_id}
                          </td>
                          <td className="p-2">{s.subject_name}</td>
                          <td className="p-2 text-center">{s.subject_code}</td>
                          <td className="p-2 text-center">
                            <span
                              className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${group.color}`}
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
                      ))
                    )}
                  </tbody>
                </table>

                {subjects.length === 0 && (
                  <div className="py-8 text-center text-gray-500">
                    Không có môn học nào
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ Modal thêm & sửa */}
      <ModalSubject stateOpen={openModalAdd} onClose={handleCloseAdd} />
      <ModalSubject
        stateOpen={openModalEdit}
        onClose={handleCloseEdit}
        editData={currentSubject}
      />
    </div>
  );
}

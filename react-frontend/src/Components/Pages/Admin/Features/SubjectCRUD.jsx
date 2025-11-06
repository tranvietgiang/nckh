import { useEffect, useRef, useState } from "react";
import axios from "../../../../config/axios";
import ModalSubject from "../Modal/ModalAddSubject";
import ModalEditSubject from "../Modal/ModalAddSubject";
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
        `${res.data.message || "✅ Import xong!"}\n✅ Thành công: ${
          res.data.success ?? 0
        }\n❌ Lỗi: ${res.data.failed ?? 0}`
      );
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchSubjects();
      fetchSubjectErrors();
    } catch (err) {
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
      if (err.response && err.response.data) {
        alert(err.response?.data?.message_error);
      } else {
        alert("❌ Lỗi khi xoá môn học!");
      }
    }
  };

  const handleSubjectSuccess = () => fetchSubjects();

  useEffect(() => {
    window.onSubjectActionSuccess = handleSubjectSuccess;
    return () => delete window.onSubjectActionSuccess;
  }, []);

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString("vi-VN") : "-");

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

          {/* Nút thêm */}
          <button
            onClick={() => setOpenModalAdd(true)}
            className="flex items-center gap-2 mb-5 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            ➕ Thêm Môn Học
          </button>

          {/* Bảng */}
          {/* BẢNG MÔN HỌC RESPONSIVE */}
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
                      <th className="p-2 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">
                        ID
                      </th>
                      <th className="p-2 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">
                        Tên môn học
                      </th>
                      <th className="p-2 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">
                        Mã môn học
                      </th>
                      <th className="p-2 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">
                        Mã ngành
                      </th>
                      <th className="p-2 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">
                        Ngày tạo
                      </th>
                      <th className="p-2 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">
                        Cập nhật
                      </th>
                      <th className="p-2 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 text-sm">
                    {subjects.map((s) => (
                      <tr key={s.subject_id} className="hover:bg-gray-50">
                        <td className="p-2 font-semibold text-gray-900 text-center">
                          {`${s.subject_id}`.padStart(2, "0")}
                        </td>
                        <td className="p-2 text-gray-800 truncate max-w-[160px]">
                          {s.subject_name}
                        </td>
                        <td className="p-2 text-gray-800 text-center">
                          {s.subject_code}
                        </td>
                        <td className="p-2 text-gray-800 text-center">
                          {s.major_id}
                        </td>
                        <td className="p-2 text-gray-500 whitespace-nowrap text-center">
                          {formatDate(s.created_at)}
                        </td>
                        <td className="p-2 text-gray-500 whitespace-nowrap text-center">
                          {formatDate(s.updated_at)}
                        </td>
                        <td className="p-2 whitespace-nowrap text-center">
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

                {/* Khi không có dữ liệu */}
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

      {/* Modal thêm & sửa */}
      <ModalSubject stateOpen={openModalAdd} onClose={handleCloseAdd} />
      <ModalEditSubject
        stateOpen={openModalEdit}
        onClose={handleCloseEdit}
        subject={currentSubject}
      />
    </div>
  );
}

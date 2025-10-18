import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import axios from "../../../config/axios";

function ImportStudents() {
  const [file, setFile] = useState(null);
  const [students, setStudents] = useState([]);
  const [studentError, setStudentErrors] = useState([]);
  const [totalStudent, setTotalStudent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [stateDeleteStudentError, setStateDeleteStudentError] = useState(true);
  const navigate = useNavigate();
  const idTeacher = "gv001";
  // Xử lý chọn file
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Upload và lấy danh sách
  const handleImport = async () => {
    if (!file) {
      alert("Vui lòng chọn file Excel trước!");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Gửi file tới Laravel API
      const res = await axios.post("/students/import", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const { success, failed, total_student, duplicates } = res.data;

      if (duplicates && duplicates.length > 0) {
        if (failed >= 1) {
          setStudentErrors(duplicates);
          localStorage.setItem(
            `cache_student_import_error`,
            JSON.stringify(duplicates)
          );
        } else {
          localStorage.removeItem(`cache_student_import_error`);
        }
      }

      alert(
        `✅ Import hoàn tất!\n` +
          `Thành công: ${success}\n` +
          `Lỗi: ${failed}\n` +
          `Tổng SV: ${total_student}`
      );

      const res_student = await axios.get("/get-students");
      setStudents(res_student.list_student);
      setTotalStudent(res_student.total_student);
    } catch (error) {
      console.error(error);
      alert("❌ Lỗi khi import file!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const get_student_error = JSON.parse(
      localStorage.getItem(`cache_student_import_error`)
    );

    if (get_student_error?.length > 1) {
      setStateDeleteStudentError(false);
      setStudentErrors(get_student_error);
    } else {
      localStorage.removeItem(`cache_student_import_error`);
      setStateDeleteStudentError(true);
    }

    axios
      .get("/get-students")
      .then((res) => {
        setStudents(res.data.list_student);
        setTotalStudent(res.data.total_student);
        console.log(res.data);
      })
      .catch((e) => {
        console.log(e);
      });
  }, []);

  const handleDeleteStudent = () => {
    if (!idTeacher) return;
    localStorage.removeItem(`cache_student_import_error`);
    setStateDeleteStudentError(true);
    window.location.reload();
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              📥 Import Danh Sách Sinh Viên
            </h1>
            <p className="text-gray-600">
              Tải lên file Excel để import danh sách sinh viên vào hệ thống
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 mb-3 rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            Quay lại
          </button>
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn file Excel
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".xlsx,.xls,.csv"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {file && (
                  <p className="mt-2 text-sm text-green-600">
                    ✅ Đã chọn: {file.name}
                  </p>
                )}
              </div>

              <button
                onClick={handleImport}
                disabled={loading || !file}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang import...</span>
                  </>
                ) : (
                  <>
                    <span>📤</span>
                    <span>Import</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Stats */}
          {totalStudent > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <span className="text-green-600 text-lg">📊</span>
                <span className="text-green-800 font-semibold">
                  Tổng số sinh viên: {totalStudent}
                </span>
              </div>
            </div>
          )}
          <button
            onClick={() => handleDeleteStudent()}
            className={` text-white font-semibold py-1 px-3 mb-3 rounded-lg transition-colors duration-200 flex items-center space-x-2 ${
              stateDeleteStudentError
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
            }`}
          >
            Xóa sinh viên lỗi
          </button>
          {/* Danh sách lỗi / trùng */}
          {studentError.length > 0 && (
            <div className="mt-8 bg-red-50 border border-red-300 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-red-700 mb-3">
                ⚠️ Danh sách sinh viên bị trùng hoặc lỗi ({studentError.length})
              </h3>
              <table className="min-w-full divide-y divide-red-200">
                <thead className="bg-red-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-red-700 uppercase">
                      MSSV
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-red-700 uppercase">
                      Họ tên
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-red-700 uppercase">
                      Email
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-red-100">
                  {studentError.map((e, index) => (
                    <tr key={index} className="hover:bg-red-50">
                      <td className="px-4 py-2 text-sm text-gray-800">
                        {e.msv}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-800">
                        {e.ten}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-800">
                        {e.email}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                📋 Danh Sách Sinh Viên
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      MSSV
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Họ tên
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày sinh
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students?.length > 0 ? (
                    students.map((s) => (
                      <tr key={s.user_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {s?.user_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {s?.fullname}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {s?.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {s?.phone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {s?.birthdate}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center">
                        <div className="text-gray-500 text-lg">
                          📭 Không có sinh viên nào
                        </div>
                        <p className="text-gray-400 text-sm mt-2">
                          Hãy import file Excel để thêm sinh viên
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ImportStudents;

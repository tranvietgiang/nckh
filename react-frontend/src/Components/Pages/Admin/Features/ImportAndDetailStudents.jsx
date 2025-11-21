import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import axios from "../../../../config/axios";
import AdminHeader from "../View/AdminHeader";
import Footer from "../../Student/Home/Footer";
import RouterBack from "../../../ReUse/Back/RouterBack";
import { getAuth } from "../../../Constants/INFO_USER";
import IsLogin from "../../../ReUse/IsLogin/IsLogin";
import {
  getSafeJSON,
  setSafeJSON,
} from "../../../ReUse/LocalStorage/LocalStorageSafeJSON";

import RoleAdmin from "../../../ReUse/IsLogin/RoleAdmin";
import BackToTop from "../../../ReUse/Top/BackToTop";

export default function ImportAndDetailStudents() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [studentError, setStudentErrors] = useState([]);
  const [totalStudent, setTotalStudent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("all");
  const navigate = useNavigate();
  const { user, token } = getAuth();
  const [file, setFile] = useState(null);
  const location = useLocation();

  const role = user?.role;

  const class_id = location.state?.class_id;
  const major_id = location.state?.major_id;
  const teacher_id = location.state?.teacher_id;
  const subject_id = location.state?.subject_id;
  const academic_year = location.state?.academic_year;
  const semester = location.state?.semester;

  const typeView = location.state?.view;
  const checkPage = typeView === 1 ? true : false;

  const name_class = location.state?.name_class;

  useEffect(() => {
    document.title = checkPage ? "Trang Xem chi tiết" : "Trang Import";
  }, [checkPage]);

  IsLogin(user, token);
  RoleAdmin(role);

  // Hàm tìm kiếm
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setFilteredStudents(students);
      return;
    }

    const filtered = students.filter((student) => {
      const term = searchTerm.toLowerCase().trim();
      switch (searchType) {
        case "mssv":
          return student.user_id?.toLowerCase().includes(term);
        case "name":
          return student.fullname?.toLowerCase().includes(term);
        case "email":
          return student.email?.toLowerCase().includes(term);
        case "phone":
          return student.phone?.toLowerCase().includes(term);
        default:
          return (
            student.user_id?.toLowerCase().includes(term) ||
            student.fullname?.toLowerCase().includes(term) ||
            student.email?.toLowerCase().includes(term) ||
            student.phone?.toLowerCase().includes(term)
          );
      }
    });
    setFilteredStudents(filtered);
  };

  useEffect(() => {
    handleSearch();
  }, [searchTerm, searchType, students]);

  const handleResetSearch = () => {
    setSearchTerm("");
    setSearchType("all");
    setFilteredStudents(students);
  };

  // Xử lý chọn file
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  console.log(
    class_id,
    major_id,
    teacher_id,
    subject_id,
    academic_year,
    semester
  );
  // Upload và lấy danh sách
  const handleImport = async () => {
    if (!file) {
      alert("Vui lòng chọn file Excel trước!");
      return;
    }

    if (!class_id || !major_id || !teacher_id)
      return alert("Thiếu dữ liệu lớp hoặc giáo viên!");

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("class_id", class_id);
    formData.append("major_id", major_id);
    formData.append("teacher_id", String(teacher_id));
    formData.append("subject_id", subject_id);
    formData.append("academic_year", academic_year);
    formData.append("semester", semester);
    try {
      // Gửi file tới Laravel API
      const res = await axios.post("/students/import", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const { success, failed, total_student, list_import_error } = res.data;

      if (failed > 0) {
        setStudentErrors(list_import_error);
      }

      alert(
        `✅ Import hoàn tất!\n` +
          `Thành công: ${success}\n` +
          `Lỗi: ${failed}\n` +
          `Tổng SV: ${total_student}`
      );

      FetchDataStudentByClass();
    } catch (err) {
      if (err.response && err.response.data) {
        alert(err.response.data.message);
      } else {
        alert("Lỗi kết nối server!");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {}, []);

  const FetchDataStudentByClass = () => {
    if (!class_id) {
      setStudents([]);
      return;
    }
    const data_students_current = getSafeJSON(
      `data_students_current_${class_id}_${teacher_id}_${major_id}`
    );

    const total_student_current = getSafeJSON(
      `total_student_current_${class_id}_${teacher_id}_${major_id}`
    );

    if (
      Array.isArray(data_students_current) &&
      data_students_current.length > 0
    ) {
      setStudents(data_students_current);
    }

    if (
      typeof total_student_current === "number" &&
      total_student_current > 0
    ) {
      setTotalStudent(total_student_current);
    }

    const get_student_error = getSafeJSON(
      `student_import_error_${class_id}_${teacher_id}_${major_id}`
    );

    if (Array.isArray(get_student_error) && get_student_error?.length > 0) {
      setStudentErrors(get_student_error);
    }

    axios
      .get(
        `/classes/${class_id}/teachers/${teacher_id}/major/${major_id}/student-errors`
      )
      .then((res) => {
        setStudentErrors(res.data);
        setSafeJSON(
          `student_import_error_${class_id}_${teacher_id}_${major_id}`,
          JSON.stringify(res.data)
        );
      })
      .catch((error) => {
        setStudentErrors([]);
        console.log(error);
      });

    axios
      .get(`/classes/${class_id}/teachers/${teacher_id}/students`)
      .then((res) => {
        setStudents(res.data.list_student);
        setTotalStudent(res.data.total_student);
        setSafeJSON(
          `data_students_current_${class_id}_${teacher_id}_${major_id}`,
          JSON.stringify(res.data.list_student)
        );
        setSafeJSON(
          `total_student_current_${class_id}_${teacher_id}_${major_id}`,
          JSON.stringify(res.data.totalStudent)
        );
      })
      .catch((e) => {
        console.log(e);
      });
  };

  useEffect(() => {
    FetchDataStudentByClass();
  }, [class_id]);

  const handleDeleteError = async () => {
    const confirmDelete = window.confirm(
      "Bạn có chắc muốn xóa toàn bộ lỗi của lớp này không?"
    );
    if (!confirmDelete) return;

    try {
      const res = await axios.delete(
        `/student-errors/classes/${class_id}/teacher/${teacher_id}/major/${major_id}`
      );

      console.log(res.data);

      alert("✅ Xóa lỗi thành công!");
      window.location.reload();
    } catch (error) {
      if (error.response && error.response.data) {
        alert(`❌ ${error.response.data.message_error}`);
      } else {
        alert("❌ Lỗi server. Vui lòng thử lại sau!");
      }
      console.log("error", error);
    }
  };

  return (
    <>
      <AdminHeader />
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              👥 Chi Tiết Lớp Học
            </h1>
            <p className="text-gray-600">
              Xem thông tin chi tiết danh sách sinh viên trong lớp
            </p>
          </div>

          <div className="text-center m-5 text-2xl font-bold">
            Tên lớp: {name_class || "Không xác định"}
          </div>

          <RouterBack navigate={navigate} />

          {/* Thống kê */}
          {!loading && totalStudent > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-blue-600 text-lg">📊</span>
                  <span className="text-blue-800 font-semibold">
                    Tổng số sinh viên: {totalStudent}
                  </span>
                </div>
                <div className="text-blue-700 font-medium">
                  Đang hiển thị: {filteredStudents.length} sinh viên
                </div>
              </div>
            </div>
          )}

          {/* Bộ lọc tìm kiếm */}
          {!loading && checkPage ? (
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                🔍 Tìm Kiếm Sinh Viên
              </h3>
              <div className="flex flex-col lg:flex-row gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tìm theo
                  </label>
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Tất cả</option>
                    <option value="mssv">Mã số SV</option>
                    <option value="name">Họ tên</option>
                    <option value="email">Email</option>
                    <option value="phone">Số điện thoại</option>
                  </select>
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Từ khóa tìm kiếm
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Nhập từ khóa tìm kiếm..."
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <button
                  onClick={handleResetSearch}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
                >
                  🔄 Reset
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
                <div className="flex-1"></div>
              </div>
              <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn file Excel
                  </label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".xlsx,.xls,.csv"
                    disabled={class_id === null}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {file && (
                    <p className="mt-2 text-sm text-green-600">
                      ✅ Đã chọn: {file.name}
                    </p>
                  )}
                  {class_id === null
                    ? "Lỗi dữ liệu lớp vui lòng quay lại trang trước"
                    : ""}
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
          )}

          {/* Danh sách lỗi import */}
          {studentError?.length > 0 && (
            <div className="mt-8 bg-red-50 border border-red-300 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-red-700 mb-3">
                ⚠️ Danh sách sinh viên bị trùng hoặc lỗi ({studentError.length})
              </h3>
              <button
                className={`p-1 w-[100px] mb-5 rounded-md text-white ${
                  studentError.length > 0
                    ? "bg-red-500 hover:bg-red-600 cursor-pointer"
                    : "bg-gray-500 cursor-not-allowed"
                }`}
                onClick={() => handleDeleteError()}
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
                      Họ tên
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-red-700 uppercase">
                      Email
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-red-700 uppercase">
                      Lý do lỗi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-red-100">
                  {studentError?.map((e, index) => (
                    <tr key={index} className="hover:bg-red-50">
                      <td className="px-4 py-2 text-sm text-gray-800">
                        {e.user_id}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-800">
                        {e.fullname}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-800">
                        {e.email}
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

          {/* Danh sách sinh viên */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">
                📋 Danh Sách Sinh Viên
              </h2>
              {!loading && searchTerm && (
                <span className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  Kết quả tìm kiếm: "{searchTerm}"
                </span>
              )}
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="py-12 text-center">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">
                    Đang tải danh sách sinh viên...
                  </p>
                </div>
              ) : (
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
                        SĐT
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ngày sinh
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStudents?.length > 0 ? (
                      filteredStudents.map((s) => (
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
                          {searchTerm ? (
                            <div>
                              <div className="text-gray-500 text-lg">
                                🔍 Không tìm thấy sinh viên phù hợp
                              </div>
                              <button
                                onClick={handleResetSearch}
                                className="mt-3 text-blue-600 hover:text-blue-800 font-medium"
                              >
                                Xem tất cả sinh viên
                              </button>
                            </div>
                          ) : (
                            <div>
                              <div className="text-gray-500 text-lg">
                                📭 Không có sinh viên nào
                              </div>
                              <p className="text-gray-400 text-sm mt-2">
                                Lớp học chưa có sinh viên
                              </p>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
      <BackToTop />
      <Footer />
    </>
  );
}

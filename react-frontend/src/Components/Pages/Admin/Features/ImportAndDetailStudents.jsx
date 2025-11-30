import { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../../../../config/axios";
import AdminHeader from "../View/AdminHeader";
import Footer from "../../Student/Home/Footer";
import RouterBack from "../../../ReUse/Back/RouterBack";
import { getAuth } from "../../../Constants/INFO_USER";
import useIsLogin from "../../../ReUse/IsLogin/IsLogin";
import {
  getSafeJSON,
  setSafeJSON,
} from "../../../ReUse/LocalStorage/LocalStorageSafeJSON";
import BackToTop from "../../../ReUse/Top/BackToTop";

export default function ImportAndDetailStudents() {
  const { user, token } = getAuth();
  useIsLogin(user, token, "admin");

  const [students, setStudents] = useState([]);
  const [studentError, setStudentErrors] = useState([]);
  const [totalStudent, setTotalStudent] = useState(0);
  const [loading, setLoading] = useState(false);

  // ===== SEARCH giống SubjectPage =====
  const [q, setQ] = useState("");
  const [searchRows, setSearchRows] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const timerRef = useRef(null);

  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const location = useLocation();

  const class_id = location.state?.class_id;
  const major_id = location.state?.major_id;
  const teacher_id = location.state?.teacher_id;
  const subject_id = location.state?.subject_id;
  const academic_year = location.state?.academic_year;
  const semester = location.state?.semester;

  const typeView = location.state?.view;
  const checkPage = typeView === 1;
  const name_class = location.state?.name_class;

  useEffect(() => {
    document.title = checkPage ? "Trang Xem chi tiết" : "Trang Import";
  }, [checkPage]);

  // ====== SEARCH ENGINE (Meilisearch) ======
  const runSearch = async (value) => {
    const keyword = value.trim();
    if (!keyword) {
      setSearchRows([]);
      return;
    }

    setLoadingSearch(true);
    try {
      const res = await axios.get("/tvg/search/student", {
        params: {
          q: keyword,
          class_id,
          major_id,
          teacher_id,
        },
      });

      setSearchRows(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log(err);
      setSearchRows([]);
    } finally {
      setLoadingSearch(false);
    }
  };

  const onChangeSearch = (e) => {
    const v = e.target.value;
    setQ(v);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => runSearch(v), 300);
  };

  const onKeyDownSearch = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      runSearch(q); // Enter => tìm ngay
    } else if (e.key === "Escape") {
      setQ("");
      setSearchRows([]);
    }
  };

  const handleResetSearch = () => {
    setQ("");
    setSearchRows([]);
  };

  // clear debounce khi unmount
  useEffect(() => {
    return () => timerRef.current && clearTimeout(timerRef.current);
  }, []);

  // Khi đổi lớp => clear search
  useEffect(() => {
    setQ("");
    setSearchRows([]);
  }, [class_id]);

  // Dữ liệu hiển thị
  const displayedStudents = useMemo(() => {
    return q.trim() ? searchRows : students;
  }, [q, searchRows, students]);

  // ===== IMPORT =====
  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleImport = async () => {
    if (!file) return alert("Vui lòng chọn file Excel trước!");
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
      const res = await axios.post("/students/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { success, failed, total_student, list_import_error } = res.data;
      if (failed > 0) setStudentErrors(list_import_error || []);

      alert(
        `✅ Import hoàn tất!\nThành công: ${success}\nLỗi: ${failed}\nTổng SV: ${total_student}`
      );

      FetchDataStudentByClass();
      setFile(null);
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi kết nối server!");
    } finally {
      setLoading(false);
    }
  };

  // ===== FETCH DATA =====
  const FetchDataStudentByClass = () => {
    if (!class_id) {
      setStudents([]);
      setStudentErrors([]);
      setTotalStudent(0);
      return;
    }

    const cacheStudents = getSafeJSON(
      `data_students_current_${class_id}_${teacher_id}_${major_id}`
    );
    const cacheTotal = getSafeJSON(
      `total_student_current_${class_id}_${teacher_id}_${major_id}`
    );
    const cacheError = getSafeJSON(
      `student_import_error_${class_id}_${teacher_id}_${major_id}`
    );

    if (Array.isArray(cacheStudents)) setStudents(cacheStudents);
    if (typeof cacheTotal === "number") setTotalStudent(cacheTotal);
    if (Array.isArray(cacheError)) setStudentErrors(cacheError);

    axios
      .get(
        `/classes/${class_id}/teachers/${teacher_id}/major/${major_id}/student-errors`
      )
      .then((res) => {
        const errs = Array.isArray(res.data) ? res.data : [];
        setStudentErrors(errs);

        if (JSON.stringify(errs) !== JSON.stringify(cacheError)) {
          setSafeJSON(
            `student_import_error_${class_id}_${teacher_id}_${major_id}`,
            errs
          );
        }
      })
      .catch(() => setStudentErrors([]));

    axios
      .get(`/classes/${class_id}/teachers/${teacher_id}/students`)
      .then((res) => {
        const list = res.data.list_student || [];
        const total = res.data.total_student || 0;

        setStudents(list);
        setTotalStudent(total);

        if (JSON.stringify(list) !== JSON.stringify(cacheStudents)) {
          setSafeJSON(
            `data_students_current_${class_id}_${teacher_id}_${major_id}`,
            list
          );
        }
        if (JSON.stringify(total) !== JSON.stringify(cacheTotal)) {
          setSafeJSON(
            `total_student_current_${class_id}_${teacher_id}_${major_id}`,
            total
          );
        }
      })
      .catch((e) => console.log(e));
  };

  useEffect(() => {
    FetchDataStudentByClass();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [class_id]);

  const handleDeleteError = async () => {
    if (!window.confirm("Bạn có chắc muốn xóa toàn bộ lỗi của lớp này không?"))
      return;

    try {
      await axios.delete(
        `/student-errors/classes/${class_id}/teacher/${teacher_id}/major/${major_id}`
      );
      alert("✅ Xóa lỗi thành công!");
      FetchDataStudentByClass();
    } catch (error) {
      alert(error.response?.data?.message_error || "❌ Lỗi server!");
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />

        <div className="flex">
          <div className="flex-1 p-6 max-w-[1500px] mx-auto">
            {/* HEADER */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-1">👥 Chi Tiết Lớp Học</h1>
              <p className="text-gray-600">
                Xem thông tin chi tiết danh sách sinh viên trong lớp
              </p>
            </div>

            <div className="text-center mb-4 text-xl font-bold">
              Tên lớp: {name_class || "Không xác định"}
            </div>

            <RouterBack navigate={navigate} />

            {/* STAT BADGE */}
            {!loading && totalStudent > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-5 flex items-center justify-between">
                <span className="text-blue-800 font-semibold">
                  📊 Tổng số sinh viên: {totalStudent}
                </span>
                <span className="text-blue-700">
                  Đang hiển thị: {displayedStudents.length} sinh viên
                </span>
              </div>
            )}

            {/* IMPORT FORM */}
            {!checkPage && (
              <div className="bg-white rounded-xl shadow p-6 mb-6">
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
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                                 file:rounded-full file:border-0 file:text-sm file:font-semibold
                                 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
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
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold
                               py-3 px-8 rounded-lg transition flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Đang import...
                      </>
                    ) : (
                      <>📤 Import</>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ERROR LIST */}
            {studentError?.length > 0 && (
              <div className="mt-2 bg-red-50 border border-red-300 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-red-700 mb-3">
                  ⚠️ Danh sách sinh viên bị trùng hoặc lỗi (
                  {studentError.length})
                </h3>

                <button
                  onClick={handleDeleteError}
                  className="p-2 w-[120px] mb-4 rounded-md bg-red-500 hover:bg-red-600 text-white"
                >
                  🗑️ Xóa lỗi
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
                    {studentError.map((e, index) => (
                      <tr key={index} className="hover:bg-red-50">
                        <td className="px-4 py-2 text-sm">{e.user_id}</td>
                        <td className="px-4 py-2 text-sm">{e.fullname}</td>
                        <td className="px-4 py-2 text-sm">{e.email}</td>
                        <td className="px-4 py-2 text-sm text-red-600">
                          {e.reason}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {/* SEARCH giống SubjectPage */}
            {!loading && checkPage && (
              <>
                <div className="w-full max-w-2xl flex items-center gap-2 mb-2">
                  <input
                    value={q}
                    onChange={onChangeSearch}
                    onKeyDown={onKeyDownSearch}
                    placeholder="Tìm sinh viên (MSSV, họ tên, email, SĐT)…"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2
                               focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {q && (
                    <button
                      onClick={handleResetSearch}
                      className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                      title="Xoá tìm kiếm"
                    >
                      ✖
                    </button>
                  )}
                </div>

                <div className="text-sm text-gray-600 mb-5">
                  {loadingSearch ? (
                    "🔎 Đang tìm…"
                  ) : q.trim() ? (
                    <>
                      Kết quả tìm: <b>{displayedStudents.length}</b> sinh viên
                      (từ khoá: “{q}”)
                    </>
                  ) : (
                    <>
                      Tổng: <b>{students.length}</b> sinh viên
                    </>
                  )}
                </div>
              </>
            )}
            {/* STUDENT TABLE */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {loading ? (
                <div className="py-12 flex justify-center items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">
                    Đang tải danh sách sinh viên...
                  </span>
                </div>
              ) : (
                <div className="w-full overflow-x-auto">
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
                      {/** Nếu đang search thì dùng searchRows, còn không search thì dùng students */}
                      {(q.trim() ? searchRows : students)?.length > 0 ? (
                        (q.trim() ? searchRows : students).map((s) => (
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
                            {q.trim() ? (
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
                </div>
              )}
            </div>
          </div>
        </div>

        <BackToTop />
        <Footer />
      </div>
    </>
  );
}

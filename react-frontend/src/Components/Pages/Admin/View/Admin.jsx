// AdminManagement.jsx
import { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import ModalImport from "../Modal/ModalImport";
import RoleAmin from "../../../ReUse/IsLogin/RoleAdmin";
import { getRole } from "../../../Constants/INFO_USER";
import IsLogin from "../../../ReUse/IsLogin/IsLogin";
import { getAuth } from "../../../Constants/INFO_USER";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import axios from "../../../../config/axios";
import Dashboard from "../Features/Dashboard";
import StudentsTeachersTab from "../Features/StudentsTeachersTab";
import ReportsManagement from "../Features/Reports";
import MajorImportPage from "../Features/MajorImportPage";
import ImportTeacher from "../Features/ImportTeacher"; // 👈 thêm dòng này


export default function AdminManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openImports, setOpenImports] = useState(false);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeMenu, setActiveMenu] = useState("students");
  const [activeTab, setActiveTab] = useState("students");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [reports, setReports] = useState([]);
  const navigate = useNavigate();
  const role = getRole();
  const { user, token } = getAuth();

  IsLogin(user, token);
  RoleAmin(role);

  const handleDelete = async (id, type) => {
    if (
      !window.confirm(
        `Bạn có chắc muốn xóa ${
          type === "student" ? "sinh viên" : "giảng viên"
        } này không?`
      )
    )
      return;

    try {
      const res = await axios.delete(`/nhhh/delete/${id}`);
      setToastMessage(res.data.message || "✅ Xóa thành công!");
      setShowToast(true);

      // 🧹 Cập nhật lại danh sách
      if (type === "student") {
        setStudents((prev) => prev.filter((s) => s.user_id !== id));
      } else if (type === "teacher") {
        // 💡 Sửa lỗi typo "teachers" -> "teacher"
        setTeachers((prev) => prev.filter((t) => t.user_id !== id));
      }

      // Ẩn thông báo sau 3 giây
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error("❌ Lỗi khi xóa:", error);
      setToastMessage("❌ Xóa thất bại, vui lòng thử lại!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  useEffect(() => {
    document.title = "Trang Admin";
  }, []);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get("/nhhh/submissions");
        setReports(res.data);
      } catch (error) {
        console.error("❌ Lỗi tải báo cáo:", error);
      }
    };
    fetchReports();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/nhhh/users");
        const allUsers = res.data || [];
        setStudents(allUsers.filter((u) => u.role === "student"));
        setTeachers(allUsers.filter((u) => u.role === "teacher"));
      } catch (error) {
        console.error("❌ Lỗi khi tải dữ liệu:", error);
      }
    };
    fetchData();
  }, []);


  const handleUpdateUser = async (updatedUser) => {
    const { user_id, ...data } = updatedUser;
    if (data.password === "") delete data.password;

    try {
      const res = await axios.put(`/nhhh/update/${user_id}`, data);
      setToastMessage(res.data.message || "✅ Cập nhật thành công!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);

      if (updatedUser.role === "student") {
        setStudents((prev) =>
          prev.map((s) => (s.user_id === user_id ? { ...s, ...data } : s))
        );
      } else if (updatedUser.role === "teacher") {
        setTeachers((prev) =>
          prev.map((t) => (t.user_id === user_id ? { ...t, ...data } : t))
        );
      }
    } catch (error) {
      console.error("❌ Lỗi khi cập nhật:", error);
      setToastMessage(error.response?.data?.message || "❌ Cập nhật thất bại!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  // ⚡ Khi bấm “Thêm SV/GV” → chuyển sang trang import tương ứng
  const openAddModal = (type) => {
    if (type === "students") navigate("/nckh-admin/import-student");
    else navigate("/nckh-admin/import-teacher");
  };
  

  // tìm kiếm
  const filteredStudents = students.filter(
    (s) =>
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.user_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTeachers = teachers.filter(
    (t) =>
      t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.user_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleButtonClick = (buttonName) => {
    switch (buttonName) {
      case "Trang Chủ":
        navigate("/nckh-admin");
        break;
      case "Sinh Viên":
        navigate("/nckh-admin/students");
        break;
      case "Giảng Viên":
        navigate("/nckh-admin/teachers");
        break;
      case "Báo Cáo":
        navigate("/nckh-admin/reports");
        break;
      case "Ngành":
        navigate("/nckh-admin/majors");
        break;
      case "Import Dữ Liệu":
        setOpenImports(true);
        break;
      default:
        navigate("/nckh-404");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {showToast && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-lg shadow-lg text-white transition-all duration-300 ${
            toastMessage.startsWith("✅")
              ? "bg-green-500 animate-bounce"
              : "bg-red-500 animate-shake",
            toastMessage.startsWith("✅") ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {toastMessage}
        </div>
      )}

      <AdminSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        handleButtonClick={handleButtonClick}
      />

      <main className="flex-1 flex flex-col min-h-screen">
        <AdminHeader setSidebarOpen={setSidebarOpen} />

        <div className="p-6">
          <Routes>
            <Route
              path="/"
              element={
                <Dashboard
                  students={students}
                  teachers={teachers}
                  totalReports={reports.length}
                  errorReports={0}
                />
              }
            />
            <Route
              path="students"
              element={
                <StudentsTeachersTab
                  activeMenu={activeMenu}
                  setActiveMenu={setActiveMenu}
                  activeTab="students"
                  setActiveTab={setActiveTab}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  openModal={() => openAddModal("students")}
                  showToast={showToast}
                  toastMessage={toastMessage}
                  filteredStudents={filteredStudents}
                  filteredTeachers={[]}
                  handleDelete={(id) => handleDelete(id, "student")}
                  handleUpdateUser={handleUpdateUser}
                />
              }
            />
            <Route
              path="teachers"
              element={
                <StudentsTeachersTab
                  activeMenu={activeMenu}
                  setActiveMenu={setActiveMenu}
                  activeTab="teachers"
                  setActiveTab={setActiveTab}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  openModal={() => openAddModal("teachers")}
                  showToast={showToast}
                  toastMessage={toastMessage}
                  filteredStudents={[]}
                  filteredTeachers={filteredTeachers}
                  handleDelete={(id) => handleDelete(id, "teacher")}
                  handleUpdateUser={handleUpdateUser}
                />
              }
            />
            <Route path="reports" element={<ReportsManagement reports={reports} />} />
            <Route path="majors" element={<MajorImportPage />} />
            {/* 👇 Thêm route mới cho import */}
            <Route path="import-teacher" element={<ImportTeacher />} />
          </Routes>
        </div>
      </main>

      <ModalImport stateOpen={openImports} onClose={setOpenImports} />
    </div>
  );
}

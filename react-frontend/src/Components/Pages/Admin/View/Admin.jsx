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

export default function AdminManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openImports, setOpenImports] = useState(false);
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("")
  const [activeMenu, setActiveMenu] = useState("students");
  const [activeTab, setActiveTab] = useState("students");
  const [teachers, setTeachers] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const role = getRole();
  const { user, token } = getAuth();

  IsLogin(user, token);
  RoleAmin(role);

  const handleDelete = async (id, type) => {
    if (!window.confirm(`Bạn có chắc muốn xóa ${type === "student" ? "sinh viên" : "giảng viên"} này không?`)) return;

    try {
      const res = await axios.delete(`/delete/${id}`);
      setToastMessage(res.data.message || "✅ Xóa thành công!");
      setShowToast(true);

      // 🧹 Cập nhật lại danh sách
      if (type === "student") {
        setStudents((prev) => prev.filter((s) => s.user_id !== id));
      } else if (type === "teacher") {
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
        const res = await axios.get("/submissions");
        setReports(res.data);
      } catch (error) {
        console.error("❌ Lỗi tải báo cáo:", error);
      }
    };
    fetchReports();
  }, []);

  // 🧭 Gọi API lấy danh sách user
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/users");
        const allUsers = res.data || [];
        setStudents(allUsers.filter((u) => u.role === "student"));
        setTeachers(allUsers.filter((u) => u.role === "teacher"));
      } catch (error) {
        console.error("❌ Lỗi khi tải dữ liệu:", error);
      }
    };
    fetchData();
  }, []);
  const handleEditUser = async (id, data) => {
    try {
      const res = await axios.put(`/update/${id}`, data);
      alert(res.data.message);
    } catch (error) {
      console.error("❌ Lỗi khi cập nhật:", error);
      alert("❌ Cập nhật thất bại!");
    }
  };

  //tìm kiếm 
  // 🧭 Hàm lọc sinh viên & giảng viên theo searchTerm
  const filteredStudents = students.filter(
    (s) =>
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTeachers = teachers.filter(
    (t) =>
      t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );


  /** Sidebar button click → điều hướng */
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
      {/* Nền mờ khi mở sidebar trên mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      {/* 🔔 Toast thông báo */}
      {showToast && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-lg shadow-lg text-white transition-all duration-300 ${toastMessage.startsWith("✅")
            ? "bg-green-500 animate-bounce"
            : "bg-red-500 animate-shake"
            }`}
        >
          {toastMessage}
        </div>
      )}

      {/* Sidebar trái */}
      <AdminSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        handleButtonClick={handleButtonClick}
      />

      {/* Phần nội dung chính */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* ✅ Gọi lại AdminHeader và truyền đúng props */}
        <AdminHeader setSidebarOpen={setSidebarOpen} />

        <div className="p-6">
          {/* ⚡ Nội dung thay đổi theo route */}
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
                  openModal={handleEditUser}
                  showToast={showToast}
                  toastMessage={toastMessage}
                  filteredStudents={filteredStudents}
                  filteredTeachers={[]}
                  handleDelete={(id) => handleDelete(id, "student")}
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
                  openModal={handleEditUser}
                  showToast={showToast}
                  toastMessage={toastMessage}
                  filteredStudents={[]}
                  filteredTeachers={filteredTeachers}
                  handleDelete={(id) => handleDelete(id, "teachers")}
                />
              }
            />

            {/* 👇 Route cho Báo cáo */}
            <Route path="reports" element={<ReportsManagement reports={reports} />} />

            <Route path="majors" element={<MajorImportPage />} />
          </Routes>
        </div>
      </main>

      {/* Modal Import */}
      <ModalImport stateOpen={openImports} onClose={setOpenImports} />
    </div>
  );
}

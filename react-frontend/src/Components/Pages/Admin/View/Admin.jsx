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


export default function AdminManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openImports, setOpenImports] = useState(false);
  const [students, setStudents] = useState([]);
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

  useEffect(() => {
    document.title = "Trang Admin";
  }, []);

  //Xóa nngười dùng
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Bạn có chắc muốn xóa người dùng này không?")) return;

    try {
      await axios.delete(`/delete/${userId}`);
      // Cập nhật state sau khi xóa
      setStudents(prev => prev.filter(u => u.user_id !== userId));
      setTeachers(prev => prev.filter(u => u.user_id !== userId));
      setToastMessage("Xóa thành công!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error("❌ Lỗi khi xóa:", error);
      setToastMessage("Xóa thất bại!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  // lấy báo cáo đã nộp 
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
        navigate("/nckh-import-major");
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

      {/* Sidebar trái */}
      <AdminSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        handleButtonClick={handleButtonClick}
      />

      {/* Phần nội dung chính */}
      <main className="flex-1 flex flex-col min-h-screen">
        <AdminHeader setSidebarOpen={setSidebarOpen} />

        <div className="p-6">
          {/* ⚡ Nội dung thay đổi theo route */}
          <Routes>
            <Route
              path="/"
              element={<Dashboard students={students} teachers={teachers} totalReports={0} errorReports={0} />}
            />
            <Route
              path="students"
              element={
                <StudentsTeachersTab
                  activeMenu={activeMenu}
                  setActiveMenu={setActiveMenu}
                  activeTab="students"
                  setActiveTab={setActiveTab}
                  filteredStudents={students}
                  filteredTeachers={teachers}
                  openModal={setOpenImports}
                  showToast={showToast}
                  toastMessage={toastMessage}
                  handleDelete={handleDeleteUser}
                />
              }
            />
            <Route
              path="teachers"
              element={
                <StudentsTeachersTab
                  activeMenu="teachers"
                  activeTab="teachers"
                  searchTerm=""
                  setSearchTerm={() => { }}
                  openModal={setOpenImports}
                  showToast={showToast}
                  toastMessage={toastMessage}
                  filteredStudents={students}
                  filteredTeachers={teachers}
                  handleDelete={handleDeleteUser}
                />
              }
            />
            {/* 👇 Route cho Báo cáo */}
            <Route
              path="reports"
              element={<ReportsManagement reports={[]} />}
            />
          </Routes>
        </div>
      </main>

      {/* Modal Import */}
      <ModalImport stateOpen={openImports} onClose={setOpenImports} />
    </div>
  );
}

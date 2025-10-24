import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ModalImport from "../Modal/ModalImport";
import RoleAmin from "../../../ReUse/IsLogin/RoleAdmin";
import { getRole } from "../../../Constants/INFO_USER";
import IsLogin from "../../../ReUse/IsLogin/IsLogin";
import { getAuth } from "../../../Constants/INFO_USER";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
export default function AdminManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openNotification, setOpenNotification] = useState(false);
  const navigate = useNavigate();
  const [openImports, setOpenImports] = useState(false);
  const role = getRole();
  const { user, token } = getAuth();

  IsLogin(user, token);
  RoleAmin(role);

  useEffect(() => {
    document.title = "Trang Admin";
  }, []);

  /** Hàm xử lý trung tâm */
  const handleButtonClick = (buttonName) => {
    switch (buttonName) {
      case "Trang Chủ":
        handleDashboard();
        break;
      case "Sinh Viên":
        handleManageStudents();
        break;
      case "Giảng Viên":
        handleManageTeachers();
        break;
      case "Báo Cáo":
        handleReports();
        break;
      case "Ngành":
        handleMajors();
        break;
      case "Thông Báo":
        handleNotifications();
        break;
      case "Import Dữ Liệu":
        setOpenImports(true);
        break;
      case "Cài Đặt":
        handleSettings();
        break;
      default:
        navigate("/nckh-404");
    }
  };

  /** Các hàm xử lý từng mục */
  const handleDashboard = () => navigate("/admin/dashboard");
  const handleManageStudents = () => navigate("/admin/students");
  const handleManageTeachers = () => navigate("/admin/teachers");
  const handleReports = () => navigate("/admin/reports");
  const handleMajors = () => navigate("/admin/majors");
  const handleNotifications = () => setOpenNotification(true);
  const handleSettings = () => navigate("/admin/settings");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <AdminSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        handleButtonClick={handleButtonClick}
      />

      <main className="flex-1 flex flex-col min-h-screen">
        <AdminHeader setSidebarOpen={setSidebarOpen} />
      </main>

      <ModalImport stateOpen={openImports} onClose={setOpenImports} />
    </div>
  );
}

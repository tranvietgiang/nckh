import React, { useState, useRef, useEffect } from "react";
import {
  Menu,
  Home,
  ArrowLeft,
  ChevronDown,
  LogOut,
  User,
  Users,
  FileText,
  Database,
  Upload,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export default function AdminHeader({ setSidebarOpen, setOpenImports }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(false);
  const dropdownRef = useRef(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Kiểm tra xem có đang ở trang import không
  const isImportPage =
    location.pathname.includes("/nckh-show-classes") ||
    location.pathname.includes("/nckh-subject");

  // Các chức năng từ AdminSidebar
  const handleMenuClick = (buttonName) => {
    setOpenMenu(false);
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
      default:
        navigate("/nckh-404");
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("user_profiles");
    } catch (e) {
      console.warn("Clear storage error:", e);
    }
    navigate("/nckh-login", { replace: true });
  };

  const handleGoBack = () => {
    navigate(-1); // Quay lại trang trước
  };

  const menuItems = [
    { name: "Trang Chủ", icon: Home, path: "/nckh-admin" },
    { name: "Sinh Viên", icon: Users, path: "/nckh-admin/students" },
    { name: "Giảng Viên", icon: Users, path: "/nckh-admin/teachers" },
    { name: "Báo Cáo", icon: FileText, path: "/nckh-admin/reports" },
    { name: "Ngành", icon: Database, path: "/nckh-admin/majors" },
    { name: "Import Dữ Liệu", icon: Upload, path: "#import" },
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-30">
      <div className="px-6 py-4 flex justify-between items-center">
        {/* Bên trái: Menu mobile + Tiêu đề hoặc nút Quay lại */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen?.(true)}
            className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* ✅ Hiển thị nút Quay lại khi ở trang import, ngược lại hiển thị tiêu đề */}
          {isImportPage ? (
            <button
              onClick={handleGoBack}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm text-gray-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </button>
          ) : (
            <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
          )}
        </div>

        {/* Bên phải: Avatar với dropdown menu chứa toàn bộ sidebar */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpenMenu(!openMenu)}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-10 h-10 bg-indigo-600 rounded-full text-white flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <span className="hidden sm:inline text-sm font-medium text-gray-700">
              Admin
            </span>
            <ChevronDown
              className={`w-4 h-4 text-gray-500 transition-transform ${
                openMenu ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown menu - chứa toàn bộ navigation */}
          {openMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl py-2 z-50 max-h-96 overflow-y-auto">
              {/* Header menu */}
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <p className="text-sm font-semibold text-gray-900">
                  Menu Quản Trị
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Quản lý hệ thống NCKH
                </p>
              </div>

              {/* Menu items từ sidebar */}
              <div className="py-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <button
                      key={item.name}
                      onClick={() => handleMenuClick(item.name)}
                      className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-colors ${
                        isActive
                          ? "bg-indigo-50 text-indigo-700 border-r-2 border-indigo-600"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? "text-indigo-600" : "text-gray-400"
                        }`}
                      />
                      <span className="flex-1">{item.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Logout section */}
              <div className="border-t border-gray-100 pt-2">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

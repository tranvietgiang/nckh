import React from "react";
import {
  Home,
  GraduationCap,
  Users,
  FileText,
  BookOpen,
  Bell,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminSidebar({
  sidebarOpen,
  setSidebarOpen,
  handleButtonClick,
}) {
  const navigate = useNavigate();

  const menuItems = [
    { id: "dashboard", label: "Trang Chủ", icon: Home },
    { id: "students", label: "Sinh Viên", icon: GraduationCap },
    { id: "teachers", label: "Giảng Viên", icon: Users },
    { id: "reports", label: "Báo Cáo", icon: FileText },
    { id: "majors", label: "Ngành", icon: BookOpen },
    { id: "import", label: "Import Dữ Liệu", icon: FileText },
    { id: "settings", label: "Cài Đặt", icon: Settings },
  ];

  return (
    <aside
      className={`${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 fixed lg:static w-64 bg-white shadow-xl transition-transform duration-300 h-full z-50 flex flex-col`}
    >
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-indigo-600">
          <BookOpen className="w-5 h-5" /> Admin Panel
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="p-3 flex-1 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleButtonClick(item.label)}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-gray-700 hover:bg-indigo-100 hover:text-indigo-700"
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <button
          onClick={() => navigate("/nckh-login")}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span
            onClick={() => {
              navigate("/nckh-login");
              localStorage.removeItem("user");
              localStorage.removeItem("token");
            }}
          >
            Đăng Xuất
          </span>
        </button>
      </div>
    </aside>
  );
}

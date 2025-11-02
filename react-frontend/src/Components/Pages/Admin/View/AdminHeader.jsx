import React, { useState } from "react";
import { Menu, Home, ArrowLeft, ChevronDown, LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export default function AdminHeader({
  setSidebarOpen,
  homePath = "/nckh-admin",
  showHomeWhenAway = true, // đặt false nếu không muốn hiện nút Home
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const isOnHome = location.pathname === homePath;

  const [openMenu, setOpenMenu] = useState(false);

  const handleGoHome = () => navigate(homePath);
  const handleGoBack = () => navigate(-1);

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

  return (
    <header className="bg-white shadow-md sticky top-0 z-30">
      <div className="px-6 py-4 flex justify-between items-center">
        {/* Nút mở sidebar (mobile) */}
        <button
          onClick={() => setSidebarOpen?.(true)}
          className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Tiêu đề + các nút điều hướng */}
        <div className="flex items-center gap-3">
          {/* Bỏ chữ "Admin Dashboard" khi không ở home */}
          {isOnHome ? (
            <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
          ) : null}

          {/* Khi không ở home: hiện nút Quay lại (và Home nếu muốn) */}
          {!isOnHome && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleGoBack}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm text-gray-700"
                title="Quay lại trang trước"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay lại
              </button>
              {showHomeWhenAway && (
                <button
                  onClick={handleGoHome}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm text-gray-700"
                  title="Về trang Admin Home"
                >
                  <Home className="w-4 h-4" />
                  Home
                </button>
              )}
            </div>
          )}
        </div>

        {/* Khu vực Admin + Dropdown */}
        <div
          className="relative"
          onMouseEnter={() => setOpenMenu(true)}
          onMouseLeave={() => setOpenMenu(false)}
        >
          <button
            type="button"
            className="flex items-center gap-2"
            aria-haspopup="menu"
            aria-expanded={openMenu}
            title="Tài khoản Admin"
          >
            <div className="w-10 h-10 bg-indigo-600 rounded-full text-white flex items-center justify-center font-bold select-none">
              AD
            </div>
            <span className="hidden sm:inline text-sm text-gray-700">
              Admin
            </span>
            <ChevronDown className="w-4 h-4 text-gray-500 hidden sm:inline" />
          </button>

          {/* Dropdown */}
          {openMenu && (
            <div
              className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg py-1"
              role="menu"
            >
              {!isOnHome && (
                <button
                  onClick={handleGoHome}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 inline-flex items-center gap-2"
                  role="menuitem"
                >
                  <Home className="w-4 h-4" />
                  Về trang Admin
                </button>
              )}
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 inline-flex items-center gap-2"
                role="menuitem"
              >
                <LogOut className="w-4 h-4" />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

import React, { useState, useRef } from "react";
import { Menu, Home, ArrowLeft, ChevronDown, LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export default function AdminHeader({
  setSidebarOpen,
  homePath = "/nckh-admin",
  showHomeWhenAway = true,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const isOnHome = location.pathname === homePath;
  const [openMenu, setOpenMenu] = useState(false);
  const timeoutRef = useRef(null);

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

  // 🧠 hover ổn định: có delay khi đóng để tránh mất menu do di chuột nhanh
  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setOpenMenu(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setOpenMenu(false), 150);
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

        {/* Tiêu đề + điều hướng */}
        <div className="flex items-center gap-3">
          {isOnHome ? (
            <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleGoBack}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm text-gray-700"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay lại
              </button>
              {showHomeWhenAway && (
                <button
                  onClick={handleGoHome}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm text-gray-700"
                >
                  <Home className="w-4 h-4" />
                  Home
                </button>
              )}
            </div>
          )}
        </div>

        {/* Avatar + dropdown */}
        <div
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Avatar */}
          <button
            type="button"
            className="flex items-center gap-2 select-none"
            aria-haspopup="menu"
          >
            <div className="w-10 h-10 bg-indigo-600 rounded-full text-white flex items-center justify-center font-bold">
              AD
            </div>
            <span className="hidden sm:inline text-sm text-gray-700">
              Admin
            </span>
            <ChevronDown className="w-4 h-4 text-gray-500 hidden sm:inline" />
          </button>

          {/* Dropdown menu */}
          {openMenu && (
            <div
              className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg py-1 animate-fadeIn z-50"
              role="menu"
            >
              {!isOnHome && (
                <button
                  onClick={handleGoHome}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Về trang Admin
                </button>
              )}
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
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

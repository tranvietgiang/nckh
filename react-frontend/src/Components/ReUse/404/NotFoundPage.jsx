import React from "react";
import { Link } from "react-router-dom";
const user = JSON.parse(localStorage.getItem("user")) ?? null;
const role = user?.role ?? null;
export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* Animated 404 Number */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-900 relative">
            4
            <span className="text-indigo-600 animate-bounce inline-block">
              0
            </span>
            4
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Message */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Trang không tồn tại
          </h2>
          <p className="text-gray-600 text-lg mb-2">
            Rất tiếc, trang bạn đang tìm kiếm không thể tìm thấy.
          </p>
          <p className="text-gray-500">
            Có thể trang đã bị di chuyển hoặc bạn đã nhập sai địa chỉ.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to={`${
              role === "student"
                ? "/nckh-home"
                : role === "teacher"
                ? "/nckh-teacher"
                : role === "admin"
                ? "/nckh-admin"
                : "/notFile"
            }`}
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            ← Quay lại Trang chủ
          </Link>

          <button
            onClick={() => {
              window.location.href = "/nckh-login";
              localStorage.removeItem("user");
              localStorage.removeItem("token");
            }}
            className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:border-indigo-400 hover:text-indigo-600 transition duration-300 font-medium"
          >
            Đăng xuất
          </button>
        </div>

        {/* Additional Help */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-500 mb-4">Bạn cần hỗ trợ?</p>
          <div className="flex justify-center space-x-6">
            <a
              href="/contact"
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Liên hệ hỗ trợ
            </a>
            <a
              href="/help"
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Trung tâm trợ giúp
            </a>
            <a
              href="/sitemap"
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Sơ đồ trang web
            </a>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-10 left-10 w-20 h-20 bg-indigo-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-10 right-10 w-16 h-16 bg-purple-200 rounded-full opacity-30 animate-pulse delay-75"></div>
        <div className="absolute top-1/3 left-1/4 w-12 h-12 bg-blue-200 rounded-full opacity-25 animate-pulse delay-150"></div>
      </div>
    </div>
  );
}

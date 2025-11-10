import React, { useEffect, useState } from "react";
import Navbar from "../../../ReUse/Navbar/Navbar";
import { getUser } from "../../../Constants/INFO_USER";
import axios from "../../../../config/axios";
export default function Header() {
  const user = getUser();
  const [getNamMajor, setNamMajor] = useState();

  useEffect(() => {
    axios.get("/profiles");
  }, []);

  useEffect(() => {
    axios.get(`/tvg/get-nameMajor/${user?.major_id}`).then((res) => {
      setNamMajor(res.data);
    });
  }, []);

  return (
    <header className="bg-gray-50 min-h-screen">
      <Navbar />
      {/* Main Content */}
      <div className="py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header Section */}
          <div className="bg-blue-600 px-6 sm:px-8 py-5">
            <h1 className="text-2xl sm:text-3xl font-bold text-white text-center flex items-center justify-center">
              📊 THỐNG KÊ CÁ NHÂN
            </h1>
          </div>

          {/* Student Info Section */}
          <div className="p-6 sm:p-8 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
              <div className="text-center sm:text-left">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center">
                  👋 Chào {user?.fullname} - {user?.user_id}
                </h2>
                <p className="text-gray-600 mt-1 text-base flex items-center">
                  🎓 {getNamMajor?.major_name ?? ""}
                </p>
              </div>
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium w-full sm:w-auto text-center mt-2 sm:mt-0 flex items-center justify-center">
                ✅ Hoạt động
              </div>
            </div>
          </div>

          {/* Statistics Section - SỐ TO, CHỮ VỪA CÓ ICON */}
          <div className="p-6 sm:p-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Lớp học */}
              <div className="bg-blue-50 p-4 sm:p-5 rounded-lg text-center border border-blue-100 h-28 sm:h-32 flex flex-col justify-center">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-blue-600 mb-1 flex items-center justify-center">
                  🏫 2
                </div>
                <div className="text-sm sm:text-base text-gray-600">
                  Lớp học
                </div>
              </div>

              {/* BC cần nộp */}
              <div className="bg-yellow-50 p-4 sm:p-5 rounded-lg text-center border border-yellow-100 h-28 sm:h-32 flex flex-col justify-center">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-yellow-600 mb-1 flex items-center justify-center">
                  📝 2
                </div>
                <div className="text-sm sm:text-base text-gray-600">
                  BC cần nộp
                </div>
              </div>

              {/* Hoàn thành */}
              <div className="bg-green-50 p-4 sm:p-5 rounded-lg text-center border border-green-100 h-28 sm:h-32 flex flex-col justify-center">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-green-600 mb-1 flex items-center justify-center">
                  ✅ 2
                </div>
                <div className="text-sm sm:text-base text-gray-600">
                  Hoàn thành
                </div>
              </div>

              {/* Tỷ lệ */}
              <div className="bg-purple-50 p-4 sm:p-5 rounded-lg text-center border border-purple-100 h-28 sm:h-32 flex flex-col justify-center">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-purple-600 mb-1 flex items-center justify-center">
                  📈 100%
                </div>
                <div className="text-sm sm:text-base text-gray-600">Tỷ lệ</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6 sm:mt-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 flex items-center">
                  🎯 Tiến độ hoàn thành
                </span>
                <span className="text-sm font-medium text-gray-700">100%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-green-600 h-2.5 rounded-full"
                  style={{ width: "100%" }}
                ></div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <div className="text-center text-xs text-gray-500 flex items-center justify-center">
              🔄 Cập nhật: {new Date().toLocaleDateString("vi-VN")}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-6xl mx-auto">
          <button className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg text-base font-medium transition-colors duration-200 flex items-center justify-center">
            <span className="mr-2">👁️</span>
            Xem chi tiết
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg text-base font-medium transition-colors duration-200 flex items-center justify-center">
            <span className="mr-2">🔄</span>
            Cập nhật
          </button>
        </div>
      </div>
    </header>
  );
}

import React from "react";
import { GraduationCap, Users, FileText, AlertTriangle } from "lucide-react";

const Dashboard = ({ students, teachers, totalReports, errorReports }) => {
  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
        Tổng Quan Hệ Thống
      </h2>

      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs sm:text-sm font-medium">
                Tổng Sinh Viên
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1 sm:mt-2">
                {students.length}
              </p>
            </div>
            <div className="bg-blue-100 p-2 sm:p-3 rounded-full">
              <GraduationCap className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs sm:text-sm font-medium">
                Tổng Giảng Viên
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1 sm:mt-2">
                {teachers.length}
              </p>
            </div>
            <div className="bg-green-100 p-2 sm:p-3 rounded-full">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs sm:text-sm font-medium">
                Tổng Báo Cáo
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1 sm:mt-2">
                {totalReports}
              </p>
            </div>
            <div className="bg-purple-100 p-2 sm:p-3 rounded-full">
              <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border-l-4 border-red-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs sm:text-sm font-medium">
                Báo Cáo Lỗi
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1 sm:mt-2">
                {errorReports}
              </p>
            </div>
            <div className="bg-red-100 p-2 sm:p-3 rounded-full">
              <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Hoạt động & Thống kê */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">
            Hoạt Động Gần Đây
          </h3>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center p-2 sm:p-3 bg-blue-50 rounded-lg">
              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-2 sm:mr-3 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-800 truncate">
                  Sinh viên mới được thêm
                </p>
                <p className="text-xs text-gray-600">5 phút trước</p>
              </div>
            </div>
            <div className="flex items-center p-2 sm:p-3 bg-green-50 rounded-lg">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2 sm:mr-3 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-800 truncate">
                  Báo cáo mới được nộp
                </p>
                <p className="text-xs text-gray-600">15 phút trước</p>
              </div>
            </div>
            <div className="flex items-center p-2 sm:p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mr-2 sm:mr-3 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-800 truncate">
                  Phát hiện báo cáo lỗi
                </p>
                <p className="text-xs text-gray-600">1 giờ trước</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">
            Thống Kê Báo Cáo
          </h3>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-xs sm:text-sm font-medium text-gray-700">
                  Hoàn Thành
                </span>
                <span className="text-xs sm:text-sm font-medium text-green-600">
                  60%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: "60%" }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-xs sm:text-sm font-medium text-gray-700">
                  Đang Chờ
                </span>
                <span className="text-xs sm:text-sm font-medium text-yellow-600">
                  20%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-600 h-2 rounded-full"
                  style={{ width: "20%" }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-xs sm:text-sm font-medium text-gray-700">
                  Lỗi
                </span>
                <span className="text-xs sm:text-sm font-medium text-red-600">
                  20%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-600 h-2 rounded-full"
                  style={{ width: "20%" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

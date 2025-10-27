import React, { useEffect, useState } from "react";
import axios from "../../../../config/axios";
import ModalMajor from "../Modal/ModalAddMajor";

export default function MajorImportPage() {
  const [getMajors, setMajors] = useState([]);
  const [openModalMajor, setOpenModalMajor] = useState(false);
  // const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMajors();
  }, []);

  const fetchMajors = () => {
    setLoading(true);
    axios
      .get("/get-majors")
      .then((res) => {
        setMajors(res.data || []);
      })
      .catch((error) => {
        console.error("Lỗi tải danh sách ngành:", error);
        setMajors([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleEdit = (major) => {
    // Mở modal chỉnh sửa
    console.log("Sửa ngành:", major);
  };

  const handleImport = () => {
    console.log("Import file ngành");
  };

  const handleCloseModal = () => {
    setOpenModalMajor(false);
  };

  const handleMajorSuccess = () => {
    fetchMajors();
  };

  // Định dạng ngày tháng như trong hình (27/10/2025)
  const formatDate = (dateString) => {
    if (!dateString) return "27/10/2025"; // Default date as in image
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  useEffect(() => {
    window.onMajorActionSuccess = handleMajorSuccess;
    return () => {
      delete window.onMajorActionSuccess;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Main Content - Chiếm toàn bộ chiều rộng */}
        <div className="flex-1">
          <div className="p-6">
            {/* Tiêu đề giống hình ảnh */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Quản lý Ngành
              </h1>
              <p className="text-gray-600 mt-1">
                Quản lý danh sách các ngành học trong hệ thống
              </p>
            </div>

            {/* Thống kê và nút bấm - Layout giống hình */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  Tổng {getMajors?.length || 0} ngành
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleImport}
                  className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition duration-200"
                >
                  <span>📁</span>
                  Import Ngành
                </button>

                <button
                  onClick={() => setOpenModalMajor(true)}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200"
                >
                  <span>➕</span>
                  Thêm Ngành
                </button>
              </div>
            </div>

            {/* Table - Giống thiết kế trong hình */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">
                    Đang tải dữ liệu...
                  </span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          TÊN NGÀNH
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          MÃ VIẾT TẮT
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          NGÀY TẠO
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          CẬP NHẬT
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          THAO TÁC
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getMajors?.map((major) => (
                        <tr key={major.major_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                            {major.major_id.toString().padStart(2, "0")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {major.major_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {major.major_abbreviate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(major.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(major.updated_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleEdit(major)}
                              className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600 transition duration-200"
                            >
                              Sửa
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Empty State */}
                  {getMajors?.length === 0 && (
                    <div className="text-center py-12">
                      <svg
                        className="mx-auto h-16 w-16 text-gray-400 mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Không có ngành nào
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Bắt đầu bằng cách import file ngành.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ModalMajor stateOpen={openModalMajor} onClose={handleCloseModal} />
    </div>
  );
}

import React, { useState } from "react";
import {
  GraduationCap,
  Users,
  Search,
  UserPlus,
  Edit2,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "../../../../config/axios";

export default function StudentsTeachersTab({
  activeMenu,
  activeTab,
  setActiveMenu,
  setActiveTab,
  searchTerm,
  setSearchTerm,
  openModal,
  showToast,
  toastMessage,
  filteredStudents,
  filteredTeachers,
  handleDelete,
  handleUpdateUser, // Giả sử hàm này được truyền từ cha để xử lý update
}) {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [q, setQ] = useState("");
  const typingTimer = React.useRef(null);
  const [searchRows, setSearchRows] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);


  // 🧩 Mở modal edit
  const openEditModal = (user) => {
    // Tạo một bản sao của user để chỉnh sửa, bao gồm cả password rỗng
    setSelectedUser({ ...user, password: "" });
    setEditModalOpen(true);
  };

  // 🧩 Đóng modal edit
  const closeEditModal = () => {
    setEditModalOpen(false);
    setSelectedUser(null);
  };

  const navigate = useNavigate();
  if (activeMenu !== "students" && activeMenu !== "teachers") return null;

  // ⚙️ Thêm state phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ⚙️ Xác định dữ liệu và tổng trang
  const data =
    searchRows.length > 0
      ? searchRows
      : activeTab === "students"
        ? filteredStudents
        : filteredTeachers;

  const totalPages = Math.ceil(data.length / itemsPerPage);

  // ⚙️ Cắt dữ liệu theo trang
  const uniqueData = Array.from(new Map(data.map(u => [u.user_id, u])).values());
  const paginatedData = uniqueData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // ⚙️ Xử lý chuyển trang
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  // ⚙️ Reset trang khi đổi tab
  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // 🧩 Xử lý submit form edit
  const handleSubmitEdit = (e) => {
    e.preventDefault();
    // Giả sử handleUpdateUser là hàm từ props
    if (handleUpdateUser) {
      handleUpdateUser(selectedUser);
    }
    closeEditModal();
  };

  //Search engier
  const runSearch = async (keyword) => {
    const query = keyword.trim();
    setCurrentPage(1); // reset pagination

    if (!query) {
      setSearchRows([]);
      return;
    }

    setLoadingSearch(true);
    try {
      const role = activeTab === "students" ? "student" : "teacher";
      const res = await axios.get(`/search/users?q=${encodeURIComponent(query)}&role=${role}`);
      setSearchRows(res.data || []);
    } catch (err) {
      console.error("Lỗi tìm kiếm:", err);
      setSearchRows([]);
    } finally {
      setLoadingSearch(false);
    }
  };




  const handleChange = (e) => {
    const value = e.target.value;
    setQ(value);
    setSearchTerm(value);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => runSearch(value), 500);
  };


  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      runSearch(searchTerm);
    } else if (e.key === "Escape") {
      setSearchTerm("");
      setSearchRows([]);
    }
  };



  return (
    <div>
      <div className="bg-white rounded-lg shadow-md mb-4 sm:mb-6">
        {/* Tabs */}
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="flex -mb-px whitespace-nowrap">
            <button
              onClick={() => {
                setActiveTab("students");
                setActiveMenu("students");
                navigate("/nckh-admin/students");
              }}
              className={`px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium border-b-2 transition-colors ${activeTab === "students"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              <div className="flex items-center space-x-1 sm:space-x-2">
                <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Sinh Viên</span>
              </div>
            </button>

            <button
              onClick={() => {
                setActiveTab("teachers");
                setActiveMenu("teachers");
                navigate("/nckh-admin/teachers");
              }}
              className={`px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium border-b-2 transition-colors ${activeTab === "teachers"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Giảng Viên</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Search + Add Button */}
        <div className="p-3 sm:p-6 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="relative w-full sm:w-64 lg:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={q}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => openModal("add")}
            className="flex items-center justify-center space-x-2 bg-indigo-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-md text-sm"
          >
            <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="whitespace-nowrap">
              Thêm {activeTab === "students" ? "SV" : "GV"}
            </span>
          </button>
        </div>
      </div>

      {/* Toast */}
      {showToast && (
        <div className="fixed top-5 right-5 bg-green-500 text-white px-4 py-2 rounded shadow-lg transition-opacity duration-500 opacity-100 z-50">
          {toastMessage}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {activeTab === "students" ? (
                  <>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mã SV
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Họ Và Tên
                    </th>
                    <th className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Chuyên Ngành
                    </th>
                    <th className="hidden xl:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lớp
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao Tác
                    </th>
                  </>
                ) : (
                  <>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mã GV
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Họ Tên
                    </th>
                    <th className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Khoa
                    </th>
                    <th className="hidden xl:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Chức Vụ
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao Tác
                    </th>
                  </>
                )}
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.map((item) => (
                <tr key={item.user_id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm font-medium text-gray-900">
                    {item.user_id}
                  </td>
                  <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm text-gray-900">
                    {/* Hiển thị Tên thay vì Role cho GV */}
                    {activeTab === "teachers" ? item.fullname : item.fullname}
                  </td>
                  <td className="hidden md:table-cell px-3 sm:px-6 py-3 text-xs sm:text-sm text-gray-600">
                    {item.email}
                  </td>
                  <td className="hidden lg:table-cell px-3 sm:px-6 py-3 text-xs sm:text-sm text-gray-600">
                    {/* Hiển thị Khoa cho GV, Chuyên ngành cho SV */}
                    {item.major_name}
                  </td>
                  <td className="hidden xl:table-cell px-3 sm:px-6 py-3 text-xs sm:text-sm text-gray-600">
                    {/* Hiển thị Chức vụ cho GV, Lớp cho SV */}
                    {activeTab === "teachers" ? item.profile?.position : item.class_student || ""}
                  </td>
                  <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm font-medium">
                    <div className="flex items-center space-x-2 sm:space-x-4">
                      {/* === SỬA LỖI 1 === */}
                      <button
                        onClick={() => openEditModal(item)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.user_id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {/* === LỖI ĐÃ ĐƯỢC DI CHUYỂN RA NGOÀI TBODY === */}
              {/* Modal không còn ở đây nữa */}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center p-3 sm:p-4 border-t bg-gray-50">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
            >
              Trang trước
            </button>
            <span className="text-sm text-gray-700">
              Trang {currentPage}/{totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
            >
              Trang sau
            </button>
          </div>
        )}
      </div>

      {/* === MODAL ĐƯỢC DI CHUYỂN RA ĐÂY === */}
      {/* Nó là một sibling của div 'table' */}
      {editModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Chỉnh sửa người dùng</h2>
            <form onSubmit={handleSubmitEdit}>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={selectedUser.email}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      email: e.target.value,
                    })
                  }
                  className="w-full border p-2 rounded mt-1"
                />
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Họ Tên
                </label>
                <input
                  type="text"
                  value={selectedUser.fullname || ""}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      fullname: e.target.value,
                    })
                  }
                  className="w-full border p-2 rounded mt-1"
                />
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Mật khẩu
                </label>
                <input
                  type="password"
                  placeholder="Nhập để thay đổi, để trống để giữ nguyên"
                  value={selectedUser.password || ""}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      password: e.target.value,
                    })
                  }
                  className="w-full border p-2 rounded mt-1"
                />
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  value={selectedUser.role}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      role: e.target.value,
                    })
                  }
                  className="w-full border p-2 rounded mt-1"
                  disabled // Không cho sửa role
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>
              </div>

              {/* Thêm các trường khác tùy thuộc vào role */}
              {selectedUser.role === 'student' && (
                <>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700">Chuyên ngành</label>
                    <input
                      type="text"
                      value={selectedUser.major_name || ""}
                      onChange={(e) => setSelectedUser({ ...selectedUser, major_id: e.target.value })}
                      className="w-full border p-2 rounded mt-1"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700">Lớp</label>
                    <input
                      type="text"
                      value={selectedUser.class_student || ""}
                      onChange={(e) => setSelectedUser({ ...selectedUser, class_student: e.target.value })}
                      className="w-full border p-2 rounded mt-1"
                    />
                  </div>
                </>
              )}

              {selectedUser.role === 'teacher' && (
                <>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700">Khoa</label>
                    <input
                      type="text"
                      value={selectedUser.department || ""}
                      onChange={(e) => setSelectedUser({ ...selectedUser, department: e.target.value })}
                      className="w-full border p-2 rounded mt-1"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700">Chức vụ</label>
                    <input
                      type="text"
                      value={selectedUser.position || ""}
                      onChange={(e) => setSelectedUser({ ...selectedUser, position: e.target.value })}
                      className="w-full border p-2 rounded mt-1"
                    />
                  </div>
                </>
              )}


              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Hủy
                </button>
                {/* === SỬA LỖI 2 === */}
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

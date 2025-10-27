import React from "react";
import { 
  GraduationCap, 
  Users, 
  Search, 
  UserPlus, 
  Edit2, 
  Trash2 
} from "lucide-react";

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
}) {
  if (activeMenu !== "students" && activeMenu !== "teachers") return null;
  
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
              }}
              className={`px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium border-b-2 transition-colors ${
                activeTab === "students"
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
              }}
              className={`px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium border-b-2 transition-colors ${
                activeTab === "teachers"
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
        <div className="fixed top-5 right-5 bg-green-500 text-white px-4 py-2 rounded shadow-lg transition-opacity duration-500 opacity-100">
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
                      Role
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
              {activeTab === "students"
                ? filteredStudents.map((student) => (
                    <tr key={student.user_id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm font-medium text-gray-900">
                        {student.user_id}
                      </td>
                      <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm text-gray-900">
                        {student.role}
                      </td>
                      <td className="hidden md:table-cell px-3 sm:px-6 py-3 text-xs sm:text-sm text-gray-600">
                        {student.email}
                      </td>
                      <td className="hidden lg:table-cell px-3 sm:px-6 py-3 text-xs sm:text-sm text-gray-600"></td>
                      <td className="hidden xl:table-cell px-3 sm:px-6 py-3 text-xs sm:text-sm text-gray-600"></td>
                      <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm font-medium">
                        <div className="flex items-center space-x-2 sm:space-x-4">
                          <button
                            onClick={() => openModal("edit", student)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(student.user_id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                : filteredTeachers.map((teacher) => (
                    <tr key={teacher.user_id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm font-medium text-gray-900">
                        {teacher.user_id}
                      </td>
                      <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm text-gray-900">
                        {teacher.role}
                      </td>
                      <td className="hidden md:table-cell px-3 sm:px-6 py-3 text-xs sm:text-sm text-gray-600">
                        {teacher.email}
                      </td>
                      <td className="hidden lg:table-cell px-3 sm:px-6 py-3 text-xs sm:text-sm text-gray-600">
                        {teacher.department}
                      </td>
                      <td className="hidden xl:table-cell px-3 sm:px-6 py-3 text-xs sm:text-sm text-gray-600">
                        {teacher.position}
                      </td>
                      <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm font-medium">
                        <div className="flex items-center space-x-2 sm:space-x-4">
                          <button
                            onClick={() => openModal("edit", teacher)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(teacher.user_id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

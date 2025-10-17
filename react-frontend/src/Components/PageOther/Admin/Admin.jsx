import React, { useState, useEffect } from 'react';
import { UserPlus, Edit2, Trash2, Search, Users, GraduationCap, BookOpen, FileText, AlertTriangle, Home, Settings, Bell, LogOut, Menu, X } from 'lucide-react';
import axios from "../../../config/axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export default function AdminManagement() {
  const [activeTab, setActiveTab] = useState('students');
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [editingItem, setEditingItem] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [toastMessage, setToastMessage] = React.useState('');
  const [showToast, setShowToast] = React.useState(false);

  const showSuccessToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000); // 3s tự ẩn
  };



  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`/users`);
        console.log("Dữ liệu user API:", res.data);

        // Phân tách theo user_id và role
        const teachersData = res.data.filter(user => user.user_id.startsWith('gv') || user.role === 'admin');
        const studentsData = res.data.filter(user => !user.user_id.startsWith('gv') && user.role !== 'admin');

        setStudents(studentsData);
        setTeachers(teachersData);

      } catch (err) {
        console.error("Lỗi khi gọi API /users:", err);
      }
    };
    fetchUsers();
  }, []);




  //   const [students, setStudents] = useState([
  //     { id: 1, name: 'Nguyễn Văn A', studentId: 'SV001', email: 'nguyenvana@email.com', major: 'Công nghệ thông tin', class: 'CNTT01' },
  //     { id: 2, name: 'Trần Thị B', studentId: 'SV002', email: 'tranthib@email.com', major: 'Kỹ thuật phần mềm', class: 'KTPM01' },
  //     { id: 3, name: 'Lê Văn C', studentId: 'SV003', email: 'levanc@email.com', major: 'Khoa học máy tính', class: 'KHMT01' },
  //   ]);


  // const [teachers, setTeachers] = useState([
  //   { id: 1, name: 'TS. Phạm Văn D', teacherId: 'GV001', email: 'phamvand@email.com', department: 'Công nghệ thông tin', position: 'Phó Giáo sư' },
  //   { id: 2, name: 'ThS. Hoàng Thị E', teacherId: 'GV002', email: 'hoangthie@email.com', department: 'Kỹ thuật phần mềm', position: 'Giảng viên' },
  //   { id: 3, name: 'PGS.TS. Võ Văn F', teacherId: 'GV003', email: 'vovanf@email.com', department: 'Khoa học máy tính', position: 'Phó Giáo sư' },
  // ]);

  const [reports] = useState([
    { id: 1, title: 'Báo cáo tuần 1', status: 'completed' },
    { id: 2, title: 'Báo cáo tuần 2', status: 'completed' },
    { id: 3, title: 'Báo cáo tuần 3', status: 'pending' },
    { id: 4, title: 'Báo cáo tuần 4', status: 'pending' },
    { id: 5, title: 'Báo cáo cuối kỳ', status: 'error' },
  ]);

  const errorReports = reports.filter(r => r.status === 'error').length;
  const totalReports = reports.length;

  const [formData, setFormData] = useState({
    name: '', studentId: '', teacherId: '', email: '', major: '', class: '', department: '', position: ''
  });

  const menuItems = [
    { id: 'dashboard', label: 'Trang Chủ', icon: Home },
    { id: 'students', label: 'Sinh Viên', icon: GraduationCap },
    { id: 'teachers', label: 'Giảng Viên', icon: Users },
    { id: 'reports', label: 'Báo Cáo', icon: FileText },
    { id: 'notifications', label: 'Thông Báo', icon: Bell },
    { id: 'settings', label: 'Cài Đặt', icon: Settings },
  ];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openModal = (mode, item = null) => {
    setModalMode(mode);
    setEditingItem(item);
    if (mode === 'edit' && item) {
      setFormData(item);
    } else {
      setFormData({ name: '', studentId: '', teacherId: '', email: '', major: '', class: '', department: '', position: '' });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({ name: '', studentId: '', teacherId: '', email: '', major: '', class: '', department: '', position: '' });
  };

  const handleSubmit = () => {
    if (activeTab === 'students') {
      if (modalMode === 'add') {
        const newStudent = { ...formData, id: students.length + 1 };
        setStudents([...students, newStudent]);
      } else {
        setStudents(students.map(s => s.id === editingItem.id ? { ...formData, id: editingItem.id } : s));
      }
    } else {
      if (modalMode === 'add') {
        const newTeacher = { ...formData, id: teachers.length + 1 };
        setTeachers([...teachers, newTeacher]);
      } else {
        setTeachers(teachers.map(t => t.id === editingItem.id ? { ...formData, id: editingItem.id } : t));
      }
    }
    closeModal();
  };

  const handleDelete = async (user_id) => {
    if (window.confirm(`Bạn có chắc muốn xóa ${activeTab === 'students' ? 'sinh viên' : 'giảng viên'} này?`)) {
      try {
        const res = await axios.delete(`/delete/${user_id}`);

        // Cập nhật state
        if (activeTab === 'students') {
          setStudents(students.filter(s => s.user_id !== user_id));
        } else {
          setTeachers(teachers.filter(t => t.user_id !== user_id));
        }

        // Thông báo xóa thành công
         showSuccessToast('Xóa thành công!');
      } catch (err) {
        console.error(err);
         showSuccessToast('Xóa không thành công!');
      }
    }
  };

  const filterData = (data) => {
    return data.filter(item =>
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.user_id?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };



  const filteredStudents = filterData(students);
  const filteredTeachers = filterData(teachers);

  const renderContent = () => {
    if (activeMenu === 'dashboard') {
      return (
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Tổng Quan Hệ Thống</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-xs sm:text-sm font-medium">Tổng Sinh Viên</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1 sm:mt-2">{students.length}</p>
                </div>
                <div className="bg-blue-100 p-2 sm:p-3 rounded-full">
                  <GraduationCap className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-xs sm:text-sm font-medium">Tổng Giảng Viên</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1 sm:mt-2">{teachers.length}</p>
                </div>
                <div className="bg-green-100 p-2 sm:p-3 rounded-full">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-xs sm:text-sm font-medium">Tổng Báo Cáo</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1 sm:mt-2">{totalReports}</p>
                </div>
                <div className="bg-purple-100 p-2 sm:p-3 rounded-full">
                  <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border-l-4 border-red-500 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-xs sm:text-sm font-medium">Báo Cáo Lỗi</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1 sm:mt-2">{errorReports}</p>
                </div>
                <div className="bg-red-100 p-2 sm:p-3 rounded-full">
                  <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">Hoạt Động Gần Đây</h3>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center p-2 sm:p-3 bg-blue-50 rounded-lg">
                  <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-2 sm:mr-3 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-800 truncate">Sinh viên mới được thêm</p>
                    <p className="text-xs text-gray-600">5 phút trước</p>
                  </div>
                </div>
                <div className="flex items-center p-2 sm:p-3 bg-green-50 rounded-lg">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2 sm:mr-3 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-800 truncate">Báo cáo mới được nộp</p>
                    <p className="text-xs text-gray-600">15 phút trước</p>
                  </div>
                </div>
                <div className="flex items-center p-2 sm:p-3 bg-red-50 rounded-lg">
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mr-2 sm:mr-3 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-800 truncate">Phát hiện báo cáo lỗi</p>
                    <p className="text-xs text-gray-600">1 giờ trước</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">Thống Kê Báo Cáo</h3>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs sm:text-sm font-medium text-gray-700">Hoàn Thành</span>
                    <span className="text-xs sm:text-sm font-medium text-green-600">60%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs sm:text-sm font-medium text-gray-700">Đang Chờ</span>
                    <span className="text-xs sm:text-sm font-medium text-yellow-600">20%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '20%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs sm:text-sm font-medium text-gray-700">Lỗi</span>
                    <span className="text-xs sm:text-sm font-medium text-red-600">20%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-red-600 h-2 rounded-full" style={{ width: '20%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeMenu === 'students' || activeMenu === 'teachers') {
      return (
        <div>
          <div className="bg-white rounded-lg shadow-md mb-4 sm:mb-6">
            <div className="border-b border-gray-200 overflow-x-auto">
              <nav className="flex -mb-px whitespace-nowrap">
                <button
                  onClick={() => { setActiveTab('students'); setActiveMenu('students'); }}
                  className={`px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium border-b-2 transition-colors ${activeTab === 'students'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Sinh Viên</span>
                  </div>
                </button>
                <button
                  onClick={() => { setActiveTab('teachers'); setActiveMenu('teachers'); }}
                  className={`px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium border-b-2 transition-colors ${activeTab === 'teachers'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Giảng Viên</span>
                  </div>
                </button>
              </nav>
            </div>

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
                onClick={() => openModal('add')}
                className="flex items-center justify-center space-x-2 bg-indigo-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-md text-sm"
              >
                <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="whitespace-nowrap">Thêm {activeTab === 'students' ? 'SV' : 'GV'}</span>
              </button>
            </div>
          </div>
          {showToast && (
            <div className="{`fixed top-5 right-5 bg-green-500 text-white px-4 py-2 rounded shadow-lg transition-opacity duration-500 ${showToast ? 'opacity-100' : 'opacity-0'}">
              {toastMessage}
            </div>
          )}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">

              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {activeTab === 'students' ? (
                      <>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã SV</th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="hidden md:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="hidden lg:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chuyên Ngành</th>
                        <th className="hidden xl:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lớp</th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao Tác</th>
                      </>
                    ) : (
                      <>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã GV</th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ Tên</th>
                        <th className="hidden md:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="hidden lg:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khoa</th>
                        <th className="hidden xl:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chức Vụ</th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao Tác</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activeTab === 'students' ? (
                    filteredStudents.map((student) => (
                      <tr key={student.id || student.studentId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">{student.user_id}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">{student.role}</td>
                        <td className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600">{student.email}</td>
                        <td className="hidden lg:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600"></td>
                        <td className="hidden xl:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600"></td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                          <div className="flex items-center space-x-2 sm:space-x-4">
                            <button
                              onClick={() => openModal('edit', student)}
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
                  ) : (
                    filteredTeachers.map((teacher) => (
                      <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">{teacher.user_id}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">{teacher.role}</td>
                        <td className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600">{teacher.email}</td>
                        <td className="hidden lg:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600">{teacher.department}</td>
                        <td className="hidden xl:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600">{teacher.position}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                          <div className="flex items-center space-x-2 sm:space-x-4">
                            <button
                              onClick={() => openModal('edit', teacher)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(teacher.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    if (activeMenu === 'reports') {
      return (
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Quản Lý Báo Cáo</h2>
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <p className="text-sm sm:text-base text-gray-600">Chức năng quản lý báo cáo đang được phát triển...</p>
          </div>
        </div>
      );
    }

    if (activeMenu === 'notifications') {
      return (
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Thông Báo</h2>
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <p className="text-sm sm:text-base text-gray-600">Chức năng thông báo đang được phát triển...</p>
          </div>
        </div>
      );
    }

    if (activeMenu === 'settings') {
      return (
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Cài Đặt Hệ Thống</h2>
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <p className="text-sm sm:text-base text-gray-600">Chức năng cài đặt đang được phát triển...</p>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static w-64 bg-white shadow-xl transition-transform duration-300 h-full z-50 flex flex-col`}>
        <div className="p-3 sm:p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
            <span className="font-bold text-sm sm:text-base text-gray-800">Admin Panel</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-3 sm:p-4 space-y-1 sm:space-y-2 flex-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveMenu(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors text-sm sm:text-base ${activeMenu === item.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-3 sm:p-4 border-t border-gray-200">
          <button className="w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors text-sm sm:text-base">
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="font-medium">Đăng Xuất</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen w-full lg:w-auto">
        {/* Header */}
        <div className="bg-white shadow-md sticky top-0 z-30">
          <div className="px-3 sm:px-4 lg:px-8 py-3 sm:py-4 lg:py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
                >
                  <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <h1 className="text-base sm:text-xl lg:text-3xl font-bold text-gray-800 truncate">Hệ Thống Quản Lý</h1>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                  AD
                </div>
                <span className="hidden sm:inline text-xs sm:text-sm text-gray-600">Admin</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-3 sm:p-4 lg:p-8 overflow-y-auto">
          {renderContent()}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
                {modalMode === 'add' ? 'Thêm' : 'Chỉnh Sửa'} {activeTab === 'students' ? 'Sinh Viên' : 'Giảng Viên'}
              </h2>
              <div>
                {activeTab === 'students' ? (
                  <>
                    <div className="mb-3 sm:mb-4">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Mã Sinh Viên</label>
                      <input
                        type="text"
                        name="studentId"
                        value={formData.studentId}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div className="mb-3 sm:mb-4">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Họ và Tên</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div className="mb-3 sm:mb-4">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div className="mb-3 sm:mb-4">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Chuyên Ngành</label>
                      <input
                        type="text"
                        name="major"
                        value={formData.major}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div className="mb-4 sm:mb-6">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Lớp</label>
                      <input
                        type="text"
                        name="class"
                        value={formData.class}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-3 sm:mb-4">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Mã Giảng Viên</label>
                      <input
                        type="text"
                        name="teacherId"
                        value={formData.teacherId}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div className="mb-3 sm:mb-4">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Họ và Tên</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div className="mb-3 sm:mb-4">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div className="mb-3 sm:mb-4">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Khoa</label>
                      <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div className="mb-4 sm:mb-6">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Chức Vụ</label>
                      <input
                        type="text"
                        name="position"
                        value={formData.position}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </>
                )}
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={handleSubmit}
                    className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
                  >
                    {modalMode === 'add' ? 'Thêm' : 'Cập Nhật'}
                  </button>
                  <button
                    onClick={closeModal}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium text-sm"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


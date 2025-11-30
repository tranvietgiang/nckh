import { useState, useEffect, useRef } from "react";
import {
  FaUpload,
  FaPlus,
  FaBook,
  FaCalendarAlt,
  FaClock,
  FaGraduationCap,
  FaUniversity,
  FaFileImport,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import ModalCreateClass from "../Modal/ModalCreateClass";
import axios from "../../../../config/axios";
import Navbar from "../../../ReUse/Navbar/Navbar";
import Footer from "../../Student/Home/Footer";
import {
  setSafeJSON,
  // getSafeJSON,
} from "../../../ReUse/LocalStorage/LocalStorageSafeJSON";
import AdminHeader from "../View/AdminHeader";
import useIsLogin from "../../../ReUse/IsLogin/IsLogin";
import { getAuth } from "../../../Constants/INFO_USER";
export default function ClassShowManager() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Xem lớp học";
  }, []);

  const { user, token } = getAuth();

  useIsLogin(user, token, "admin");

  const [isCreateClassOpen, setIsCreateClassOpen] = useState(false);
  const [getClasses, setClasses] = useState([]);
  const [getMajors, setMajors] = useState([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [selectedMajor, setSelectedMajor] = useState("all");

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImportSubmit = async () => {
    if (!selectedFile) {
      alert("Vui lòng chọn file Excel trước khi import!");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    setImportLoading(true);
    try {
      const res = await axios.post("/classes/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // DÙ import có lỗi 1 vài dòng vẫn coi là success request
      alert(res.data.message || "Import lớp học hoàn tất!");

      setShowImportModal(false);
      setSelectedFile(null);

      // Cập nhật lại danh sách lớp sau khi import
      const newList = await axios.get("/classes");
      if (Array.isArray(newList.data)) {
        setClasses(newList.data);
        setSafeJSON("data_classes", newList.data);
      }
    } catch (err) {
      console.error("Lỗi khi import:", err);
      // Chỉ báo lỗi hệ thống
      alert(err.response?.data?.message || "❌ Cần Resert lại trang !!");
    } finally {
      setImportLoading(false);
    }
  };

  useEffect(() => {
    axios
      .get("/tvg/get-majors")
      .then((res) => {
        if (Array.isArray(res.data)) {
          setMajors(res.data);
          console.log(res.data);
        }
      })
      .catch((error) => {
        console.log(error);
        setMajors([]);
      });
  }, []);

  // Lấy danh sách classes
  useEffect(() => {
    // const data_class = getSafeJSON("data_classes");
    // if (data_class) {
    //   setClasses(data_class);
    // }

    axios
      .get("/tvg/get-classes")
      .then((res) => {
        if (Array.isArray(res.data)) {
          setClasses(res.data);
          console.log(res.data);
          setSafeJSON("data_classes", res.data);
        }
      })
      .catch((error) => {
        console.log("Error fetching classes:", error);
        setClasses([]);
      });
  }, []);

  // Xử lý xóa lớp
  const handleDeleteClass = (classId, teacher_id) => {
    if (window.confirm("Bạn có chắc muốn xóa lớp học này?")) {
      axios
        .delete(`/tvg/classes/${classId}/teacher/${teacher_id}`)
        .then((res) => {
          console.log(res.data);
          setClasses(
            getClasses.filter((classItem) => classItem.class_id !== classId)
          );
          alert("Xóa lớp học thành công!");
        })
        .catch((error) => {
          if (error.response) {
            alert(error.response.data.message_error);
            console.log("Error deleting class:", error);
          } else {
            alert("Lỗi server!");
          }
        });
    }
  };

  // Lọc classes theo major_id
  const getClassesByMajor = (majorId) => {
    return getClasses.filter(
      (classItem) => Number(classItem.major_id) === Number(majorId)
    );
  };

  // localStorage.clear();
  return (
    <>
      <AdminHeader />
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Quản Lý Lớp Học
              </h1>
              <p className="text-gray-600 mt-1">
                Danh sách các lớp học đang giảng dạy
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowImportModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center space-x-2"
              >
                <FaUpload className="w-5 h-5" />
                <span>Import Lớp Học</span>
              </button>
              <button
                onClick={() => setIsCreateClassOpen(true)}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-200 flex items-center space-x-2"
              >
                <FaPlus className="w-5 h-5" />
                <span>Tạo Lớp Học Mới</span>
              </button>
              <ModalCreateClass
                stateOpen={isCreateClassOpen}
                onClose={() => setIsCreateClassOpen(false)}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Bộ lọc ngành */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-900">
              Lọc theo ngành
            </h3>
            <select
              value={selectedMajor}
              onChange={(e) => setSelectedMajor(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            >
              <option value="all">Tất cả ngành</option>
              {getMajors.map((m) => (
                <option key={m.major_id} value={m.major_id}>
                  {m.major_name}
                </option>
              ))}
            </select>
          </div>
          {Array.isArray(getMajors) && getMajors.length > 0 ? (
            getMajors
              .filter((major) =>
                selectedMajor === "all"
                  ? true
                  : Number(major.major_id) === Number(selectedMajor)
              )
              .map((major) => {
                const majorClasses = getClassesByMajor(major.major_id);
                return (
                  <div
                    key={major.major_id}
                    className="bg-white rounded-lg shadow-sm"
                  >
                    <div className="border-b border-gray-200 p-6">
                      <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                        <FaUniversity className="w-6 h-6 text-blue-600 mr-3" />
                        Ngành: {major.major_name}
                      </h2>
                    </div>

                    {/* Classes List */}
                    <div className="p-6">
                      {majorClasses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {majorClasses.map((classItem) => (
                            <div
                              key={classItem?.class_id}
                              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition duration-200"
                            >
                              <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {classItem?.class_name}
                                </h3>
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Mã lớp: {classItem?.class_code}
                                </span>
                              </div>

                              <div className="space-y-3">
                                <div className="flex items-center text-gray-600">
                                  <FaClock className="w-4 h-4 mr-2" />
                                  <span>
                                    Môn học: {classItem?.subject_name ?? ""}
                                  </span>
                                </div>

                                <div className="flex items-center text-gray-600">
                                  <FaClock className="w-4 h-4 mr-2" />
                                  <span>
                                    Giáo viên: {classItem?.fullname ?? ""}
                                  </span>
                                </div>

                                <div className="flex items-center text-gray-600">
                                  <FaClock className="w-4 h-4 mr-2" />
                                  <span>Học kỳ: {classItem?.semester}</span>
                                </div>

                                <div className="flex items-center text-gray-600">
                                  <FaCalendarAlt className="w-4 h-4 mr-2" />
                                  <span>
                                    Năm học: {classItem?.academic_year}
                                  </span>
                                </div>
                              </div>

                              {/* THÊM BUTTON IMPORT VÀO ĐÂY */}
                              <div className="flex justify-end space-x-3 mt-6">
                                <button
                                  onClick={() =>
                                    navigate("/nckh-classes", {
                                      state: {
                                        class_id: classItem?.class_id,
                                        teacher_id: classItem?.teacher_id,
                                        major_id: major?.major_id,
                                        view: 1,
                                        name_class: classItem?.class_name,
                                      },
                                    })
                                  }
                                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                  Xem chi tiết
                                </button>
                                <button
                                  onClick={() =>
                                    navigate("/nckh-classes", {
                                      state: {
                                        class_id: classItem?.class_id,
                                        major_id: major?.major_id,
                                        teacher_id: classItem?.teacher_id,
                                        name_class: classItem?.class_name,
                                        subject_id: classItem?.subject_id,
                                        academic_year: classItem?.academic_year,
                                        semester: classItem?.semester,
                                        view: 2,
                                      },
                                    })
                                  }
                                  className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center space-x-1"
                                >
                                  <FaFileImport className="w-4 h-4" />
                                  <span>Import</span>
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteClass(
                                      classItem?.class_id,
                                      classItem?.teacher_id
                                    )
                                  }
                                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                                >
                                  Xóa
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <FaBook className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                          <p>Chưa có lớp học nào cho ngành này</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <FaGraduationCap className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Không có ngành học nào
              </h3>
              <p className="text-gray-500">
                Vui lòng thêm ngành học trước khi tạo lớp.
              </p>
            </div>
          )}
        </div>

        {/* Import Modal */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Import Lớp Học
                </h3>
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setSelectedFile(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaPlus className="w-6 h-6 transform rotate-45" />
                </button>
              </div>

              <div className="p-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <FaUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    Kéo thả file Excel vào đây hoặc
                  </p>

                  <button
                    onClick={handleButtonClick}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                  >
                    Chọn file từ máy tính
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {/* ✅ Hiển thị tên file đã chọn */}
                  {selectedFile && (
                    <p className="mt-4 text-sm text-gray-800 font-medium">
                      📂 Đã chọn:{" "}
                      <span className="text-blue-600">{selectedFile.name}</span>
                    </p>
                  )}

                  <p className="text-sm text-gray-500 mt-4">
                    Định dạng hỗ trợ: .xlsx, .csv
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setSelectedFile(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Hủy
                </button>

                <button
                  onClick={handleImportSubmit}
                  disabled={importLoading}
                  className={`bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200 ${
                    importLoading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {importLoading ? "Đang import..." : "Import"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

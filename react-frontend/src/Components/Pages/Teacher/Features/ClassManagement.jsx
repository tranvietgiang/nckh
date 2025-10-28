import React, { useState, useEffect } from "react";
import axios from "../../../../config/axios";
import Navbar from "../../../ReUse/Navbar/Navbar";
import Footer from "../../Student/Home/Footer";
import RouterBack from "../../../ReUse/Back/RouterBack";
import { useNavigate } from "react-router-dom";
import { getAuth } from "../../../Constants/INFO_USER";
import IsLogin from "../../../ReUse/IsLogin/IsLogin";
export default function ClassManagement() {
  const [selectedClass, setSelectedClass] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Tất cả");
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentLoading, setStudentLoading] = useState(false);
  const navigate = useNavigate();
  const { user, token } = getAuth();
  // const teacherId = user?.user_id ?? null;

  IsLogin(user, token);

  // 🧠 Lấy danh sách lớp mà giảng viên phụ trách
  useEffect(() => {
    axios
      .get(`/classes`)
      .then((res) => {
        setClasses(res.data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Lỗi khi tải danh sách lớp:", err);
        setLoading(false);
      });
  }, []);

  // 👩‍🎓 Lấy danh sách sinh viên khi chọn lớp
  useEffect(() => {
    if (selectedClass) {
      setStudentLoading(true);
      axios
        .get(`/classes/students/${selectedClass}`)
        .then((res) => {
          setStudents(res.data);
          setStudentLoading(false);
        })
        .catch((err) => {
          console.error("❌ Lỗi khi tải danh sách sinh viên:", err);
          setStudentLoading(false);
        });
    }
  }, [selectedClass]);

  // 🎯 Lọc sinh viên
  const filteredStudents = students.filter((st) => {
    const matchNameOrCode =
      st.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      st.user_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus =
      filterStatus === "Tất cả" ? true : st.status === filterStatus;
    return matchNameOrCode && matchStatus;
  });

  // 📩 Gửi nhắc nhở
  const sendReminder = () => {
    const unsubmitted = students.filter((st) => st.status === "Chưa nộp");
    if (unsubmitted.length === 0) {
      alert("✅ Tất cả sinh viên đã nộp, không cần nhắc nhở!");
    } else {
      const names = unsubmitted.map((s) => s.fullname).join(", ");
      alert(`📩 Đã gửi nhắc nhở cho: ${names}`);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 p-8">
        {/* Header */}
        <div className="bg-blue-600 text-white p-5 rounded-t-2xl shadow">
          <h1 className="text-3xl font-bold text-center">🏫 QUẢN LÝ LỚP HỌC</h1>
        </div>

        <RouterBack navigate={navigate} />
        {/* Container chính */}
        <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-b-2xl p-6">
          {/* Chọn lớp */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3 text-gray-700">
              Chọn lớp học:
            </h2>

            {loading ? (
              <p className="text-gray-500">⏳ Đang tải danh sách lớp...</p>
            ) : (
              <select
                className="border border-gray-300 rounded-lg px-4 py-2 w-full md:w-1/2 focus:ring focus:ring-blue-300"
                onChange={(e) => setSelectedClass(e.target.value)}
                value={selectedClass}
              >
                <option value="">-- Chọn lớp --</option>
                {classes.length > 0 ? (
                  classes.map((cls) => (
                    <option key={cls.class_id} value={cls.class_id}>
                      {cls.class_name} ({cls.semester}/{cls.academic_year})
                    </option>
                  ))
                ) : (
                  <option disabled>Không có lớp nào</option>
                )}
              </select>
            )}
          </div>

          {/* Hiển thị sinh viên */}
          {selectedClass ? (
            studentLoading ? (
              <p className="text-gray-500 text-center mt-6">
                ⏳ Đang tải danh sách sinh viên...
              </p>
            ) : (
              <>
                {/* Thanh tìm kiếm và bộ lọc */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                  <input
                    type="text"
                    placeholder="🔍 Tìm theo tên hoặc MSSV..."
                    className="border border-gray-300 rounded-lg px-4 py-2 w-full md:w-1/3 focus:ring focus:ring-blue-300"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />

                  <div className="flex flex-wrap gap-3 items-center">
                    <select
                      className="border border-gray-300 rounded-lg px-4 py-2 focus:ring focus:ring-blue-300"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="Tất cả">Tất cả</option>
                      <option value="Đã nộp">Đã nộp</option>
                      <option value="Chưa nộp">Chưa nộp</option>
                    </select>

                    <button
                      onClick={sendReminder}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg shadow font-semibold transition-transform hover:scale-105"
                    >
                      📩 Gửi nhắc nhở
                    </button>
                  </div>
                </div>

                {/* Bảng sinh viên */}
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200 rounded-lg">
                    <thead className="bg-blue-100">
                      <tr>
                        <th className="px-4 py-2 border">MSSV</th>
                        <th className="px-4 py-2 border">Họ và Tên</th>
                        <th className="px-4 py-2 border">Email</th>
                        <th className="px-4 py-2 border">Lớp</th>
                        <th className="px-4 py-2 border">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.length > 0 ? (
                        filteredStudents.map((st) => (
                          <tr key={st.user_id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 border text-center">
                              {st.user_id}
                            </td>
                            <td className="px-4 py-2 border">{st.fullname}</td>
                            <td className="px-4 py-2 border text-gray-600">
                              {st.email}
                            </td>
                            <td className="px-4 py-2 border text-center">
                              {st.class_name}
                            </td>
                            <td className="px-4 py-2 border text-center">
                              {st.status === "Đã nộp" && (
                                <span className="text-blue-600 font-semibold">
                                  Đã nộp
                                </span>
                              )}
                              {st.status === "Đã chấm" && (
                                <span className="text-green-600 font-semibold">
                                  Đã chấm
                                </span>
                              )}
                              {st.status === "Bị từ chối" && (
                                <span className="text-red-600 font-semibold">
                                  Bị từ chối
                                </span>
                              )}
                              {st.status === "Chưa nộp" && (
                                <span className="text-gray-500 font-semibold">
                                  Chưa nộp
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="4"
                            className="text-center py-4 text-gray-500"
                          >
                            Không có sinh viên nào trong lớp này.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )
          ) : (
            <div className="text-center text-gray-500 mt-10">
              <p>👆 Hãy chọn lớp học để xem danh sách sinh viên.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

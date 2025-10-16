import React, { useState, useEffect } from "react";
import axios from "axios";


export default function ClassManagement() {
  const [selectedClass, setSelectedClass] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Tất cả");
  const [classes, setClasses] = useState([]); // ⬅ dữ liệu thật từ Laravel
  const [loading, setLoading] = useState(true);


  const teacherId = "23211TT1404";

 
  useEffect(() => {
    axios
      .get(`http://192.168.33.11:8000/api/classes/teacher/${teacherId}`)
      .then((res) => {
        setClasses(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Lỗi khi tải danh sách lớp:", err);
        setLoading(false);
      });
  }, []);

  //  Dữ liệu mẫu sinh viên (tạm thời)
  const students = [
    { id: 1, code: "23211TT001", name: "Phạm Cả", email: "ca@tdc.edu.vn", status: "Đã nộp" },
    { id: 2, code: "23211TT002", name: "Nguyễn Văn B", email: "b@example.com", status: "Chưa nộp" },
    { id: 3, code: "23211TT003", name: "Trần Thị C", email: "c@example.com", status: "Đã nộp" },
    { id: 4, code: "23211TT004", name: "Nguyễn Văn D", email: "d@example.com", status: "Chưa nộp" },
  ];

  // 🎯 Lọc sinh viên
  const filteredStudents = students.filter((st) => {
    const matchNameOrCode =
      st.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      st.code.toLowerCase().includes(searchTerm.toLowerCase());
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
      const names = unsubmitted.map((s) => s.name).join(", ");
      alert(`📩 Đã gửi nhắc nhở cho: ${names}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Header */}
      <div className="bg-blue-600 text-white p-5 rounded-t-2xl shadow">
        <h1 className="text-3xl font-bold text-center">🏫 QUẢN LÝ LỚP HỌC</h1>
      </div>

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
              defaultValue=""
            >
              <option value="" disabled>
                -- Chọn lớp --
              </option>
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

        {/* Hiển thị sinh viên khi đã chọn lớp */}
        {selectedClass ? (
          <>
            {/* Thanh tìm kiếm và nút hành động */}
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

            {/* Bảng danh sách sinh viên */}
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg">
                <thead className="bg-blue-100">
                  <tr>
                    <th className="px-4 py-2 border">MSSV</th>
                    <th className="px-4 py-2 border">Họ và Tên</th>
                    <th className="px-4 py-2 border">Email</th>
                    <th className="px-4 py-2 border">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((st) => (
                    <tr key={st.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border text-center">{st.code}</td>
                      <td className="px-4 py-2 border">{st.name}</td>
                      <td className="px-4 py-2 border text-gray-600">{st.email}</td>
                      <td className="px-4 py-2 border text-center">
                        {st.status === "Đã nộp" ? (
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                            ✅ {st.status}
                          </span>
                        ) : (
                          <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
                            🕒 {st.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="text-center text-gray-500 mt-10">
            <p>👆 Hãy chọn lớp học để xem danh sách sinh viên.</p>
          </div>
        )}
      </div>
    </div>
  );
}

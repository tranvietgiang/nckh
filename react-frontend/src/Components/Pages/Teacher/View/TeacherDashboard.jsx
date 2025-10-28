import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateNotification from "../Features/CreateNotification";
import RouterHome from "../../../ReUse/Router/RouterHome";
import { getAuth } from "../../../Constants/INFO_USER";
import Navbar from "../../../ReUse/Navbar/Navbar";
import Footer from "../../Student/Home/Footer";
import axios from "../../../../config/axios";

export default function TeacherDashboard() {
  const [openNotification, setOpenNotification] = useState(false);
  const [classes, setClasses] = useState([]); // ✅ thêm state lớp học
  const { user, token } = getAuth();
  const navigate = useNavigate();

  RouterHome(user, token);

  useEffect(() => {
    document.title = "Trang teacher";

    // ✅ Lấy danh sách lớp mà giảng viên đang dạy
    axios
      .get("/classes", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (Array.isArray(res.data.data)) setClasses(res.data.data);
      })
      .catch((err) => {
        console.error("❌ Lỗi khi tải danh sách lớp:", err);
      });
  }, [token]);

  const handleButtonClick = (buttonName) => {
    switch (buttonName) {
      case "Quản Lý Lớp":
        navigate("/nckh-class-manager");
        break;
      case "Tạo Báo Cáo":
        navigate("/nckh-create-report");
        break;
      case "Chấm Điểm":
        navigate("/nckh-teacher-scoringfeedback");
        break;
      case "Tạo Thông Báo":
        setOpenNotification(true);
        break;
      default:
        console.log("Chức năng khác");
    }
  };

  const handleViewStats = (classId) => {
    navigate(`/nckh-class-stats/${classId}`); // ✅ điều hướng sang trang thống kê sinh viên
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Navbar />

      {/* Header */}
      <div className="max-w-5xl mx-auto m-[10px] bg-blue-600 text-white p-6 shadow-md rounded-b-2xl">
        <h1 className="text-3xl font-bold text-center">📊 THỐNG KÊ CÁ NHÂN</h1>
      </div>

      {/* Thông tin GV */}
      <div className="max-w-5xl mx-auto bg-white shadow-md rounded-2xl mt-6 p-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">
              👋 Chào Thầy {user?.full_name || "Nguyễn Văn A"}
            </h2>
            <p className="text-gray-600">Mã GV: {user?.user_id}</p>
            <p className="text-gray-600">Khoa: CNTT</p>
          </div>
          <span className="bg-green-100 text-green-600 px-4 py-2 rounded-full text-sm mt-4 md:mt-0">
            ✔ Hoạt động
          </span>
        </div>

        {/* Tổng quan */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-100 p-4 rounded-xl text-center shadow-sm">
            <p className="text-5xl font-bold text-blue-700">
              {classes.length}
            </p>
            <p className="mt-2 font-medium">Lớp học</p>
          </div>
          <div className="bg-yellow-100 p-4 rounded-xl text-center shadow-sm">
            <p className="text-5xl font-bold text-yellow-600">12</p>
            <p className="mt-2 font-medium">Báo cáo chờ chấm</p>
          </div>
          <div className="bg-green-100 p-4 rounded-xl text-center shadow-sm">
            <p className="text-5xl font-bold text-green-600">8</p>
            <p className="mt-2 font-medium">Hoàn thành</p>
          </div>
          <div className="bg-purple-100 p-4 rounded-xl text-center shadow-sm">
            <p className="text-5xl font-bold text-purple-600">67%</p>
            <p className="mt-2 font-medium">Tỷ lệ hoàn thành</p>
          </div>
        </div>

        {/* Thao tác nhanh */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            ⚡ THAO TÁC NHANH
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {["Quản Lý Lớp", "Tạo Báo Cáo", "Chấm Điểm", "Tạo Thông Báo"].map(
              (item, i) => (
                <button
                  key={i}
                  onClick={() => handleButtonClick(item)}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-3 rounded-lg shadow-md transition"
                >
                  {item}
                </button>
              )
            )}
          </div>
        </div>

        {/* 📚 Danh sách lớp */}
        <div className="mt-10">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            📚 DANH SÁCH LỚP GIẢNG DẠY
          </h3>

          {classes.length === 0 ? (
            <p className="text-gray-500 italic">Chưa có lớp nào được phân công.</p>
          ) : (
            <div className="space-y-4">
              {classes.map((cls) => (
                <div
                  key={cls.class_id}
                  className="border rounded-xl p-4 shadow-sm bg-gray-50 flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold text-blue-700">
                      {cls.class_name} ({cls.class_code})
                    </p>
                    <p className="text-gray-600 text-sm">
                      Ngành: {cls.major_name || "Chưa có"} • Học kỳ:{" "}
                      {cls.semester} • Niên khóa: {cls.academic_year}
                    </p>
                  </div>

                  <button
                    onClick={() => handleViewStats(cls.class_id)}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    📊 Xem thống kê sinh viên
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Update Section */}
        <div className="flex justify-between items-center mt-8 border-t pt-4 text-sm text-gray-500">
          <p>🕓 Cập nhật: {new Date().toLocaleDateString("vi-VN")}</p>
          <div className="flex gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow">
              👁️ Xem chi tiết
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg shadow"
            >
              🔄 Cập nhật
            </button>
          </div>
        </div>
      </div>

      <CreateNotification
        stateOpen={openNotification}
        onClose={setOpenNotification}
      />

      <Footer />
    </div>
  );
}

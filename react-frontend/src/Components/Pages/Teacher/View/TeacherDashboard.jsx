import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateNotification from "../Features/CreateNotification";
import RouterHome from "../../../ReUse/Router/RouterHome";
import { getAuth } from "../../../Constants/INFO_USER";
import Navbar from "../../../ReUse/Navbar/Navbar";
import Footer from "../../Student/Home/Footer";
export default function TeacherDashboard() {
  const [openNotification, setOpenNotification] = useState(false);
  const { user, token } = getAuth();
  RouterHome(user, token);

  useEffect(() => {
    document.title = "Trang teacher";
  }, []);

  // Hàm xử lý click button đơn giản
  const handleButtonClick = (buttonName) => {
    console.log("Button clicked:", buttonName);

    // Xử lý theo từng button
    switch (buttonName) {
      case "Import Lớp":
        handleImportClass();
        break;
      case "Quản Lý Lớp":
        handleManageClass();
        break;
      case "Tạo Báo Cáo":
        handleCreateReport();
        break;
      case "Chấm Điểm":
        handleGrading();
        break;
      case "Tạo Thông Báo":
        handleCreateNotification();
        break;
      default:
        console.log("Chức năng khác");
    }
  };

  const navigate = useNavigate();
  // Các hàm xử lý đơn giản
  const handleImportClass = () => {
    console.log("Xử lý Import Lớp...");
    navigate("/nckh-teacher-import");
  };

  const handleManageClass = () => {
    navigate("/nckh-class-manager");
  };

  const handleCreateReport = () => {
    console.log("Xử lý Tạo Báo Cáo...");
  };

  const handleGrading = () => {
    console.log("Xử lý Chấm Điểm...");
  };

  const handleCreateNotification = () => {
    console.log("Xử lý Tạo Thông Báo...");
    setOpenNotification(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Navbar />
      {/* Header */}
      <div className="max-w-5xl mx-auto m-[10px] bg-blue-600 text-white p-6 shadow-md rounded-b-2xl">
        <h1 className="text-3xl font-bold text-center">📊 THỐNG KÊ CÁ NHÂN</h1>
      </div>

      {/* Teacher Info */}
      <div className="max-w-5xl mx-auto bg-white shadow-md rounded-2xl mt-6 p-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">👋 Chào Thầy Nguyễn Văn A</h2>
            <p className="text-gray-600">Mã GV: 23211TT2984</p>
            <p className="text-gray-600">Khoa: CNTT</p>
          </div>
          <span className="bg-green-100 text-green-600 px-4 py-2 rounded-full text-sm mt-4 md:mt-0">
            ✔ Hoạt động
          </span>
        </div>

        {/* Overview Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-100 p-4 rounded-xl text-center shadow-sm">
            <p className="text-5xl font-bold text-blue-700">5</p>
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

        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            ⚡ THAO TÁC NHANH
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              "Import Lớp",
              "Quản Lý Lớp",
              "Tạo Báo Cáo",
              "Chấm Điểm",
              "Tạo Thông Báo",
            ].map((item, i) => (
              <button
                key={i}
                onClick={() => handleButtonClick(item)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-3 rounded-lg shadow-md transition"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Class Reports */}
        <div className="mt-10">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            📚 DANH SÁCH LỚP
          </h3>
          <div className="space-y-4">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="border rounded-xl p-4 shadow-sm bg-gray-50"
              >
                <p className="font-semibold">
                  Báo cáo Cuối kỳ - Chuyên đề {item}
                </p>
                <p className="text-gray-600 text-sm">
                  3 ngày nữa | {12 + item}/45 đã nộp
                </p>
                <button className="mt-2 text-blue-600 font-medium hover:underline">
                  👁️ Xem bài nộp
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Update Section */}
        <div className="flex justify-between items-center mt-8 border-t pt-4 text-sm text-gray-500">
          <p>🕓 Cập nhật: 15/10/2025</p>
          <div className="flex gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow">
              👁️ Xem chi tiết
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg shadow">
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

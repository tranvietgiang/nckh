import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateNotification from "../Features/CreateNotification";
import RouterHome from "../../../ReUse/Router/RouterHome";
import { getAuth } from "../../../Constants/INFO_USER";
import Navbar from "../../../ReUse/Navbar/Navbar";
import Footer from "../../Student/Home/Footer";
import axios from "../../../../config/axios";
import IsLogin from "../../../ReUse/IsLogin/IsLogin";
import RoleTeacher from "../../../ReUse/IsLogin/RoleTeacher";

export default function TeacherDashboard() {
  const [openNotification, setOpenNotification] = useState(false);
  const [classes, setClasses] = useState([]);
  const [majorInfo, setMajorInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, token } = getAuth();
  const [gettStatisticsClasses, setStatisticsClasses] = useState(null);
  const navigate = useNavigate();

  // Kiểm tra đăng nhập + quyền
  IsLogin(user, token);
  RoleTeacher(user?.role);

  console.log(user);
  useEffect(() => {
    axios
      .get("/tvg/get-count-classes-teaching-by-teacher")
      .then((res) => {
        setStatisticsClasses(res.data);
      })
      .catch((err) => console.log(err));
  }, []);
  // Lấy danh sách lớp của giảng viên
  useEffect(() => {
    document.title = "Trang giảng viên";
    axios.get("/profiles");

    if (!token || !user?.major_id) return;

    setLoading(true);

    axios
      .get(`/get-class-by-major/${user.major_id}`)
      .then((res) => {
        if (Array.isArray(res.data)) setClasses(res.data);
        else setClasses([]);
      })
      .catch((err) => {
        console.error("❌ Lỗi khi tải danh sách lớp:", err);
        setClasses([]);
      })
      .finally(() => setLoading(false));
  }, [token, user?.major_id]);

  // 🧩 Lấy tên ngành của giảng viên
  useEffect(() => {
    if (!user?.major_id) return;

    axios
      .get(`/tvg/get-nameMajor/${user.major_id}`)
      .then((res) => setMajorInfo(res.data))
      .catch((err) => console.error("❌ Lỗi khi tải ngành:", err));
  }, [user?.major_id]);

  // ⚡ Thao tác nhanh
  const handleButtonClick = (name) => {
    const routes = {
      "Quản Lý Lớp": "/nckh-class-manager",
      "Quản Lý Báo Cáo": "/nckh-report-manager",
      "Tạo Báo Cáo": "/nckh-create-report",
      "Chấm Báo cáo": "/nckh-teacher-scoringfeedback",
      "Tạo Thông Báo": null, // sẽ bật modal
      "Quản lý nhóm": "/nckh-teacher-groups",
    };

    if (name === "Tạo Thông Báo") setOpenNotification(true);
    else if (routes[name]) navigate(routes[name]);
    else console.warn("⚠️ Chức năng chưa được định nghĩa:", name);
  };

  const handleViewStats = (classId) => {
    navigate(`/nckh-class-stats/${classId}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Navbar />

      {/* HEADER */}
      <div className="max-w-5xl mx-auto mt-3 bg-blue-600 text-white p-6 shadow-md rounded-b-2xl">
        <h1 className="text-3xl font-bold text-center">
          BẢNG TỔNG QUAN GIẢNG VIÊN
        </h1>
      </div>

      {/* THÔNG TIN GIẢNG VIÊN */}
      <div className="max-w-5xl mx-auto bg-white shadow-md rounded-2xl mt-6 p-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">
              Chào Thầy {user?.fullname || "chưa có thông tin"}
            </h2>
            <p className="text-gray-600">
              Mã GV: {user?.user_id || "chưa có thông tin"}
            </p>
            <p className="text-gray-600">
              Ngành: {majorInfo?.major_name || "Chưa có thông tin"}
            </p>
          </div>

          <span className="bg-green-100 text-green-600 px-4 py-2 rounded-full text-sm mt-4 md:mt-0">
            Đang hoạt động
          </span>
        </div>

        {/* THỐNG KÊ */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <StatCard
            color="blue"
            value={gettStatisticsClasses}
            label="Lớp học"
          />
          <StatCard color="yellow" value="x" label="Báo cáo chờ chấm" />
          <StatCard color="green" value="x" label="Hoàn thành" />
          <StatCard color="purple" value="x" label="Tỷ lệ hoàn thành" />
        </div>

        {/* THAO TÁC NHANH */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            THAO TÁC NHANH
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              "Quản Lý Lớp",
              "Quản Lý Báo Cáo",
              "Chấm Báo cáo",
              "Tạo Thông Báo",
              "Quản lý nhóm",
            ].map((item) => (
              <button
                key={item}
                onClick={() => handleButtonClick(item)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-3 rounded-lg shadow-md transition"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* DANH SÁCH LỚP */}
        <div className="mt-10">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            DANH SÁCH LỚP GIẢNG DẠY
          </h3>

          {loading ? (
            <div className="text-center text-gray-500 py-6">
              ⏳ Đang tải dữ liệu...
            </div>
          ) : classes.length === 0 ? (
            <p className="text-gray-500 italic">
              Chưa có lớp nào được phân công.
            </p>
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
                    Xem thống kê
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FOOTER NHỎ */}
        <div className="flex justify-between items-center mt-8 border-t pt-4 text-sm text-gray-500">
          <p>Cập nhật: {new Date().toLocaleDateString("vi-VN")}</p>
          <div className="flex gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow">
              Xem chi tiết
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg shadow"
            >
              Làm mới
            </button>
          </div>
        </div>
      </div>

      {/* Modal Thông Báo */}
      <CreateNotification
        stateOpen={openNotification}
        onClose={setOpenNotification}
      />

      <Footer />
    </div>
  );
}

// Component thống kê
function StatCard({ color, value, label }) {
  const colorMap = {
    blue: "bg-blue-100 text-blue-700",
    yellow: "bg-yellow-100 text-yellow-700",
    green: "bg-green-100 text-green-700",
    purple: "bg-purple-100 text-purple-700",
  };

  return (
    <div className={`${colorMap[color]} p-4 rounded-xl text-center shadow-sm`}>
      <p className="text-5xl font-bold">{value}</p>
      <p className="mt-2 font-medium">{label}</p>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateNotification from "../Features/CreateNotification";
import { getAuth } from "../../../Constants/INFO_USER";
import Navbar from "../../../ReUse/Navbar/Navbar";
import Footer from "../../Student/Home/Footer";
import axios from "../../../../config/axios";
import useIsLogin from "../../../ReUse/IsLogin/IsLogin";
import {
  getSafeJSON,
  setSafeJSON,
} from "../../../ReUse/LocalStorage/LocalStorageSafeJSON";
import BackToTop from "../../../ReUse/Top/BackToTop";

export default function TeacherDashboard() {
  const { user, token } = getAuth();

  useIsLogin(user, token, "teacher");

  const [openNotification, setOpenNotification] = useState(false);
  const [classes, setClasses] = useState([]);
  const [majorInfo, setMajorInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const [getStatisticsClasses, setStatisticsClasses] = useState(null);
  const [getStatisticsReport, setStatisticsReport] = useState(null);
  const navigate = useNavigate();

  const fetchStatisticsClasses = async () => {
    const count_classes_teaching = getSafeJSON("count_classes_teaching");
    if (count_classes_teaching !== null) {
      setStatisticsClasses(count_classes_teaching);
    }

    try {
      const res = await axios.get("/tvg/get-count-classes-teaching-by-teacher");
      if (JSON.stringify(res.data) !== JSON.stringify(count_classes_teaching)) {
        setSafeJSON("count_classes_teaching", res.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const fetchStatisticsReport = async () => {
    const count_report_await_teaching = getSafeJSON(
      "count_report_await_teaching"
    );
    if (count_report_await_teaching !== null) {
      setStatisticsReport(count_report_await_teaching);
    }

    try {
      const res = await axios.get("/tvg/get-count-report-teaching-by-teacher");
      console.log(res.data);
      if (
        JSON.stringify(res.data) !== JSON.stringify(count_report_await_teaching)
      ) {
        setSafeJSON("count_report_await_teaching", res.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const fetchNameMajor = async () => {
    try {
      const res = await axios.get(`/tvg/get-nameMajor/${user?.major_id}`);
      setMajorInfo(res.data);
    } catch (err) {
      setMajorInfo(null);
      console.log(err);
    }
  };

  useEffect(() => {
    fetchNameMajor();
    fetchStatisticsClasses();
    fetchStatisticsReport();
  }, []);

  // Lấy danh sách lớp của giảng viên
  useEffect(() => {
    document.title = "Trang giảng viên";
    axios.get("/profiles");

    if (!token || !user?.user_id) return;

    setLoading(true);

    axios
      .get(`pc/get-class-by-teaching-teacher`)
      .then((res) => {
        if (Array.isArray(res.data)) setClasses(res.data);
        else setClasses([]);
      })
      .catch((err) => {
        console.error("❌ Lỗi khi tải danh sách lớp:", err);
        setClasses([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // ⚡ Thao tác nhanh
  const handleButtonClick = (name) => {
    const routes = {
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
    <div className="min-h-screen bg-gray-100 font-sans ">
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
        </div>

        {/* THỐNG KÊ */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <StatCard
            color="blue"
            value={getStatisticsClasses || "chưa có thông tin"}
            label="Lớp học"
          />
          <StatCard
            color="yellow"
            value={getStatisticsReport}
            label="Báo cáo chờ chấm"
          />
          <StatCard color="green" value="x" label="Hoàn thành" />
          <StatCard color="purple" value="x" label="Tỷ lệ hoàn thành" />
        </div>

        {/* THAO TÁC NHANH */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            THAO TÁC NHANH
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
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

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-1 gap-4 max-w-6xl mx-auto">
          <button
            onClick={() => window.location.reload()}
            className="bg-green-600 hover:bg-green-700 text-white py-3 px-5 rounded-lg text-base font-medium transition-colors duration-200 flex items-center justify-center"
          >
            Cập nhật - {new Date().toLocaleDateString("vi-VN")}
          </button>
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
              {classes.map((cls, index) => (
                <div
                  key={index}
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
        <p className="mt-[50px]"></p>
      </div>

      {/* Modal Thông Báo */}
      <CreateNotification
        stateOpen={openNotification}
        onClose={setOpenNotification}
      />

      <BackToTop />
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

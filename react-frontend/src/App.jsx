import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

import Login from "./Components/Auth/Login";
import TeacherDashboard from "./Components/Pages/Teacher/View/TeacherDashboard";
import Admin from "./Components/Pages/Admin/View/Admin";

/**page Feature */
import ImportAndDetailStudents from "./Components/Pages/Admin/Features/ImportAndDetailStudents";
import ProfilePage from "./Components/Pages/Student/Features/ProfilePage";
import ClassManager from "./Components/Pages/Teacher/Features/ClassManagement";
import NotFoundPage from "./Components/ReUse/404/NotFoundPage";
import StudentDashboard from "./Components/Pages/Student/View/StudentDashboard";
import ScoringFeedback from "./Components/Pages/Teacher/Features/ScoringFeedback";
import StudentsTeachersTab from "./Components/Pages/Admin/Features/StudentsTeachersTab";
import Reports from "./Components/Pages/Admin/Features/Reports";
import Dashboard from "./Components/Pages/Admin/Features/Dashboard";

import ImportGroups from "./Components/Pages/Teacher/Features/ImportGroups";
import ClassShowManager from "./Components/Pages/Admin/Features/ClassShowManager";
import MajorImportPage from "./Components/Pages/Admin/Features/MajorImportPage";
import CreateReports from "./Components/Pages/Teacher/Features/CreateReports";
import ClassStatistics from "./Components/Pages/Teacher/Features/ClassStatistics";
// import MajorImportPage from "./Components/Pages/Admin/Features/MajorImportPage";

function App() {
  return (
    <>
      <Router>
        <div className="bg-gray-50">
          <Routes>
            /*===============================================BEGIN==========================================
            */
            {/* Trang chủ sinh viên */}
            <Route path="/nckh-home" element={<StudentDashboard />} />
            {/* Trang import danh sách sinh viên */}
            <Route path="/nckh-classes" element={<ImportAndDetailStudents />} />
            {/* Trang đăng nhập */}
            <Route path="/nckh-login" element={<Login />} />
            {/* Trang profile */}
            <Route path="/nckh-profile" element={<ProfilePage />} />
            {/* Trang admin */}
            <Route path="/nckh-admin/*" element={<Admin />} />
            {/* Trang quản lý lớp học */}
            <Route path="/nckh-class-manager" element={<ClassManager />} />
            {/* Trang giảng viên */}
            <Route path="/nckh-teacher" element={<TeacherDashboard />} />
            {/**Trang chấm điểm GV */}
            <Route
              path="/nckh-teacher-scoringfeedback"
              element={<ScoringFeedback />}
            />
            {/**Trang quản lý sinh viên và giảng viên trong admin*/}
            {/* <Route path="/nckh-admin-students" element={<StudentsTeachersTab />} /> */}
            {/**Trang quản lý báo cáo của sinh viên */}
            {/* <Route path="/nckh-admin-reports" element={<Reports />} /> */}
            {/**Trang quản lý thống kê */}
            {/* <Route path="/nckh-admin-dashboard" element={<Dashboard />} /> */}
            {/* Trang không tồn tại */}
            <Route path="/nckh-404" element={<NotFoundPage />} />
            {/* Trang import ds nhóm */}
            <Route path="/nckh-import-group" element={<ImportGroups />} />
            {/* Trang import ds nhóm */}
            <Route path="/nckh-import-major" element={<MajorImportPage />} />
            {/* Trang xem các lớp đang dạy */}
            <Route path="/nckh-show-classes" element={<ClassShowManager />} />
            {/* Tạo báo cáo */}
            <Route path="/nckh-create-report" element={<CreateReports />} />
            {/* Tạo báo cáo */}
            <Route path="/nckh-class-stats/:classId" element={<ClassStatistics />} />
            /*===============================================END============================================
            */
          </Routes>
        </div>
      </Router>
    </>
  );
}

export default App;

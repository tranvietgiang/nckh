import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

import Login from "./Components/Auth/Login";
import TeacherDashboard from "./Components/Pages/Teacher/View/TeacherDashboard";
import Admin from "./Components/Pages/Admin/View/Admin";

/**page Feature */
import ImportStudents from "./Components/Pages/Teacher/Features/ImportStudents";
import ProfilePage from "./Components/Pages/Student/Features/ProfilePage";
import ClassManager from "./Components/Pages/Teacher/Features/ClassManagement";
import NotFoundPage from "./Components/ReUse/404/NotFoundPage";
import StudentDashboard from "./Components/Pages/Student/View/StudentDashboard";
import ScoringFeedback from "./Components/Pages/Teacher/Features/ScoringFeedback"

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
            <Route path="/nckh-teacher-import" element={<ImportStudents />} />
            {/* Trang đăng nhập */}
            <Route path="/nckh-login" element={<Login />} />
            {/* Trang profile */}
            <Route path="/nckh-profile" element={<ProfilePage />} />
            {/* Trang admin */}
            <Route path="/nckh-admin" element={<Admin />} />
            {/* Trang quản lý lớp học */}
            <Route path="/nckh-class-manager" element={<ClassManager />} />
            {/* Trang giảng viên */}
            <Route path="/nckh-teacher" element={<TeacherDashboard />} />
            {/**Trang chấm điểm GV */}
            <Route path="/nckh-teacher-scoringfeedback" element={<ScoringFeedback />} />
            {/* Trang không tồn tại */}
            <Route path="/nckh-404" element={<NotFoundPage />} />
            /*===============================================END============================================
            */
          </Routes>
        </div>
      </Router>
    </>
  );
}

export default App;

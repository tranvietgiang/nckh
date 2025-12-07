import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

import Login from "./Components/Auth/Login";
import TeacherDashboard from "./Components/Pages/Teacher/View/TeacherDashboard";
import Admin from "./Components/Pages/Admin/View/Admin";

/**page Feature */
import ImportAndDetailStudents from "./Components/Pages/Admin/Features/ImportAndDetailStudents";
import ProfilePage from "./Components/Pages/Student/Features/ProfilePage";
// import ClassManager from "./Components/Pages/Teacher/Features/ClassManagement";
import NotFoundPage from "./Components/ReUse/404/NotFoundPage";
import StudentDashboard from "./Components/Pages/Student/View/StudentDashboard";
import ScoringFeedback from "./Components/Pages/Teacher/Features/ScoringFeedback";
import StudentsTeachersTab from "./Components/Pages/Admin/Features/StudentsTeachersTab";
import Reports from "./Components/Pages/Admin/Features/Reports";
import Dashboard from "./Components/Pages/Admin/Features/Dashboard";
import ImportTeacher from "./Components/Pages/Admin/Features/ImportTeacher";

import ClassShowManager from "./Components/Pages/Admin/Features/ClassShowManager";
import MajorImportPage from "./Components/Pages/Admin/Features/MajorImportPage";
import CreateReports from "./Components/Pages/Teacher/Modal/ModalCreateReports";
import ClassStatistics from "./Components/Pages/Teacher/Features/ClassStatistics";
import ManagerGroups from "./Components/Pages/Teacher/Features/ManagerGroups";
import SubjectCrud from "./Components/Pages/Admin/Features/SubjectCRUD";
import ReportManager from "./Components/Pages/Teacher/Features/ReportManager";
import ShowMemberGroup from "./Components/Pages/Teacher/Features/ShowMemberGroup";

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
            {/* Trang giảng viên */}
            <Route path="/nckh-teacher" element={<TeacherDashboard />} />
            {/* Trang giảng viên */}
            <Route
              path="/nckh-admin/import-teacher"
              element={<ImportTeacher />}
            />
            {/**Trang chấm điểm GV */}
            <Route
              path="/nckh-teacher-scoringfeedback"
              element={<ScoringFeedback />}
            />
            {/* Trang không tồn tại */}
            <Route path="/nckh-404" element={<NotFoundPage />} />
            {/* Trang import ds nhóm */}
            <Route path="/nckh-import-major" element={<MajorImportPage />} />
            {/* Trang xem các lớp đang dạy */}
            <Route path="/nckh-show-classes" element={<ClassShowManager />} />
            {/* Tạo môn học */}
            <Route path="/nckh-subject" element={<SubjectCrud />} />
            <Route path="/nckh-create-report" element={<CreateReports />} />
            <Route
              path="/nckh-class-stats/:classId"
              element={<ClassStatistics />}
            />
            {/* Quản lý nhóm */}
            <Route path="/nckh-teacher-groups" element={<ManagerGroups />} />
            {/* Quản lý nhóm */}
            <Route path="/nckh-report-manager" element={<ReportManager />} />
            {/* Xem nhóm lớp */}
            <Route
              path="/nckh-show-group-teacher"
              element={<ShowMemberGroup />}
            />
            /*===============================================END============================================
            */
          </Routes>
        </div>
      </Router>
    </>
  );
}

export default App;

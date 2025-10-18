import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

import Header from "./Components/View/Header/Header";
import Content from "./Components/View/Content/Content";
import Footer from "./Components/View/Footer/Footer";
import Admin from "./Components/PageOther/Admin/Admin";

import ImportStudents from "./Components/Features/ImportListStudents/ImportStudents";
import Login from "./Components/PageOther/Auth/Login";

import ProfilePage from "./Components/PageOther/Student/ProfilePage";
import TeacherDashboard from "./Components/PageOther/Teacher/TeacherDashboard";
import Navbar from "./Components/View/Header/Navbar";
function App() {
  return (
    <>
      <Router>
        <div className="bg-gray-50">
          <Routes>
            {/* Trang chủ */}
            <Route
              path="/nckh-home"
              element={
                <>
                  <Header />
                  <Content />
                  <Footer />
                </>
              }
            />

            {/* Trang import danh sách sinh viên */}
            <Route
              path="/nckh-teacher-import"
              element={
                <>
                  <Navbar />
                  <ImportStudents />
                  <Footer />
                </>
              }
            />

            {/* Trang đăng nhập */}
            <Route path="/nckh-login" element={<Login />} />

            {/* Trang đăng profile */}
            <Route path="/nckh-profile" element={<ProfilePage />} />

            {/* Trang đăng profile */}
            <Route path="/nckh-admin" element={<Admin />} />
            

            {/* Trang giảng viên */}
            <Route
              path="/nckh-teacher"
              element={
                <>
                  <Navbar />
                  <TeacherDashboard />
                  <Footer />
                </>
              }
            />
          </Routes>
        </div>
      </Router>
    </>
  );
}

export default App;

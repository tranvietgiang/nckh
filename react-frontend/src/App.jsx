import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

import Header from "./Components/View/Header/Header";
import Content from "./Components/View/Content/Content";
import Footer from "./Components/View/Footer/Footer";
import Admin from "./Components/PageOther/Admin/Admin"

import ImportStudents from "./Components/Features/ImportListStudents/ImportStudents";
import Login from "./Components/PageOther/Auth/Login";

import ProfilePage from "./Components/PageOther/Student/ProfilePage";
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
            <Route path="/nckh-ng" element={<ImportStudents />} />

            {/* Trang đăng nhập */}
            <Route path="/nckh-login" element={<Login />} />

            {/* Trang đăng profile */}
            <Route path="/nckh-profile" element={<ProfilePage />} />
          </Routes>
           <Routes>
            <Route path="/nckh-admin" element={<Admin />} />
          </Routes>
        </div>
      </Router>
    </>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

import Header from "./Components/View/Header/Header";
import Content from "./Components/View/Content/Content";
import Footer from "./Components/View/Footer/Footer";

import ImportStudents from "./Components/Features/ImportListStudents/ImportStudents";
import Login from "./Components/PageOther/Auth/Login";

import NavBar from "./Components/View/Header/Navbar";
function App() {
  return (
    <>
      <Router>
        <div>
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
          </Routes>
        </div>
      </Router>
    </>
  );
}

export default App;

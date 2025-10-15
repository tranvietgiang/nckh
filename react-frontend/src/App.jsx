import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./Components/PageOther/Auth/Login";
import Header from "./Components/View/Header/Header";
import Content from "./Components/View/Content/Content";
import Footer from "./Components/View/Footer/Footer";
import Admin from "./Components/PageOther/Admin/Admin"

function App() {
  return (
    <>
      <Router>
        <div>
          <Routes>
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
          </Routes>
          <Routes>
            <Route path="/nckh-login" element={<Login />} />
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

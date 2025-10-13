import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import GetUser from "./Components/PageOther/GetUser";
import ImportStudents from "./Components/Features/ImportListStudents/ImportStudents";
import Login from "./Components/Auth/Login";

function App() {
  return (
    <>
      <Router>
        <div>
          <Routes>
            <Route path="/nckh-ng" element={<ImportStudents />} />
          </Routes>

          <Routes>
            <Route path="/nckh-login" element={<Login />} />
          </Routes>
        </div>
      </Router>
    </>
  );
}

export default App;

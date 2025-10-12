import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import GetUser from "./Components/PageOther/GetUser";

function App() {
  return (
    <>
      <Router>
        <div>
          <Routes>
            <Route path="/nckh_ng" element={<GetUser />} />
          </Routes>
        </div>
      </Router>
    </>
  );
}

export default App;

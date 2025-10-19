import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function LoginPage(user, token) {
  const navigate = useNavigate();

  useEffect(() => {
    if (user && token) {
      if (user?.role === "student") {
        navigate("/nckh-home");
      } else if (user?.role === "teacher") {
        navigate("/nckh-teacher");
      } else if (user?.role === "admin") {
        navigate("/nckh-admin");
      }
    } else {
      navigate("/nckh-login");
    }
  }, []);
}

export default LoginPage;

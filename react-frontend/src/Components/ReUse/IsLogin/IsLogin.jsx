import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
function IsLogin(user, token) {
  const navigate = useNavigate();
  useEffect(() => {
    if (!user || !token) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      navigate("/nckh-login");
    }
  }, [user, token, navigate]);
  return null;
}
export default IsLogin;

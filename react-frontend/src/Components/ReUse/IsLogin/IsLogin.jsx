import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
function IsLogin(user, token) {
  const navigate = useNavigate();
  useEffect(() => {
    if (!user || !token) {
      alert("Bạn chưa đăng nhập!");
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      navigate("/nckh-login");
    }
  }, []);
  return null;
}
export default IsLogin;

import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function useIsLogin(user, token, allowRole = null) {
  const navigate = useNavigate();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (hasRedirected.current) return;

    //  Chưa đăng nhập
    if (!user || !token) {
      hasRedirected.current = true;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      alert("Bạn chưa đăng nhập!");
      navigate("/nckh-login");
      return;
    }

    // Kiểm tra role nếu có yêu cầu
    if (allowRole && user.role !== allowRole) {
      hasRedirected.current = true;
      alert("Bạn không có quyền truy cập!");
      navigate("/nckh-404");
      return;
    }
  }, [user, token, allowRole, navigate]);
}

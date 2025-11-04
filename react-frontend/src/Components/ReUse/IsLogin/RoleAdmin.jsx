import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
export default function RoleAdmin(role) {
  const navigate = useNavigate();

  useEffect(() => {
    if (role !== "admin") {
      navigate("/nckh-404");
      return;
    }
  }, []);
}

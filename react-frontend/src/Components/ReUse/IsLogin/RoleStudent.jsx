import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
export default function RoleStudent(role) {
  const navigate = useNavigate();

  useEffect(() => {
    if (role !== "student") {
      navigate("/nckh-404");
      return;
    }
  }, []);
}

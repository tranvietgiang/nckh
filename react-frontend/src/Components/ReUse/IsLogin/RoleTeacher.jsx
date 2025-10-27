import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
export default function RoleTeacher(role) {
  const navigate = useNavigate();

  useEffect(() => {
    if (role != "teacher") {
      navigate("/nckh-404");
      return;
    }
  }, []);
}

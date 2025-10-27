import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
export default function RoleTeacher(user) {
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role != "teacher") {
      navigate("/nckh-404");
      return;
    }
  }, []);
}

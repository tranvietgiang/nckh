// ✅ file: src/ReUse/IsLogin/useRoleTeacher.js
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function useRoleTeacher(role) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!role) return;
    if (role !== "teacher") {
      navigate("/nckh-404");
    }
  }, [role, navigate]);
}

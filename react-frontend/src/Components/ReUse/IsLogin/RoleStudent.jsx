import { useNavigate } from "react-router-dom";
export default function RoleStudent(role) {
  const navigate = useNavigate();

  if (role !== "student") {
    alert("Bạn không có quyền truy cập (chỉ dành cho sinh viên)!");
    navigate("/nckh-404");
    return false;
  }

  return true;
}

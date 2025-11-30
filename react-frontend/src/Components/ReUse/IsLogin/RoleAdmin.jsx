import { useNavigate } from "react-router-dom";
export default function RoleAdmin(role) {
  const navigate = useNavigate();

  if (role !== "admin") {
    alert("Bạn không có quyền truy cập (chỉ dành cho admin tdc)!");
    navigate("/nckh-404");
    return false;
  }

  return true;
}

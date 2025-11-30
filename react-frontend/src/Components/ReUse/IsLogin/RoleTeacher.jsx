import { useNavigate } from "react-router-dom";

export default function RoleTeacher(role) {
  const navigate = useNavigate();

  if (role !== "teacher") {
    alert("Bạn không có quyền truy cập (chỉ dành cho giảng viên tdc)!");
    navigate("/nckh-404");
    return false;
  }

  return true;
}

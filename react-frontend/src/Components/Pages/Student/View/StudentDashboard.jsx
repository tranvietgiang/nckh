import Header from "../Home/Header";
import Content from "../Home/Content";
import Footer from "../Home/Footer";
import IsLogin from "../../../ReUse/IsLogin/IsLogin";
import { getAuth } from "../../../Constants/INFO_USER";
import RoleStudent from "../../../ReUse/IsLogin/RoleStudent";
import { useEffect } from "react";

export default function StudentDashboard() {
  const { user, token } = getAuth();
  IsLogin(user, token);
  RoleStudent(user?.role);
  useEffect(() => {
    document.title = "Trang chủ sinh viên";
  }, []);
  return (
    <>
      <Header />
      <Content />
      <Footer />
    </>
  );
}

import Header from "../Home/Header";
import Content from "../Home/Content";
import Footer from "../Home/Footer";
import IsLogin from "../../../ReUse/IsLogin/IsLogin";
import { getAuth } from "../../../Constants/INFO_USER";
import RoleStudent from "../../../ReUse/IsLogin/RoleStudent";
import { useEffect } from "react";
import BackToTop from "../../../ReUse/Top/BackToTop";
export default function StudentDashboard() {
  const { user, token } = getAuth();
  useEffect(() => {
    document.title = "Trang chủ sinh viên";
  }, []);
  IsLogin(user, token);
  RoleStudent(user?.role);

  return (
    <>
      <Header />
      <Content />
      <BackToTop />
      <Footer />
    </>
  );
}

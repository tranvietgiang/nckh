import { useEffect } from "react";
import Header from "../Home/Header";
import Content from "../Home/Content";
import Footer from "../Home/Footer";
import useIsLogin from "../../../ReUse/IsLogin/IsLogin";
import { getAuth } from "../../../Constants/INFO_USER";
import BackToTop from "../../../ReUse/Top/BackToTop";
export default function StudentDashboard() {
  const { user, token } = getAuth();

  useEffect(() => {
    document.title = "Trang chủ sinh viên";
  }, []);

  useIsLogin(user, token, "student");

  return (
    <>
      <Header />
      <Content />
      <BackToTop />
      <Footer />
    </>
  );
}

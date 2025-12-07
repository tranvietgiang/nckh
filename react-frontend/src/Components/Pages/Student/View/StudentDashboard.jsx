import { useEffect } from "react";
import Header from "../Home/Header";
import Content from "../Home/Content";
import Footer from "../../../ReUse/Footer/Footer";
import useIsLogin from "../../../ReUse/IsLogin/IsLogin";
import { getAuth } from "../../../Constants/INFO_USER";
import BackToTop from "../../../ReUse/Top/BackToTop";
import Navbar from "../../../ReUse/Navbar/Navbar";
export default function StudentDashboard() {
  const { user, token } = getAuth();

  useEffect(() => {
    document.title = "Trang chủ sinh viên";
  }, []);

  useIsLogin(user, token, "student");

  return (
    <>
      <Navbar />
      <Header />
      <Content />
      <BackToTop />
      <Footer />
    </>
  );
}

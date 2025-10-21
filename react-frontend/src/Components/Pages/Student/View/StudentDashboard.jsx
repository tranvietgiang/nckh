import Header from "../Home/Header";
import Content from "../Home/Content";
import Footer from "../Home/Footer";
import IsLogin from "../../../ReUse/IsLogin/IsLogin";
import { getAuth } from "../../../Constants/INFO_USER";

export default function StudentDashboard() {
  // const { User, token } = getAuth();
  // IsLogin(User, token);
  return (
    <>
      <Header />
      <Content />
      <Footer />
    </>
  );
}

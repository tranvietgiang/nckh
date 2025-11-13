import { useEffect, useState } from "react";
import Footer from "../../Student/Home/Footer";
import Navbar from "../../../ReUse/Navbar/Navbar";
import ModalCreateReport from "../Modal/ModalCreateReports";

export default function ReportManager() {
  useEffect(() => {
    document.title = "Quản lý báo cáo";
  }, []);

  const [open, setOpen] = useState(false);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 p-8">
        {/* Header */}
        <div className="bg-blue-600 text-white p-5 rounded-t-2xl shadow">
          <h1 className="text-3xl font-bold text-center"> QUẢN LÝ BÁO CÁO</h1>
        </div>
      </div>
      <div onClick={() => setOpen(true)}>Tạo báo cáo</div>
      <div>Xem báo cáo đã nộp</div>
      <div>Xem báo cáo chưa nộp</div>
      <div>Xem báo cáo đã chấm </div>
      <ModalCreateReport
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={() => {
          setOpen(false);
        }}
      />
      <Footer />
    </>
  );
}

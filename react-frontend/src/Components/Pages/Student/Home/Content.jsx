import BackToTop from "../../../ReUse/Top/BackToTop";
import PendingReports from "./PendingReports";
import ReportCompleted from "./ReportCompleted";
export default function Content() {
  return (
    <>
      <main className="bg-gray-50 min-h-screen">
        {/* phần chưa hoàn thành */}
        <PendingReports />
        {/* phần đã hoàn thành */}
        <ReportCompleted />
        <BackToTop />
      </main>
    </>
  );
}

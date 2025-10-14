import React from "react";

const PendingReports = () => {
  const reports = [
    {
      title: "Báo cáo cuối kỳ: Hệ thống nộp đồ án trực tuyến",
      mon: "Chuyên đề web 1",
      hanNop: "15/12/2024 (3 ngày nữa)",
      yeuCau: "PDF",
      trangThai: "✅ Chưa nộp",
      nam: "2025",
    },
    {
      title: "Báo cáo cuối kỳ:?",
      mon: "CMS",
      hanNop: "11/12/2024 (3 ngày nữa)",
      yeuCau: "PDF",
      trangThai: "✅ Chưa nộp",
      nam: "2025",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto bg-gray-50 min-h-screen p-4 rounded-lg shadow-md mt-[10px]">
      <h1 className="text-3xl font-bold text-center mb-4">
        BÁO CHƯA HOÀN THÀNH (2)
      </h1>

      {reports.map((report, index) => (
        <div key={index} className="mb-6 last:mb-0">
          <div className="border border-gray-300 rounded-lg p-4">
            <h2 className="font-semibold mb-2">{report.title}</h2>

            <div className="space-y-1 text-sm">
              <div>
                <strong>Môn:</strong> {report.mon}
              </div>
              <div>
                <strong>Hạn nộp:</strong> {report.hanNop}
              </div>
              <div>
                <strong>Yêu cầu:</strong> {report.yeuCau}
              </div>
              <div>
                <strong>Trạng thái:</strong> {report.trangThai}
              </div>
              <div>
                <strong>năm:</strong> {report.nam}
              </div>
            </div>

            <button className="w-full mt-3 bg-red-600 text-white py-2 px-4 rounded-lg flex items-center justify-center">
              <span className="mr-2">🔴</span>
              Nộp báo cáo
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PendingReports;

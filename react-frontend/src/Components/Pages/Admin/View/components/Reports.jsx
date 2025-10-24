import React from "react";

export default function ReportsManagement({ reports }) {
  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
        Quản Lý Báo Cáo
      </h2>

      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 overflow-x-auto">
        {reports.length === 0 ? (
          <p className="text-gray-500 text-sm">Chưa có báo cáo hợp lệ.</p>
        ) : (
          <table className="w-full border-collapse text-sm sm:text-base">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="p-2 text-left">Mã báo cáo</th>
                <th className="p-2 text-left">Mã sinh viên</th>
                <th className="p-2 text-left">Tên sinh viên</th>
                <th className="p-2 text-left">Trạng thái</th>
                <th className="p-2 text-left">Ngày nộp</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr
                  key={report.submission_id}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="p-2">{report.submission_id}</td>
                  <td className="p-2">{report.student_id}</td>
                  <td className="p-2">{report.student_name}</td>
                  <td className="p-2 capitalize">
                    {report.status === "graded"
                      ? "✅ Đã chấm"
                      : report.status === "submitted"
                      ? "📄 Đã nộp"
                      : "❌ Lỗi"}
                  </td>
                  <td className="p-2">
                    {new Date(report.submission_time).toLocaleDateString(
                      "vi-VN"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

import React from "react";

const PendingReports = () => {
  const reports = [
    {
      id: 1,
      title: "Báo cáo cuối kỳ: Hệ thống nộp đồ án trực tuyến",
      subject: "Chuyên đề web 1",
      deadline: "15/12/2024",
      daysLeft: "3 ngày nữa",
      requirement: "PDF",
      status: "✕ Chưa nộp",
      year: "2025",
    },
    {
      id: 2,
      title: "Báo cáo cuối kỳ: ?",
      subject: "CMS",
      deadline: "11/12/2024",
      daysLeft: "3 ngày nữa",
      requirement: "PDF",
      status: "✕ Chưa nộp",
      year: "2025",
    },
  ];

  const getStatusColor = (status) => {
    return status.includes("✕") ? "text-red-600" : "text-green-600";
  };

  const getDaysLeftColor = (daysLeft) => {
    if (daysLeft.includes("1 ngày") || daysLeft.includes("Hôm nay")) {
      return "text-red-600 bg-red-50";
    } else if (daysLeft.includes("2 ngày") || daysLeft.includes("3 ngày")) {
      return "text-orange-600 bg-orange-50";
    }
    return "text-blue-600 bg-blue-50";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-2">
            BÁO CÁO CHƯA HOÀN THÀNH ({reports.length})
          </h1>
          <div className="w-20 h-1 bg-red-500 mx-auto"></div>
        </div>

        {/* Reports List */}
        <div className="space-y-6">
          {reports.map((report, index) => (
            <div
              key={report.id}
              className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="p-6">
                {/* Report Header */}
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                      {report.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <span className="font-medium">Môn: {report.subject}</span>
                      <span className="font-medium">Năm: {report.year}</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div
                    className={`mt-2 lg:mt-0 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      report.status
                    )} bg-red-50 border border-red-200`}
                  >
                    {report.status}
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 my-4"></div>

                {/* Report Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  {/* Deadline */}
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-blue-600 text-sm font-bold">
                        ⏰
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Hạn nộp</p>
                      <p className="font-semibold text-gray-800">
                        {report.deadline}
                      </p>
                    </div>
                  </div>

                  {/* Days Left */}
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-orange-600 text-sm font-bold">
                        📅
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Thời gian còn lại</p>
                      <p
                        className={`font-semibold ${getDaysLeftColor(
                          report.daysLeft
                        )} px-2 py-1 rounded`}
                      >
                        {report.daysLeft}
                      </p>
                    </div>
                  </div>

                  {/* Requirement */}
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-purple-600 text-sm font-bold">
                        📄
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Yêu cầu</p>
                      <p className="font-semibold text-gray-800">
                        {report.requirement}
                      </p>
                    </div>
                  </div>

                  {/* Year */}
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-green-600 text-sm font-bold">
                        🎓
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Năm học</p>
                      <p className="font-semibold text-gray-800">
                        {report.year}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <button className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm">
                    <span className="mr-2">💡</span>
                    Nộp báo cáo
                  </button>
                </div>
              </div>

              {/* Divider between reports */}
              {index < reports.length - 1 && (
                <div className="px-6">
                  <div className="border-t border-gray-300 border-dashed"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State (uncomment if needed) */}
        {/* {reports.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Tất cả báo cáo đã hoàn thành!</h3>
            <p className="text-gray-500">Bạn không có báo cáo nào cần nộp.</p>
          </div>
        )} */}

        {/* Footer Stats */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex flex-wrap justify-between items-center">
            <div className="text-sm text-gray-600">
              Tổng số báo cáo chưa hoàn thành:{" "}
              <span className="font-semibold">{reports.length}</span>
            </div>
            <div className="text-sm text-gray-600">
              Cập nhật:{" "}
              <span className="font-semibold">
                {new Date().toLocaleDateString("vi-VN")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingReports;

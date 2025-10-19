import React from "react";

const CompleteReports = () => {
  const completedReports = [
    {
      id: 1,
      title: "Báo cáo cuối kỳ: ?",
      subject: "?",
      submittedDate: "5/12/2024",
      score: "8.4/10",
      status: "💬 Đã nộp",
      year: "2025",
    },
    {
      id: 2,
      title: "Báo cáo cuối kỳ: ?",
      subject: "?",
      submittedDate: "10/12/2024",
      score: "8.5/10",
      status: "💬 Đã nộp",
      year: "2025",
    },
  ];

  const getScoreColor = (score) => {
    const numericScore = parseFloat(score);
    if (numericScore >= 8.5) return "text-green-600 bg-green-50";
    if (numericScore >= 7.0) return "text-blue-600 bg-blue-50";
    if (numericScore >= 5.0) return "text-orange-600 bg-orange-50";
    return "text-red-600 bg-red-50";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-8 mt-2">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            BÁO CÁO ĐÃ HOÀN THÀNH ({completedReports.length})
          </h1>
          <div className="w-24 h-1 bg-green-500"></div>
        </div>

        {/* Reports Grid - Laptop Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {completedReports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300"
            >
              {/* Report Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-800 mb-2">
                    {report.title}
                  </h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="font-semibold">Môn: {report.subject}</span>
                    <span className="font-semibold">Năm: {report.year}</span>
                  </div>
                </div>
                <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold border border-green-200">
                  {report.status}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 my-4"></div>

              {/* Report Details - Horizontal Layout for Laptop */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-bold">📅</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Đã nộp</p>
                      <p className="font-semibold text-gray-800">
                        {report.submittedDate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-green-600 font-bold">🎓</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Năm học</p>
                      <p className="font-semibold text-gray-800">
                        {report.year}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-purple-600 font-bold">⭐</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Điểm số</p>
                      <p
                        className={`font-bold ${getScoreColor(
                          report.score
                        )} px-3 py-1 rounded-lg`}
                      >
                        {report.score}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-gray-600 font-bold">📊</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Trạng thái</p>
                      <p className="font-semibold text-gray-800">
                        Đã chấm xong
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* View Results Button */}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button className="flex items-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg">
                  <span className="mr-2">💬</span>
                  Xem kết quả
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {completedReports.length}
              </div>
              <div className="text-sm text-gray-600">Tổng số báo cáo</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">8.45/10</div>
              <div className="text-sm text-gray-600">Điểm trung bình</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">100%</div>
              <div className="text-sm text-gray-600">Tỷ lệ hoàn thành</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center text-sm text-gray-500">
          Cập nhật lần cuối: {new Date().toLocaleDateString("vi-VN")}
        </div>
      </div>
    </div>
  );
};

export default CompleteReports;

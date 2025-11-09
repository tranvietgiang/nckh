import axios from "../../../../config/axios";
import React, { useEffect, useState } from "react";

export default function CompleteReports() {
  const [completedReports, setCompletedReports] = useState([]);
  const [hasInvalidScore, setHasInvalidScore] = useState(false); // 👈 cờ báo lỗi điểm

  useEffect(() => {
    axios
      .get("/get-all-report-graded")
      .then((res) => {
        const rows = Array.isArray(res.data) ? res.data : [];

        // ✅ lấy numericScore nếu có; nếu không thì tách "x/10" thành số x
        const toNumber = (r) =>
          typeof r.numericScore === "number"
            ? r.numericScore
            : Number(String(r.score || "").split("/")[0]);

        // (tuỳ chọn) nếu muốn kẹp về 0..10 ở client:
        // const safeRows = rows.map((r) => {
        //   const n = toNumber(r);
        //   const clamped = Math.max(0, Math.min(10, isNaN(n) ? 0 : n));
        //   return { ...r, numericScore: clamped, score: `${clamped.toFixed(1)}/10` };
        // });

        setCompletedReports(rows);

        // 👇 kiểm tra có dòng nào điểm > 10 hoặc < 0 hay NaN không
        const invalid = rows.some((r) => {
          const n = toNumber(r);
          return isNaN(n) || n > 10 || n < 0;
        });
        setHasInvalidScore(invalid);

        // debug:
        // console.log("invalid score?", invalid);
      })
      .catch((err) => {
        setCompletedReports([]);
        console.log(err);
      });
  }, []);

  const getScoreColor = (score, numericScore) => {
    const val =
      typeof numericScore === "number"
        ? numericScore
        : Number(String(score || "").split("/")[0]) || 0;
    if (val >= 8.5) return "text-green-600 bg-green-50";
    if (val >= 7.0) return "text-blue-600 bg-blue-50";
    if (val >= 5.0) return "text-orange-600 bg-orange-50";
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

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {hasInvalidScore ? (
            <div className="mb-3 rounded bg-red-50 text-red-700 px-3 py-2 border border-red-200">
              ⚠️ Dữ liệu có điểm không hợp lệ (ngoài khoảng 0..10). Vui lòng
              liên hệ giáo viên bộ môn
            </div>
          ) : (
            completedReports?.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300"
              >
                {/* Report Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">
                      Học kỳ: {report.title}
                    </h2>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="font-semibold">
                        Môn: {report.subject}
                      </span>
                      <span className="font-semibold">
                        Nhóm: {report?.group_name ?? "G"}
                      </span>
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
              </div>
            ))
          )}
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
}

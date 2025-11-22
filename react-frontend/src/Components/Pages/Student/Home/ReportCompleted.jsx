import axios from "../../../../config/axios";
import { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import {
  getSafeJSON,
  setSafeJSON,
} from "../../../ReUse/LocalStorage/LocalStorageSafeJSON";

export default function CompleteReports() {
  const [completedReports, setCompletedReports] = useState([]);
  const [hasInvalidScore, setHasInvalidScore] = useState(false);
  const [feedBackIdReport, setFeedBackIdReport] = useState(null);
  const [getNameTeacher, setNameTeacher] = useState(null);
  const [getNameGroup, setNameGroup] = useState(null);

  useEffect(() => {
    axios
      .get("/get-all-report-graded")
      .then((res) => {
        const rows = Array.isArray(res.data) ? res.data : [];

        // console.log(rows);
        const toNumber = (r) =>
          typeof r.numericScore === "number"
            ? r.numericScore
            : Number(String(r.score || "").split("/")[0]);

        setCompletedReports(rows);

        const invalid = rows.some((r) => {
          const n = toNumber(r);
          return isNaN(n) || n > 10 || n < 0;
        });

        setHasInvalidScore(invalid);
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

  useEffect(() => {
    if (!feedBackIdReport) return;
    const cacheNameTeacher = getSafeJSON("cacheNameTeacher") || {};
    if (cacheNameTeacher[feedBackIdReport]) {
      setNameTeacher(cacheNameTeacher[feedBackIdReport]);
      return;
    }

    axios
      .get(`/get-teacher-name-by-submission/${feedBackIdReport}`)
      .then((res) => {
        if (res.data.submission_id === feedBackIdReport) {
          setNameTeacher(res.data?.teacher_name);
          const updatedCache = {
            ...cacheNameTeacher,
            [feedBackIdReport]: res.data?.teacher_name,
          };
          setSafeJSON("cacheNameTeacher", updatedCache);
        }
      })
      .catch((err) => {
        console.log("Lỗi lấy tên giáo viên:", err);
        setNameTeacher("Không rõ");
      });
  }, [feedBackIdReport]);

  useEffect(() => {
    axios
      .get(`/get-name-group-by-student`)
      .then((res) => {
        setNameGroup(res.data || []);
        // console.log(res.data);
      })
      .catch((err) => {
        setNameGroup([]);
        console.log(err);
      });
  }, []);

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
            completedReports?.map((report, index) => {
              const group = getNameGroup?.find(
                (g) => g.report_id === report.report_id
              );

              return (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300"
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-800 mb-2">
                        Học kỳ: {report.hoc_ky}
                      </h2>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="font-semibold">
                          <strong>Môn: </strong>
                          {report.subject_name}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-200 my-4"></div>

                  {/* Body */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-bold">👥</span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Nhóm</p>
                          <p className="font-semibold text-gray-800">
                            {group?.rm_name ?? "Chưa có thông tin"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-green-600 font-bold">⏳</span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Thời hạn nộp</p>
                          <p className="font-semibold text-gray-800">
                            {report?.thoi_gian_nop ?? "Chưa có thông tin"}
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

                  {/* Toggle Feedback */}
                  <div
                    onClick={() => setFeedBackIdReport(report?.submission_id)}
                    className="flex items-center text-center justify-center p-2 border-t border-gray-200 hover:bg-gray-50 rounded-lg cursor-pointer"
                  >
                    <p className="font-semibold text-gray-800">Xem phản hồi</p>
                  </div>

                  {/* Feedback Box */}
                  {report.submission_id === feedBackIdReport && (
                    <div>
                      <span
                        className="text-xl text-gray-600 hover:text-red-600 float-right cursor-pointer"
                        onClick={() => setFeedBackIdReport(false)}
                      >
                        <IoMdClose />
                      </span>
                      <div className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm">
                        <p className="font-semibold text-gray-700 mb-2">
                          GV:
                          <span className="font-normal text-blue-600 break-words mx-2">
                            {getNameTeacher ?? "Chưa có thông tin"}
                          </span>
                        </p>

                        <div className="mt-3">
                          <p className="font-semibold text-gray-700 mb-2">
                            Lời phản hồi:
                          </p>

                          <div className="bg-gray-50 border border-gray-200 rounded-md p-3 min-h-[80px]">
                            <div className="text-gray-700 whitespace-pre-wrap break-words text-sm">
                              {report?.feedback ? (
                                report.feedback.length > 600 ? (
                                  <span className="text-red-500">
                                    ❌ Quá 600 ký tự
                                  </span>
                                ) : (
                                  report.feedback
                                )
                              ) : (
                                "Chưa có phản hồi"
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

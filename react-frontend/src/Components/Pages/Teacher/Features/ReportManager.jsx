import { useEffect, useState } from "react";
import Footer from "../../Student/Home/Footer";
import Navbar from "../../../ReUse/Navbar/Navbar";
import ModalCreateReport from "../Modal/ModalCreateReports";
import axios from "../../../../config/axios";
import {
  FileText,
  Plus,
  CheckCircle,
  Clock,
  Download,
  Search,
  Filter,
  ChevronDown
} from "lucide-react";
import { getAuth } from "../../../Constants/INFO_USER";

export default function ReportManager() {
  useEffect(() => {
    document.title = "Quản lý báo cáo";
  }, []);

  const { token } = getAuth();

  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // ⭐ DỮ LIỆU REPORT
  const [reports, setReports] = useState([]);

  // ⭐ LOAD API
  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await axios.get("/teacher/reports", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // ⭐ MAP VỀ ĐÚNG FORMAT UI
      const mapped = res.data.map((r) => ({
        id: r.report_id,
        title: r.report_name,
        subject: r.class_name,
        deadline: r.end_date,
        submittedDate: null,
        score: null,
        status: "open", // tạm open — sau bạn có status DB thì đổi
        type: "weekly", // tạm weekly — bạn muốn phân loại theo tên thì nói tôi
      }));

      setReports(mapped);
    } catch (err) {
      console.log("Lỗi load reports:", err);
    }
  };

  // ⭐ FILTER — giữ nguyên của bạn
  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.subject.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === "all") return matchesSearch;
    if (activeTab === "submitted") return matchesSearch && report.status === "submitted";
    if (activeTab === "pending") return matchesSearch && report.status === "pending";
    if (activeTab === "graded") return matchesSearch && report.status === "graded";

    return matchesSearch;
  });

  const getStatusInfo = (status, score) => {
    switch (status) {
      case "submitted":
        return { text: "Đã nộp", color: "text-blue-600", bg: "bg-blue-100", icon: CheckCircle };
      case "graded":
        return { text: `Đã chấm: ${score}`, color: "text-green-600", bg: "bg-green-100", icon: CheckCircle };
      case "pending":
        return { text: "Chưa nộp", color: "text-orange-600", bg: "bg-orange-100", icon: Clock };
      default:
        return { text: "Chưa nộp", color: "text-gray-600", bg: "bg-gray-100", icon: Clock };
    }
  };

  const getTypeInfo = (type) => {
    switch (type) {
      case "weekly":
        return { text: "Tuần", color: "text-purple-600", bg: "bg-purple-100" };
      case "midterm":
        return { text: "Giữa kỳ", color: "text-orange-600", bg: "bg-orange-100" };
      case "final":
        return { text: "Cuối kỳ", color: "text-red-600", bg: "bg-red-100" };
      default:
        return { text: "Khác", color: "text-gray-600", bg: "bg-gray-100" };
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pb-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8 shadow-lg">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-4">QUẢN LÝ BÁO CÁO</h1>
            <p className="text-center text-blue-100 text-lg">
              Theo dõi và quản lý tất cả báo cáo học tập
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div
              onClick={() => setOpen(true)}
              className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all duration-300 border-2 border-dashed border-blue-300 hover:border-blue-500 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200">
                  <Plus className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <h3 className="font-semibold text-gray-800 text-lg mb-2">Tạo báo cáo</h3>
              <p className="text-gray-600 text-sm">Tạo báo cáo mới cho lớp học</p>
            </div>

            <div
              onClick={() => setActiveTab("submitted")}
              className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-2xl font-bold text-gray-800">
                  {reports.filter((r) => r.status === "submitted").length}
                </span>
              </div>
              <h3 className="font-semibold text-gray-800 text-lg mb-2">Đã nộp</h3>
              <p className="text-gray-600 text-sm">Báo cáo đã được nộp</p>
            </div>

            <div
              onClick={() => setActiveTab("pending")}
              className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all duration-300 border-l-4 border-l-orange-500"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <span className="text-2xl font-bold text-gray-800">
                  {reports.filter((r) => r.status === "pending").length}
                </span>
              </div>
              <h3 className="font-semibold text-gray-800 text-lg mb-2">Chưa nộp</h3>
              <p className="text-gray-600 text-sm">Báo cáo chưa được nộp</p>
            </div>

            <div
              onClick={() => setActiveTab("graded")}
              className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all duration-300 border-l-4 border-l-green-500"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-2xl font-bold text-gray-800">
                  {reports.filter((r) => r.status === "graded").length}
                </span>
              </div>
              <h3 className="font-semibold text-gray-800 text-lg mb-2">Đã chấm</h3>
              <p className="text-gray-600 text-sm">Báo cáo đã được chấm điểm</p>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex gap-4 flex-1 w-full">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm báo cáo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50">
                  <Filter className="w-5 h-5" />
                  Lọc
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mt-6 border-b border-gray-200">
              {[
                { id: "all", label: "Tất cả", count: reports.length },
                { id: "submitted", label: "Đã nộp", count: reports.filter((r) => r.status === "submitted").length },
                { id: "pending", label: "Chưa nộp", count: reports.filter((r) => r.status === "pending").length },
                { id: "graded", label: "Đã chấm", count: reports.filter((r) => r.status === "graded").length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-t-lg border-b-2 transition-colors ${activeTab === tab.id
                      ? "border-blue-500 text-blue-600 bg-blue-50"
                      : "border-transparent text-gray-600"
                    }`}
                >
                  <span>{tab.label}</span>
                  <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Report List */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {filteredReports.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Không có báo cáo nào</h3>
                <p className="text-gray-500">Hãy tạo báo cáo mới hoặc kiểm tra lại bộ lọc</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredReports.map((report) => {
                  const StatusIcon = getStatusInfo(report.status, report.score).icon;
                  const typeInfo = getTypeInfo(report.type);

                  return (
                    <div key={report.id} className="p-6 hover:bg-gray-50">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-800 text-lg">{report.title}</h3>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${typeInfo.bg} ${typeInfo.color}`}
                            >
                              {typeInfo.text}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-2">{report.subject}</p>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                            <span>Hạn nộp: {report.deadline}</span>
                            {report.submittedDate && <span>Nộp lúc: {report.submittedDate}</span>}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <StatusIcon
                              className={`w-5 h-5 ${getStatusInfo(report.status, report.score).color}`}
                            />
                            <span
                              className={`font-medium ${getStatusInfo(report.status, report.score).color}`}
                            >
                              {getStatusInfo(report.status, report.score).text}
                            </span>
                          </div>

                          <div className="flex gap-2">
                            {report.status === "submitted" && (
                              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                <Download className="w-4 h-4" />
                                Tải về
                              </button>
                            )}

                            {report.status === "pending" && (
                              <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                                <FileText className="w-4 h-4" />
                                Nộp bài
                              </button>
                            )}

                            {report.status === "graded" && (
                              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                                <FileText className="w-4 h-4" />
                                Xem kết quả
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <ModalCreateReport
          open={open}
          onClose={() => setOpen(false)}
          onSuccess={() => {
            setOpen(false);
            fetchReports(); // reload khi tạo thành công
          }}
        />
      </div>

      <Footer />
    </>
  );
}

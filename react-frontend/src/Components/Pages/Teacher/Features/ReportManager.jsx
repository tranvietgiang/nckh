import { useEffect, useState } from "react";
import Footer from "../../Student/Home/Footer";
import Navbar from "../../../ReUse/Navbar/Navbar";
import ModalCreateReport from "../Modal/ModalCreateReports";
import ModalUpdateReport from "../Modal/ModalUpdateReport";
import axios from "../../../../config/axios";
import BackToTop from "../../../ReUse/Top/BackToTop";
import RouterBack from "../../../ReUse/Back/RouterBack";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Plus,
  CheckCircle,
  Search,
  RefreshCw,
  Edit3,
  Eye,
  Edit,
  Calendar,
  BookOpen,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { getAuth } from "../../../Constants/INFO_USER";
import useIsLogin from "../../../ReUse/IsLogin/IsLogin";

export default function ReportManager() {
  useEffect(() => {
    document.title = "Quản lý báo cáo";
  }, []);

  const { user, token } = getAuth();

  useIsLogin(user, token, "teacher");

  const [open, setOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null); // State cho confirm delete
  const [deleting, setDeleting] = useState(false); // State cho loading xóa

  // DỮ LIỆU REPORT
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  // LOAD API
  useEffect(() => {
    fetchReports();
  }, []);

  const navigate = useNavigate();

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/teacher/reports");

      const mapped = res.data.map((r) => ({
        id: r.report_id,
        title: r.report_name,
        subject: r.class_name,
        deadline: r.end_date,
        start_date: r.start_date,
        description: r.description,
        class_id: r.class_id,
        status: mapApiStatusToUI(r.status),
        rawStatus: r.status,
      }));

      setReports(mapped);
    } catch (err) {
      console.log("Lỗi load reports:", err);
      alert("Lỗi khi tải danh sách báo cáo");
    } finally {
      setLoading(false);
    }
  };

  // Map status từ API sang UI
  const mapApiStatusToUI = (apiStatus) => {
    switch (apiStatus) {
      case "open":
        return "not-started";
      case "submitted":
        return "under-review";
      case "graded":
        return "completed";
      case "expired":
        return "in-progress";
      default:
        return "not-started";
    }
  };

  // HÀM CẬP NHẬT BÁO CÁO
  const handleUpdateReport = (reportId) => {
    const currentReport = reports.find((r) => r.id === reportId);
    if (currentReport) {
      setSelectedReport(currentReport);
      setUpdateModalOpen(true);
    }
  };

  // HÀM XÓA BÁO CÁO
  const handleDeleteReport = async (reportId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa báo cáo này?")) {
      return;
    }

    try {
      setDeleting(true);
      const res = await axios.delete(`/teacher/reports/${reportId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        alert("✅ Xóa báo cáo thành công!");
        // Xóa khỏi state mà không cần reload
        setReports(reports.filter(report => report.id !== reportId));
      } else {
        alert("❌ " + res.data.message);
      }
    } catch (err) {
      console.error("Lỗi xóa báo cáo:", err);
      alert(err.response?.data?.message || "Lỗi khi xóa báo cáo");
    } finally {
      setDeleting(false);
      setDeleteConfirm(null);
    }
  };

  // HÀM XỬ LÝ CẬP NHẬT THÀNH CÔNG
  const handleUpdateSuccess = () => {
    setUpdateModalOpen(false);
    setSelectedReport(null);
    fetchReports();
  };

  // FILTER - CHỈ ĐỂ LỌC THEO TÌM KIẾM
  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.subject.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // CẬP NHẬT STATUS INFO
  const getStatusInfo = (status) => {
    switch (status) {
      case "in-progress":
        return {
          text: "Đang thực hiện",
          color: "text-orange-600",
          bg: "bg-orange-50 border-orange-200",
          icon: Edit3,
        };
      case "under-review":
        return {
          text: "Chờ duyệt",
          color: "text-blue-600",
          bg: "bg-blue-50 border-blue-200",
          icon: Eye,
        };
      case "completed":
        return {
          text: "Đã hoàn thành",
          color: "text-green-600",
          bg: "bg-green-50 border-green-200",
          icon: CheckCircle,
        };
      default:
        return {
          text: "",
          color: "text-gray-600",
          bg: "bg-gray-50 border-gray-200",
          icon: FileText,
        };
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  // Modal Confirm Delete
  const DeleteConfirmModal = () => {
    if (!deleteConfirm) return null;

    const report = reports.find(r => r.id === deleteConfirm);

    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
          <div className="mb-4 flex items-start gap-3">
            <div className="rounded-full bg-red-100 p-2">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Xóa báo cáo</h3>
              <p className="mt-1 text-sm text-gray-600">
                Bạn có chắc chắn muốn xóa báo cáo này?
              </p>
            </div>
          </div>

          <div className="mb-4 rounded-lg bg-gray-50 p-3">
            <p className="font-medium text-gray-900">{report?.title}</p>
            <p className="text-sm text-gray-600 mt-1">{report?.subject}</p>
            <p className="text-xs text-gray-500 mt-2">
              Ngày tạo: {formatDate(report?.start_date)}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setDeleteConfirm(null)}
              className="flex-1 rounded-lg border border-gray-300 bg-white py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              onClick={() => handleDeleteReport(deleteConfirm)}
              disabled={deleting}
              className={`flex-1 rounded-lg py-2.5 text-sm font-medium text-white ${deleting ? 'bg-red-400' : 'bg-red-600 hover:bg-red-700'}`}
            >
              {deleting ? 'Đang xóa...' : 'Xóa báo cáo'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pb-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12 shadow-lg">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold mb-4">QUẢN LÝ BÁO CÁO</h1>
            <p className="text-lg text-blue-100">
              Theo dõi và quản lý tất cả báo cáo học tập
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
          {/* Header Section với Search và Create */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              {/* Search Box */}
              <div className="flex-1 w-full">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm báo cáo theo tên hoặc môn học..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={fetchReports}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  <RefreshCw
                    className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
                  />
                  {loading ? "Đang tải..." : "Làm mới"}
                </button>

                <button
                  onClick={() => setOpen(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  Tạo báo cáo
                </button>
              </div>
            </div>
          </div>
          <RouterBack navigate={navigate} />

          {/* Report List */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {loading ? (
              <div className="text-center py-16">
                <RefreshCw className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Đang tải dữ liệu...
                </h3>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="text-center py-16">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Không có báo cáo nào
                </h3>
                <p className="text-gray-500 mb-6">
                  Hãy tạo báo cáo đầu tiên cho lớp học của bạn
                </p>
                <button
                  onClick={() => setOpen(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-5 h-5 inline mr-2" />
                  Tạo báo cáo đầu tiên
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredReports.map((report) => {
                  const statusInfo = getStatusInfo(report.status);
                  const StatusIcon = statusInfo.icon;

                  return (
                    <div
                      key={report.id}
                      className="p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        {/* Report Info */}
                        <div className="flex-1">
                          <div className="flex items-start gap-4 mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-800 text-xl mb-2">
                                {report.title}
                              </h3>
                              <div className="flex items-center gap-2 text-gray-600 mb-3">
                                <BookOpen className="w-4 h-4 flex-shrink-0" />
                                <span className="text-sm">
                                  {report.subject}
                                </span>
                              </div>
                            </div>

                            {/* Status Badge */}
                            {statusInfo.text && (
                              <div
                                className={`flex items-center gap-2 px-3 py-1 rounded-full border ${statusInfo.bg} ${statusInfo.color} flex-shrink-0`}
                              >
                                <StatusIcon className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                  {statusInfo.text}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Dates */}
                          <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>
                                Bắt đầu: {formatDate(report.start_date)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>
                                Hạn nộp: {formatDate(report.deadline)}
                              </span>
                            </div>
                          </div>

                          {/* Description */}
                          {report.description && (
                            <p className="text-gray-600 text-sm mt-3 line-clamp-2">
                              {report.description}
                            </p>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex-shrink-0 flex gap-2">
                          <button
                            onClick={() => handleUpdateReport(report.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                          >
                            <Edit className="w-4 h-4" />
                            Cập nhật
                          </button>

                          <button
                            onClick={() => setDeleteConfirm(report.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                            Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        <ModalCreateReport
          open={open}
          onClose={() => setOpen(false)}
          onSuccess={() => {
            setOpen(false);
            fetchReports();
          }}
        />

        <ModalUpdateReport
          open={updateModalOpen}
          onClose={() => {
            setUpdateModalOpen(false);
            setSelectedReport(null);
          }}
          onSuccess={handleUpdateSuccess}
          report={selectedReport}
        />

        {/* Delete Confirm Modal */}
        <DeleteConfirmModal />
      </div>

      <BackToTop />
      <Footer />
    </>
  );
}
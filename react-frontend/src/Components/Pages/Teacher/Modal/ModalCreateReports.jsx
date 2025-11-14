import { useState, useEffect, useMemo } from "react";
import axios from "../../../../config/axios";
import { getAuth } from "../../../Constants/INFO_USER";

export default function ModalCreateReport({ open, onClose, onSuccess }) {
  const { token } = getAuth();

  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [reportName, setReportName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================
  // 🔥 LOAD DANH SÁCH LỚP GIẢNG VIÊN
  // ==========================
  useEffect(() => {
    if (!open) return;

    setLoading(true);
    setError("");

    axios
      .get("/get-class-by-major/all", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setClasses(res.data || []);
      })
      .catch((err) => {
        console.error("❌ Lỗi:", err);
        setError("Không tải được danh sách lớp.");
      })
      .finally(() => setLoading(false));
  }, [open, token]);

  // ==========================
  // 🔍 Validate
  // ==========================
  const errors = useMemo(() => {
    let e = {};
    if (!selectedClass) e.class_id = "Hãy chọn lớp.";
    if (!reportName.trim()) e.report_name = "Tên báo cáo không được trống.";
    if (!startDate) e.start_date = "Chọn ngày bắt đầu.";
    if (!endDate) e.end_date = "Chọn ngày kết thúc.";
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      e.end_date = "Ngày kết thúc phải ≥ ngày bắt đầu.";
    }
    return e;
  }, [selectedClass, reportName, startDate, endDate]);

  const canSubmit =
    !submitting &&
    Object.keys(errors).length === 0 &&
    selectedClass &&
    reportName &&
    startDate &&
    endDate;

  // Reset form
  const resetForm = () => {
    setSelectedClass("");
    setReportName("");
    setDescription("");
    setStartDate("");
    setEndDate("");
    setError("");
    setSuccess("");
  };

  // Đóng modal và reset form
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // ==========================
  // 📤 SUBMIT FORM
  // ==========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const res = await axios.post(
        "/reports/create",
        {
          class_id: selectedClass,
          report_name: reportName.trim(),
          description: description.trim() || null,
          start_date: startDate,
          end_date: endDate,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccess("Tạo báo cáo thành công!");

      // Tự động đóng modal sau 1.5 giây
      setTimeout(() => {
        resetForm();
        onSuccess && onSuccess(); // Gọi callback để parent component reload danh sách
        onClose();
      }, 1500);

    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Lỗi khi tạo báo cáo.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl animate-fadeIn">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Tạo Báo Cáo Cho Lớp
          </h2>
          <button
            onClick={handleClose}
            className="rounded-lg px-2 py-1 text-gray-600 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        {/* Error & Success */}
        {error && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-3 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Lớp */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Chọn lớp giảng dạy
            </label>

            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className={`w-full rounded-lg border p-2.5 text-sm ${errors.class_id ? "border-red-300" : "border-gray-300"
                }`}
            >
              <option value="">
                {loading ? "Đang tải..." : "-- Chọn lớp --"}
              </option>

              {classes.map((cls) => (
                <option
                  key={cls.class_id_teacher}
                  value={cls.class_id_teacher}
                >
                  {cls.class_name} ({cls.semester}/{cls.academic_year})
                </option>
              ))}
            </select>

            {errors.class_id && (
              <p className="mt-1 text-xs text-red-600">{errors.class_id}</p>
            )}
          </div>

          {/* Tên báo cáo */}
          <div className="mb-4">
            <label className="block text-sm font-medium">Tên báo cáo</label>
            <input
              type="text"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-2.5 text-sm"
              placeholder="Nhập tên báo cáo..."
            />
          </div>

          {/* Mô tả */}
          <div className="mb-4">
            <label className="block text-sm font-medium">Mô tả</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[90px] w-full rounded-lg border border-gray-300 p-2.5 text-sm"
              placeholder="Nhập mô tả báo cáo (tuỳ chọn)..."
            />
          </div>

          {/* Ngày */}
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm">Ngày bắt đầu</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={`w-full rounded-lg border p-2.5 text-sm ${errors.start_date ? "border-red-300" : "border-gray-300"
                  }`}
              />
            </div>
            <div>
              <label className="block text-sm">Ngày kết thúc</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={`w-full rounded-lg border p-2.5 text-sm ${errors.end_date ? "border-red-300" : "border-gray-300"
                  }`}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 rounded-lg border border-gray-300 bg-white py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className={`flex-1 rounded-lg py-2.5 text-sm font-medium text-white ${canSubmit ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-300 cursor-not-allowed"
                }`}
            >
              {submitting ? "Đang tạo..." : "💾 Tạo Báo Cáo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
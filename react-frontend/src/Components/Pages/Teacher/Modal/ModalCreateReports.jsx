import { useState, useEffect, useMemo } from "react";
import axios from "../../../../config/axios";
import { getAuth } from "../../../Constants/INFO_USER";

export default function ModalCreateReport({ open, onClose, onSuccess }) {
  const { token } = getAuth();

  // form state
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [reportName, setReportName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // ui state
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // load classes
  useEffect(() => {
    if (!open) return;

    let mounted = true;
    setLoading(true);

    axios
      .get("/classes")
      .then((res) => mounted && setClasses(res.data || []))
      .catch(() => mounted && setError("Không tải được danh sách lớp."))
      .finally(() => mounted && setLoading(false));

    return () => (mounted = false);
  }, [open]);

  // validate
  const errors = useMemo(() => {
    const e = {};
    if (!selectedClass) e.class_id = "Hãy chọn lớp.";
    if (!reportName.trim()) e.report_name = "Tên báo cáo không được trống.";
    if (!startDate) e.start_date = "Chọn ngày bắt đầu.";
    if (!endDate) e.end_date = "Chọn ngày kết thúc.";
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      e.end_date = "Ngày kết thúc phải ≥ ngày bắt đầu.";
    }
    return e;
  }, [selectedClass, reportName, startDate, endDate]);

  const canSubmit = useMemo(
    () =>
      !submitting &&
      Object.keys(errors).length === 0 &&
      selectedClass &&
      reportName &&
      startDate &&
      endDate,
    [errors, submitting, selectedClass, reportName, startDate, endDate]
  );

  const resetForm = () => {
    setSelectedClass("");
    setReportName("");
    setDescription("");
    setStartDate("");
    setEndDate("");
  };

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
          report_name: reportName.trim(),
          description: description.trim() || null,
          class_id: Number(selectedClass),
          start_date: startDate,
          end_date: endDate,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess("Tạo báo cáo thành công!");
      resetForm();

      if (onSuccess) onSuccess(); // callback
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Lỗi khi tạo báo cáo.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4">
      {/* Modal box */}
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl animate-fadeIn">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Tạo Báo Cáo Cho Lớp
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-gray-600 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        {/* banners */}
        {error && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Lớp */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Chọn lớp
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className={`w-full rounded-lg border p-2.5 text-sm ${
                errors.class_id ? "border-red-300" : "border-gray-300"
              }`}
              disabled={loading || submitting}
            >
              <option value="">
                {loading ? "Đang tải..." : "-- Chọn lớp giảng dạy --"}
              </option>
              {classes.map((cls) => (
                <option key={cls.class_id} value={cls.class_id}>
                  {cls.class_name}
                </option>
              ))}
            </select>
            {errors.class_id && (
              <p className="mt-1 text-xs text-red-600">{errors.class_id}</p>
            )}
          </div>

          {/* Tên báo cáo */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Tên báo cáo
            </label>
            <input
              type="text"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              className={`w-full rounded-lg border p-2.5 text-sm ${
                errors.report_name ? "border-red-300" : "border-gray-300"
              }`}
              maxLength={255}
            />
            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span>
                {errors.report_name
                  ? errors.report_name
                  : "Tên báo cáo dễ hiểu với sinh viên."}
              </span>
              <span>{reportName.length}/255</span>
            </div>
          </div>

          {/* Mô tả */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Mô tả (tuỳ chọn)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              className="min-h-[90px] w-full rounded-lg border border-gray-300 p-2.5 text-sm"
            />
            <p className="mt-1 text-right text-xs text-gray-500">
              {description.length}/1000
            </p>
          </div>

          {/* Ngày */}
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm">Ngày bắt đầu</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={`w-full rounded-lg border p-2.5 text-sm ${
                  errors.start_date ? "border-red-300" : "border-gray-300"
                }`}
              />
              {errors.start_date && (
                <p className="mt-1 text-xs text-red-600">{errors.start_date}</p>
              )}
            </div>
            <div>
              <label className="block text-sm">Ngày kết thúc</label>
              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
                className={`w-full rounded-lg border p-2.5 text-sm ${
                  errors.end_date ? "border-red-300" : "border-gray-300"
                }`}
              />
              {errors.end_date && (
                <p className="mt-1 text-xs text-red-600">{errors.end_date}</p>
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!canSubmit}
            className={`mt-2 w-full rounded-lg py-2.5 text-sm font-medium text-white ${
              canSubmit ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-300"
            }`}
          >
            {submitting ? "Đang tạo..." : "💾 Tạo Báo Cáo"}
          </button>
        </form>
      </div>
    </div>
  );
}

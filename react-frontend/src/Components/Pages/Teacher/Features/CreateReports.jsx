import { useState, useEffect, useMemo } from "react";
import axios from "../../../../config/axios";
import { getAuth } from "../../../Constants/INFO_USER";
import Navbar from "../../../ReUse/Navbar/Navbar";
import Footer from "../../Student/Home/Footer";
import RouterBack from "../../../ReUse/Back/RouterBack";
import { useNavigate } from "react-router-dom";

export default function CreateReports() {
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
  const navigate = useNavigate();
  // lấy lớp đang dạy
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    axios
      .get("/classes")
      .then((res) => mounted && setClasses(res.data || []))
      .catch(() => mounted && setError("Không tải được danh sách lớp."))
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, []);

  // validate cục bộ
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
      reportName &&
      selectedClass &&
      startDate &&
      endDate,
    [errors, submitting, reportName, selectedClass, startDate, endDate]
  );

  const resetForm = () => {
    setReportName("");
    setDescription("");
    setSelectedClass("");
    setStartDate("");
    setEndDate("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!canSubmit) return;

    try {
      setSubmitting(true);
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
      setSuccess(res?.data?.message || "Tạo báo cáo thành công!");
      resetForm();
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

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-3xl p-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <RouterBack navigate={() => navigate(-1)} />
          <h1 className="text-2xl font-semibold text-gray-900">
            Tạo Báo Cáo Cho Lớp
          </h1>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          {/* banners */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          )}

          {/* lớp */}
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Chọn lớp
            </label>
            <div className="relative">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className={`w-full rounded-lg border p-2.5 pr-10 text-sm outline-none transition ${
                  errors.class_id
                    ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                    : "border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
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
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                ▾
              </span>
            </div>
            {errors.class_id && (
              <p className="mt-1 text-xs text-red-600">{errors.class_id}</p>
            )}
          </div>

          {/* tên báo cáo */}
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Tên báo cáo
            </label>
            <input
              type="text"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              placeholder="VD: Báo cáo giữa kỳ"
              className={`w-full rounded-lg border p-2.5 text-sm outline-none transition ${
                errors.report_name
                  ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                  : "border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              }`}
              disabled={submitting}
              maxLength={255}
            />
            <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
              {errors.report_name ? (
                <span className="text-red-600">{errors.report_name}</span>
              ) : (
                <span>Đặt tên dễ hiểu cho sinh viên.</span>
              )}
              <span>{reportName.length}/255</span>
            </div>
          </div>

          {/* mô tả */}
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Mô tả <span className="text-gray-400">(tuỳ chọn)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả ngắn (yêu cầu, phạm vi, định dạng nộp...)"
              className="min-h-[96px] w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              disabled={submitting}
              maxLength={1000}
            />
            <div className="mt-1 text-right text-xs text-gray-500">
              {description.length}/1000
            </div>
          </div>

          {/* ngày */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Ngày bắt đầu
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={`w-full rounded-lg border p-2.5 text-sm outline-none transition ${
                  errors.start_date
                    ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                    : "border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                }`}
                disabled={submitting}
              />
              {errors.start_date && (
                <p className="mt-1 text-xs text-red-600">{errors.start_date}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Ngày kết thúc
              </label>
              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
                className={`w-full rounded-lg border p-2.5 text-sm outline-none transition ${
                  errors.end_date
                    ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                    : "border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                }`}
                disabled={submitting}
              />
              {errors.end_date && (
                <p className="mt-1 text-xs text-red-600">{errors.end_date}</p>
              )}
            </div>
          </div>

          {/* submit */}
          <button
            type="submit"
            disabled={!canSubmit}
            className={`flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium text-white transition ${
              canSubmit
                ? "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                : "cursor-not-allowed bg-blue-300"
            }`}
          >
            {submitting ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4A4 4 0 008 12H4z"
                  />
                </svg>
                Đang tạo…
              </>
            ) : (
              <>💾 Tạo Báo Cáo</>
            )}
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
}

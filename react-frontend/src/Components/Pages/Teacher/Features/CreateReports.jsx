import { useState, useEffect } from "react";
import axios from "../../../../config/axios";
import { getAuth } from "../../../Constants/INFO_USER";

export default function CreateReports() {
  const { user, token } = getAuth();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [reportName, setReportName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // 🔹 Lấy danh sách lớp giảng viên đang dạy
  useEffect(() => {
    axios
      .get(`/classes`)
      .then((res) => setClasses(res.data))
      .catch((err) => console.log(err));
  }, []);

  // 🔹 Gửi dữ liệu tạo báo cáo
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "/reports/create",
        {
          report_name: reportName,
          description,
          class_id: selectedClass,
          start_date: startDate,
          end_date: endDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert(res.data.message);
      // Reset form
      setReportName("");
      setDescription("");
      setSelectedClass("");
      setStartDate("");
      setEndDate("");
    } catch (err) {
      console.log(err);
      alert("❌ Lỗi khi tạo báo cáo!");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">📘 Tạo Báo Cáo Cho Lớp</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
        {/* Chọn lớp */}
        <div>
          <label className="block font-medium mb-1">Chọn lớp</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="border rounded w-full p-2"
            required
          >
            <option value="">-- Chọn lớp giảng dạy --</option>
            {classes.map((cls) => (
              <option key={cls.class_id} value={cls.class_id}>
                {cls.class_name}
              </option>
            ))}
          </select>
        </div>

        {/* Nhập thông tin báo cáo */}
        <div>
          <label className="block font-medium mb-1">Tên báo cáo</label>
          <input
            type="text"
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            className="border rounded w-full p-2"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Mô tả</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border rounded w-full p-2"
            placeholder="Nhập mô tả ngắn (tuỳ chọn)"
          ></textarea>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">Ngày bắt đầu</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border rounded w-full p-2"
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Ngày kết thúc</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded w-full p-2"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
        >
          💾 Tạo Báo Cáo
        </button>
      </form>
    </div>
  );
}

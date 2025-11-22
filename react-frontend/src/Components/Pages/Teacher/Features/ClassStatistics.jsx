import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../../../config/axios";
import { getRole } from "../../../Constants/INFO_USER";
import RouterBack from "../../../ReUse/Back/RouterBack";
import Navbar from "../../../ReUse/Navbar/Navbar";
import useRoleTeacher from "../../../ReUse/IsLogin/RoleTeacher";
import Footer from "../../Student/Home/Footer";

export default function ClassStatistics() {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // search + filter
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");

  // role
  const role = getRole();
  useRoleTeacher(role);

  // fetch reports
  useEffect(() => {
    axios
      .get(`/tvg/classes/${classId}/reports`)
      .then((res) => {
        setReports(res.data);
        console.log(res.data);
      })
      .catch((err) => console.log("❌ API error:", err))
      .finally(() => setLoading(false));
  }, [classId]);

  if (loading) return <p className="text-center mt-10">⏳ Đang tải...</p>;

  if (!reports.length)
    return (
      <>
        <Navbar />
        <div className="text-center mt-10">
          <p className="text-red-500">Không có báo cáo nào trong lớp này!</p>
          <RouterBack navigate={navigate} />
        </div>
        <Footer />
      </>
    );

  // filter list
  const filtered = reports.filter((r) => {
    const nameMatch =
      (r.report_name?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (r.description?.toLowerCase() || "").includes(search.toLowerCase());

    const statusMatch =
      statusFilter === "Tất cả" ? true : r.status === statusFilter;

    return nameMatch && statusMatch;
  });

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-8">
        <RouterBack navigate={navigate} />

        <h1 className="text-2xl font-bold text-blue-700 mb-3">
          📚 Danh sách báo cáo của lớp {classId}
        </h1>

        {/* Search + Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="🔍 Tìm theo tên báo cáo hoặc mô tả..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-2 rounded w-full md:w-1/2"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border p-2 rounded w-full md:w-1/4"
          >
            <option value="Tất cả">Tất cả</option>
            <option value="open">Mở</option>
            <option value="close">Đóng</option>
          </select>
        </div>

        {/* Table */}
        <table className="w-full border border-gray-200 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-center">#</th>
              <th className="border p-2">Tên báo cáo</th>
              <th className="border p-2">Mô tả</th>
              <th className="border p-2 text-center">Ngày bắt đầu</th>
              <th className="border p-2 text-center">Ngày kết thúc</th>
              <th className="border p-2 text-center">Trạng thái</th>
              <th className="border p-2 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={r.report_id} className="hover:bg-gray-50">
                <td className="border p-2 text-center">{i + 1}</td>
                <td className="border p-2">{r.report_name}</td>
                <td className="border p-2">{r.description || "---"}</td>
                <td className="border p-2 text-center">{r.start_date}</td>
                <td className="border p-2 text-center">{r.end_date}</td>

                <td
                  className={`border p-2 text-center font-semibold ${
                    r.status === "open"
                      ? "text-green-600 bg-green-50"
                      : "text-red-600 bg-red-50"
                  }`}
                >
                  {r.status}
                </td>

                <td className="border p-2 text-center">
                  <button
                    onClick={() =>
                      navigate("/nckh-show-group-teacher", {
                        state: {
                          class_id: r?.class_id,
                          report_id: r?.report_id,
                        },
                      })
                    }
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Xem nhóm
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Footer />
    </>
  );
}

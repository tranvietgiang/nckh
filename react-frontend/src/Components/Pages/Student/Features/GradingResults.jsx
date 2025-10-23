import React, { useEffect, useState } from "react";
import axios from "../../../../config/axios";
import { Eye, RefreshCw } from "lucide-react";

export default function ViewGradeResult() {
    const [results, setResults] = useState([]);
    const [selected, setSelected] = useState(null);
    const [error, setError] = useState("");
    const [selectedClass, setSelectedClass] = useState("");
    const [classes, setClasses] = useState([]);

    // 🔹 Lấy danh sách lớp
    const fetchClasses = async () => {
        try {
            const res = await axios.get("/student/classes");
            setClasses(res.data);
        } catch (err) {
            console.error("Lỗi tải danh sách lớp:", err);
        }
    };

    // 🔹 Lấy danh sách kết quả chấm điểm
    const fetchResults = async (className = "") => {
        try {
            const res = await axios.get("/student/grades", {
                params: className ? { class: className } : {},
            });
            setResults(res.data);
            setError("");
        } catch (err) {
            setResults([]);
            if (err.response?.status === 404)
                setError("Không tìm thấy kết quả chấm điểm.");
            else setError("Lỗi truy xuất dữ liệu, vui lòng thử lại sau.");
        }
    };

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        fetchResults(selectedClass);
    }, [selectedClass]);

    return (
        <div className="p-6">
            <div className="flex flex-wrap justify-between items-center mb-5 gap-3">
                <h1 className="text-2xl font-bold text-gray-800">📊 Kết quả chấm điểm</h1>

                <div className="flex items-center gap-3">
                    {/* 🔹 Dropdown lớp học */}
                    <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2"
                    >
                        <option value="">Tất cả lớp</option>
                        {classes.map((cls) => (
                            <option key={cls.class_id} value={cls.class_name}>
                                {cls.class_name} ({cls.semester} - {cls.academic_year})
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={() => fetchResults(selectedClass)}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        <RefreshCw size={18} /> Làm mới
                    </button>
                </div>
            </div>

            {/* Kết quả */}
            {error && (
                <div className="text-red-500 bg-red-50 border border-red-200 p-3 rounded-lg">
                    {error}
                </div>
            )}

            {!error && (
                <div className="overflow-x-auto bg-white rounded-xl shadow p-4">
                    <table className="min-w-full text-sm text-left border-collapse">
                        <thead className="bg-gray-100 text-gray-700">
                            <tr>
                                <th className="px-4 py-2 border">Tên báo cáo</th>
                                <th className="px-4 py-2 border">Lớp</th>
                                <th className="px-4 py-2 border">Ngày nộp</th>
                                <th className="px-4 py-2 border">Trạng thái</th>
                                <th className="px-4 py-2 border">Điểm</th>
                                <th className="px-4 py-2 border">Giảng viên</th>
                                <th className="px-4 py-2 border text-center">Xem</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(results) && results.length > 0 ? (
                                results.map((item) => (
                                    <tr key={item.report_id} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 border">{item.report_title}</td>
                                        <td className="px-4 py-2 border">{item.class_name || "-"}</td>
                                        <td className="px-4 py-2 border">
                                            {new Date(item.submission_date).toLocaleDateString("vi-VN")}
                                        </td>
                                        <td className="px-4 py-2 border">{item.status}</td>
                                        <td className="px-4 py-2 border font-semibold">
                                            {item.score ?? "-"}
                                        </td>
                                        <td className="px-4 py-2 border">{item.teacher_name || "-"}</td>
                                        <td className="px-4 py-2 border text-center">
                                            <button
                                                onClick={() => setSelected(item)}
                                                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-3 text-gray-500">
                                        {error || "Không có dữ liệu chấm điểm"}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {selected && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
                        <h2 className="text-xl font-bold mb-3 text-blue-700">
                            📝 Chi tiết kết quả
                        </h2>
                        <p><strong>Báo cáo:</strong> {selected.report_title}</p>
                        <p><strong>Lớp:</strong> {selected.class_name || "-"}</p>
                        <p>
                            <strong>Ngày nộp:</strong>{" "}
                            {new Date(selected.submission_date).toLocaleString("vi-VN")}
                        </p>
                        <p><strong>Điểm:</strong> {selected.score ?? "-"}</p>
                        <p><strong>Trạng thái:</strong> {selected.status}</p>
                        <p className="mt-2"><strong>Phản hồi:</strong></p>
                        <div className="bg-gray-100 p-2 rounded-md">
                            {selected.feedback || "Chưa có phản hồi"}
                        </div>
                        <p className="mt-2 text-sm text-gray-600">
                            <strong>Giảng viên chấm:</strong> {selected.teacher_name || "Chưa có"}
                        </p>
                        <div className="text-right mt-4">
                            <button
                                onClick={() => setSelected(null)}
                                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

import { useState, useEffect } from "react";
import axios from "../../../../config/axios";

export default function ManageMajors() {
  const [majors, setMajors] = useState([]);
  const [form, setForm] = useState({ major_name: "", major_abbreviate: "" });
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get("/majors").then((res) => setMajors(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/majors", form);
      setMessage(res.data.message);
      setMajors([...majors, res.data.major]);
      setForm({ major_name: "", major_abbreviate: "" });
    } catch (err) {
      setMessage("❌ Lỗi khi thêm ngành!");
    }
  };

  // ✅ Fix phần import Excel (reset input file & hiển thị tên)
  const handleImport = async (e) => {
    e.preventDefault();
    if (!file) return alert("❌ Vui lòng chọn file Excel trước!");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("/majors/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert(
        `${res.data.message}\n✅ Thành công: ${res.data.total_success}\n❌ Lỗi: ${res.data.total_failed}`
      );

      // ✅ Reset file input sau khi import (fix bug)
      setFile(null);
      document.getElementById("fileInput").value = "";

      // Cập nhật danh sách ngành
      axios.get("/majors").then((res) => setMajors(res.data));
    } catch (err) {
      alert("❌ Lỗi import file!");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🧩 Quản lý ngành học</h1>

      {message && <div className="mb-3 text-green-600">{message}</div>}

      {/* Form thêm ngành */}
      <form
        onSubmit={handleSubmit}
        className="space-y-3 bg-white p-5 rounded-lg shadow"
      >
        <h2 className="font-semibold mb-3">➕ Thêm ngành mới</h2>
        <input
          type="text"
          placeholder="Tên ngành"
          value={form.major_name}
          onChange={(e) =>
            setForm({ ...form, major_name: e.target.value })
          }
          className="border p-2 w-full rounded"
          required
        />
        <input
          type="text"
          placeholder="Viết tắt ngành (VD: CNTT)"
          value={form.major_abbreviate}
          onChange={(e) =>
            setForm({ ...form, major_abbreviate: e.target.value })
          }
          className="border p-2 w-full rounded"
          required
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Thêm ngành
        </button>
      </form>

      {/* Import Excel */}
      <form
        onSubmit={handleImport}
        className="space-y-3 mt-6 bg-white p-5 rounded-lg shadow"
      >
        <h2 className="font-semibold mb-3">📥 Import danh sách ngành (Excel)</h2>
        <input
          type="file"
          id="fileInput"
          accept=".xlsx,.xls"
          onChange={(e) => setFile(e.target.files[0])}
          className="border p-2 w-full rounded"
        />
        {file && (
          <p className="text-sm text-gray-600">
            📄 Đã chọn: <b>{file.name}</b>
          </p>
        )}
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Import Excel
        </button>
      </form>

      {/* Danh sách ngành */}
      <div className="mt-8 bg-white p-5 rounded-lg shadow">
        <h2 className="font-semibold mb-3">📋 Danh sách ngành</h2>
        <table className="min-w-full border border-gray-200 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">#</th>
              <th className="border p-2">Tên ngành</th>
              <th className="border p-2">Viết tắt</th>
            </tr>
          </thead>
          <tbody>
            {majors.map((m, i) => (
              <tr key={m.major_id}>
                <td className="border p-2 text-center">{i + 1}</td>
                <td className="border p-2">{m.major_name}</td>
                <td className="border p-2 text-center">
                  {m.major_abbreviate}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

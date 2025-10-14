import { useEffect, useState } from "react";
import axios from "../../../config/axios";

function ImportStudents() {
  const [file, setFile] = useState(null);
  const [students, setStudents] = useState([]);

  // Xử lý chọn file
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Upload và lấy danh sách
  const handleImport = async () => {
    if (!file) {
      alert("Vui lòng chọn file Excel trước!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Gửi file tới Laravel API
      await axios.post("/students/import", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Sau khi import xong thì lấy danh sách mới
      const res = await axios.get("/get-students");
      setStudents(res.data);

      alert("✅ Import thành công!");
    } catch (error) {
      console.error(error);
      alert("❌ Lỗi khi import file!");
    }
  };

  useEffect(() => {
    axios
      .get("/get-students")
      .then((res) => {
        setStudents(res.data);
      })
      .catch((e) => {
        console.log(e);
      });
  }, []);
  return (
    <div className="p-4">
      <h2>📥 Import danh sách sinh viên</h2>
      <input type="file" onChange={handleFileChange} accept=".xlsx,.xls,.csv" />
      <button onClick={handleImport}>Import</button>

      <table border="1" cellPadding="6" className="mt-4 bg-red-500">
        <thead>
          <tr>
            <th>Họ tên</th>
            <th>Email</th>
            <th>MSSV</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.email}</td>
              <td>{s.user_id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ImportStudents;

import { useEffect, useState } from "react";
import axios from "../../../config/axios";

function ImportStudents() {
  const [file, setFile] = useState(null);
  const [students, setStudents] = useState([]);
  const [totalStudent, setTotalStudent] = useState(0);
  const [loading, setLoading] = useState(false);

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

    setLoading(true);
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
      setStudents(res.list_student);
      setTotalStudent(res.total_student);

      const { success, failed, total, duplicates } = res.data;

      let dupText = "";
      if (duplicates && duplicates.length > 0) {
        dupText =
          "\n\n⚠️ Danh sách bị trùng:\n" +
          duplicates.map((d) => `- ${d.msv} (${d.ten})`).join("\n");
      }

      alert(
        `✅ Import hoàn tất!\n` +
          `Thành công: ${success}\n` +
          `Lỗi: ${failed}\n` +
          `Tổng SV: ${total}${dupText}`
      );
    } catch (error) {
      console.error(error);
      alert("❌ Lỗi khi import file!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    axios
      .get("/get-students")
      .then((res) => {
        setStudents(res.data.list_student);
        setTotalStudent(res.data.total_student);
      })
      .catch((e) => {
        console.log(e);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            📥 Import Danh Sách Sinh Viên
          </h1>
          <p className="text-gray-600">
            Tải lên file Excel để import danh sách sinh viên vào hệ thống
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn file Excel
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".xlsx,.xls,.csv"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {file && (
                <p className="mt-2 text-sm text-green-600">
                  ✅ Đã chọn: {file.name}
                </p>
              )}
            </div>

            <button
              onClick={handleImport}
              disabled={loading || !file}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang import...</span>
                </>
              ) : (
                <>
                  <span>📤</span>
                  <span>Import</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats */}
        {totalStudent > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <span className="text-green-600 text-lg">📊</span>
              <span className="text-green-800 font-semibold">
                Tổng số sinh viên: {totalStudent}
              </span>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              📋 Danh Sách Sinh Viên
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    MSSV
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Họ tên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày sinh
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students?.length > 0 ? (
                  students.map((s) => (
                    <tr key={s.user_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {s?.user_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {s?.fullname}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {s?.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {s?.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {s?.birthdate}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center">
                      <div className="text-gray-500 text-lg">
                        📭 Không có sinh viên nào
                      </div>
                      <p className="text-gray-400 text-sm mt-2">
                        Hãy import file Excel để thêm sinh viên
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImportStudents;

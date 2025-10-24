import { useState } from "react";

export default function MajorImportPage() {
  const [majors, setMajors] = useState([
    {
      major_id: 1,
      major_name: "Công nghệ thông tin",
      major_abbreviate: "CNTT",
      created_at: "2025-10-22 03:21:37",
      updated_at: "2025-10-22 03:21:37",
    },
  ]);

  const handleEdit = (majorId) => {
    console.log("Sửa ngành:", majorId);
    // Logic sửa ngành
  };

  const handleCopy = (major) => {
    console.log("Chép ngành:", major);
    // Logic copy ngành
    navigator.clipboard.writeText(JSON.stringify(major));
    alert("Đã copy thông tin ngành!");
  };

  const handleDelete = (majorId) => {
    if (window.confirm("Bạn có chắc muốn xóa ngành này?")) {
      console.log("Xóa ngành:", majorId);
      // Logic xóa ngành
      setMajors(majors.filter((major) => major.major_id !== majorId));
    }
  };

  const handleImport = () => {
    // Logic import file
    console.log("Import file ngành");
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Ngành</h1>
        <button
          onClick={handleImport}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
        >
          📁 Import Ngành
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                major_id
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                major_name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                major_abbreviate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                created_at
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                updated_at
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {majors.map((major) => (
              <tr key={major.major_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {major.major_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {major.major_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {major.major_abbreviate}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {major.created_at}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {major.updated_at}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleEdit(major.major_id)}
                    className="text-blue-600 hover:text-blue-900 transition duration-200"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleCopy(major)}
                    className="text-green-600 hover:text-green-900 transition duration-200"
                  >
                    Chép
                  </button>
                  <button
                    onClick={() => handleDelete(major.major_id)}
                    className="text-red-600 hover:text-red-900 transition duration-200"
                  >
                    Xóa bỏ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {majors.length === 0 && (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Không có ngành nào
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Bắt đầu bằng cách import file ngành.
          </p>
        </div>
      )}
    </div>
  );
}

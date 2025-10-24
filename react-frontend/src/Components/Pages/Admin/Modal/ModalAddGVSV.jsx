import React, { useState, useEffect } from "react";

export default function UserModal({ type, data, onClose }) {
  const [form, setForm] = useState({
    user_id: "",
    name: "",
    email: "",
    major: "",
    class: "",
    department: "",
    position: "",
  });

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    console.log("Dữ liệu gửi lên:", form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-5">
          <h2 className="text-xl font-bold mb-4 text-gray-800">
            {data ? "Chỉnh Sửa" : "Thêm"}{" "}
            {type === "student" ? "Sinh Viên" : "Giảng Viên"}
          </h2>

          <div className="space-y-3">
            <input
              name="user_id"
              placeholder="Mã người dùng"
              className="w-full border rounded-lg px-3 py-2"
              value={form.user_id}
              onChange={handleChange}
            />
            <input
              name="name"
              placeholder="Họ tên"
              className="w-full border rounded-lg px-3 py-2"
              value={form.name}
              onChange={handleChange}
            />
            <input
              name="email"
              placeholder="Email"
              className="w-full border rounded-lg px-3 py-2"
              value={form.email}
              onChange={handleChange}
            />

            {type === "student" ? (
              <>
                <input
                  name="major"
                  placeholder="Ngành học"
                  className="w-full border rounded-lg px-3 py-2"
                  value={form.major}
                  onChange={handleChange}
                />
                <input
                  name="class"
                  placeholder="Lớp"
                  className="w-full border rounded-lg px-3 py-2"
                  value={form.class}
                  onChange={handleChange}
                />
              </>
            ) : (
              <>
                <input
                  name="department"
                  placeholder="Khoa"
                  className="w-full border rounded-lg px-3 py-2"
                  value={form.department}
                  onChange={handleChange}
                />
                <input
                  name="position"
                  placeholder="Chức vụ"
                  className="w-full border rounded-lg px-3 py-2"
                  value={form.position}
                  onChange={handleChange}
                />
              </>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {data ? "Cập Nhật" : "Thêm Mới"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

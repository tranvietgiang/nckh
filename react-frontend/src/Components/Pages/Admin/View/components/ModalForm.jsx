import React, { useState } from "react";

export default function ModalForm({ closeModal, data, saveData }) {
  const [form, setForm] = useState(data || { name: "", email: "", user_id: "" });

  const handleSubmit = () => {
    saveData(form);
    closeModal();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h3 className="text-lg font-bold mb-4">{data ? "Sửa" : "Thêm"} người dùng</h3>
        <input
          name="user_id"
          value={form.user_id}
          onChange={(e) => setForm({ ...form, user_id: e.target.value })}
          placeholder="Mã người dùng"
          className="border p-2 w-full mb-3 rounded"
        />
        <input
          name="name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Họ tên"
          className="border p-2 w-full mb-3 rounded"
        />
        <input
          name="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="Email"
          className="border p-2 w-full mb-3 rounded"
        />
        <div className="flex justify-end space-x-3">
          <button onClick={closeModal} className="bg-gray-300 px-4 py-2 rounded">Hủy</button>
          <button onClick={handleSubmit} className="bg-indigo-600 text-white px-4 py-2 rounded">
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import axios from "../../config/axios";

export default function TestApi() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // ⚠️ Dùng đúng IP của máy ảo (Laravel)
    axios.get("/get-user")
      .then((res) => {
        setData(res.data);
       console.log(res.data)
      })
      .catch((err) => {
        setError("Không thể kết nối đến Laravel API");
      });
  }, []);

  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Kết quả từ Laravel API</h2>
      <p><b>Họ tên:</b> {data?.fullname}</p>
      <p><b>Email:</b> {data?.email}</p>
    </div>
  );
}

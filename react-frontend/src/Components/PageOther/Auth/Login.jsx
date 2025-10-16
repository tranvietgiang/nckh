import { useState, useEffect } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

// import axios from "../../../config/axios";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Đăng nhập";
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // const res = await axios.post("/auth/check-login", {
      //   username,
      //   password,
      // });

      // if (res.data.state === 200) {
      //   setLoading(false);
      //   navigate("/nckh-home");
      // } else {
      //   setLoading(false);
      //   alert("Sai tên đăng nhập hoặc mật khẩu!");
      // }

      setTimeout(() => {
        navigate("/nckh-home");
        setLoading(false);
      }, 3000);
    } catch (error) {
      setLoading(false);

      if (error.response) {
        // Nếu server trả lỗi (như 401)
        if (error.response.status === 401) {
          alert("Tài khoản hoặc mật khẩu không hợp lệ!");
        } else {
          console.error("Lỗi server:", error.response.data);
          alert("Có lỗi xảy ra trên máy chủ!");
        }
      } else {
        // Nếu không kết nối được tới server
        console.error("Không thể kết nối server:", error);
        alert("Không thể kết nối tới máy chủ!");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white shadow-md border rounded-xl p-10 w-[350px]"
      >
        <h2 className="text-center text-2xl font-bold mb-8">Đăng nhập</h2>

        {/* Tên đăng nhập */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Tên đăng nhập"
            value={username}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, ""); // chỉ cho nhập số
              setUsername(value);
            }}
            className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-400"
            maxLength={30}
          />
        </div>

        {/* Mật khẩu */}
        <div className="relative mb-6">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-400 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <Eye size={22} /> : <EyeOff size={22} />}
          </button>
        </div>

        {/* Nút đăng nhập */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Đang đăng nhập...
            </>
          ) : (
            "Đăng nhập"
          )}
        </button>
      </form>
    </div>
  );
}

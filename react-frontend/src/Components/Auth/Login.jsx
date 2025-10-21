import { useState, useEffect } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "../../config/axios";
import RouterHome from "../ReUse/Router/RouterHome";
import { getAuth } from "../Constants/INFO_USER";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false); // ✅ checkbox ghi nhớ
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { user, token } = getAuth();
  // Nếu đã đăng nhập thì chuyển hướng
  RouterHome(user, token);

  // 🟢 Khi load trang: tự động điền lại nếu trước đó có lưu thông tin
  useEffect(() => {
    document.title = "Đăng nhập";

    const savedUser = localStorage.getItem("savedUser");
    const savedPass = localStorage.getItem("savedPass");
    if (savedUser && savedPass) {
      setUsername(savedUser);
      setPassword(savedPass);
      setRemember(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("/auth/check-login", {
        username,
        password,
      });

      // ✅ Nếu đăng nhập thành công
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("token", res.data.token);

      // ✅ Nếu người dùng chọn "Ghi nhớ"
      if (remember) {
        localStorage.setItem("savedUser", username);
        localStorage.setItem("savedPass", password); // ⚠️ Có thể mã hóa nhẹ bằng btoa() nếu cần
      } else {
        localStorage.removeItem("savedUser");
        localStorage.removeItem("savedPass");
      }

      // ✅ Điều hướng
      const role = res.data.user.role;
      if (role === "student") navigate("/nckh-home");
      else if (role === "teacher") navigate("/nckh-teacher");
      else if (role === "admin") navigate("/nckh-admin");

      setLoading(false);
    } catch (error) {
      setLoading(false);
      if (error.response) {
        console.error("Lỗi server:", error.response.data);
        alert("Sai tài khoản hoặc mật khẩu!");
      } else {
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
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-400"
            maxLength={30}
          />
        </div>

        {/* Mật khẩu */}
        <div className="relative mb-3">
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

        {/* Checkbox ghi nhớ đăng nhập */}
        <div className="flex items-center mb-6">
          <input
            type="checkbox"
            id="remember"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="remember" className="text-gray-600">
            Ghi nhớ đăng nhập
          </label>
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

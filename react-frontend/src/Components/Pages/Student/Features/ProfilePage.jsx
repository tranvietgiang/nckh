import { useEffect, useState } from "react";
import Navbar from "../../../ReUse/Navbar/Navbar";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../Home/Footer";
import axios from "../../../../config/axios";
import { getAuth } from "../../../Constants/INFO_USER";
import IsLogin from "../../../ReUse/IsLogin/IsLogin";
import {
  getSafeJSON,
  setSafeJSON,
} from "../../../ReUse/LocalStorage/LocalStorageSafeJSON";

export default function ProfilePage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [getProfile, setProfile] = useState({});
  const { user, token } = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Hồ sơ";
  }, []);

  IsLogin(user, token);

  const role = user?.role ?? null;
  const user_id = user?.user_id ?? null;

  const fetchDataProfile = async () => {
    if (!user_id || !role) return;
    const data_user_profile = getSafeJSON("user_profiles");
    if (data_user_profile) {
      setProfile(data_user_profile);
    }

    try {
      const res = await axios.get("/profiles", {
        params: { role, user_id },
      });
      setProfile(res.data);
      console.log(res.data);
      setSafeJSON("user_profiles", JSON.stringify(res.data));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchDataProfile();
  }, []);

const handlePasswordChange = async (e) => {
  e.preventDefault();

  // Kiểm tra xác nhận mật khẩu mới
  if (newPassword !== confirmPassword) {
    alert("❌ Mật khẩu xác nhận không khớp!");
    return;
  }

  try {
    const res = await axios.post(
      "/change-password", // ✅ API đổi mật khẩu trong Laravel
      {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ Token Sanctum
        },
      }
    );

    alert("✅ " + res.data.message);

    // Reset form
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowPasswordForm(false);
  } catch (error) {
    console.log(error);
    const msg =
      error.response?.data?.message || "⚠️ Có lỗi xảy ra khi đổi mật khẩu!";
    alert(msg);
  }
};


  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="py-6 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              👤 Trang Cá Nhân
            </h1>
            <p className="text-gray-600">
              Quản lý thông tin và bảo mật tài khoản
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Thông tin cá nhân */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  📋 Thông Tin Cá Nhân
                </h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Họ và tên
                      </label>
                      <div className="p-2 bg-gray-50 rounded-lg border border-gray-200">
                        {getProfile?.fullname}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {role === "student" ? "Mã sinh viên" : "Mã Giảng viên"}
                      </label>
                      <div className="p-2 bg-gray-50 rounded-lg border border-gray-200">
                        {getProfile?.user_id}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {role === "student" ? "Ngành" : "Các ngành đang dạy"}
                      </label>
                      <div className="p-2 bg-gray-50 rounded-lg border border-gray-200">
                        {role === "student" ? (
                          <span>{getProfile?.major_name ?? "lỗi"}</span>
                        ) : getProfile?.major?.length > 0 ? (
                          getProfile.major.map((cls, index) => (
                            <p key={index} className="mb-1">
                              {cls}
                            </p>
                          ))
                        ) : (
                          <p>Lỗi</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {role === "student" ? "Lớp" : "Các lớp đang dạy"}
                      </label>
                      <div className="p-2 bg-gray-50 rounded-lg border border-gray-200">
                        {role === "student" ? (
                          <span>{getProfile?.class_name}</span>
                        ) : getProfile?.classes?.length > 0 ? (
                          getProfile.classes.map((cls, index) => (
                            <p key={index} className="mb-1">
                              {cls}
                            </p>
                          ))
                        ) : (
                          <p>Lỗi</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <div className="p-2 bg-gray-50 rounded-lg border border-gray-200">
                      {getProfile?.email}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số điện thoại
                      </label>
                      <div className="p-2 bg-gray-50 rounded-lg border border-gray-200">
                        {getProfile?.phone}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ngày sinh
                      </label>
                      <div className="p-2 bg-gray-50 rounded-lg border border-gray-200">
                        {getProfile?.birthdate}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trạng thái
                    </label>
                    <div className="p-2 bg-green-50 text-green-700 rounded-lg border border-green-200 inline-block">
                      ✅ {getProfile?.status}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bảo mật và Actions */}
            <div className="space-y-6">
              {/* Đổi mật khẩu */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  🔒 Bảo Mật
                </h2>

                {!showPasswordForm ? (
                  <button
                    onClick={() => setShowPasswordForm(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    🔑 Đổi Mật Khẩu
                  </button>
                ) : (
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mật khẩu hiện tại
                      </label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mật khẩu mới
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Xác nhận mật khẩu mới
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200"
                      >
                        💾 Lưu
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowPasswordForm(false)}
                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200"
                      >
                        ❌ Hủy
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Actions nhanh */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  ⚡ Hành Động
                </h2>

                <div className="space-y-3">
                  <button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center">
                    ✏️ Chỉnh sửa thông tin
                  </button>

                  <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center">
                    📧 Đổi email
                  </button>

                  <button
                    onClick={() => {
                      navigate("/nckh-login");
                      localStorage.removeItem("user");
                      localStorage.removeItem("token");
                    }}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center"
                  >
                    🚪 Đăng xuất
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

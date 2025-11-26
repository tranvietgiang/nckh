import { useEffect, useState } from "react";
import axios from "../../../../config/axios";
import { getRole } from "../../../Constants/INFO_USER";
import RoleStudent from "../../../ReUse/IsLogin/RoleStudent";

export default function ModelNotifications({ stateOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const role = getRole();
  if (role === "student") {
    RoleStudent(role);
  }
  useEffect(() => {
    if (role !== "student") return;
    axios
      .get("/tvg/get-notify")
      .then((res) => setNotifications(res.data.data))
      .catch((error) => {
        console.log(error);
        setNotifications([]);
      });
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const handleClose = () => onClose(false);

  const markAsRead = (id) => {
    console.log("Mark as read:", id);
  };

  if (!stateOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-3xl bg-white rounded-2xl shadow-2xl z-50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
          <h3 className="text-2xl font-bold text-gray-800 flex items-center">
            Thông báo
            {unreadCount > 0 && (
              <span className="ml-3 bg-red-500 text-white text-sm font-semibold rounded-full w-7 h-7 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-3xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Danh sách thông báo */}
        <div className="overflow-y-auto max-h-[70vh] bg-white">
          {notifications.length > 0 ? (
            notifications.map((noti) => (
              <div
                key={noti.notification_id}
                onClick={() => markAsRead(noti.notification_id)}
                className={`p-5 border-b border-gray-100 cursor-pointer transition-all duration-150 ${
                  !noti.isRead
                    ? "bg-blue-50 hover:bg-blue-100 border-l-4 border-l-blue-500"
                    : "hover:bg-gray-50"
                }`}
              >
                {/* Tiêu đề */}
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-lg font-semibold text-gray-800">
                    {noti.title}
                  </h4>
                  <span className="text-sm text-gray-500">
                    {new Date(noti.created_at).toLocaleString()}
                  </span>
                </div>

                {/* Giảng viên + lớp */}
                <div className="text-sm text-gray-600 mb-3">
                  <p>
                    <span className="font-semibold text-gray-700">
                      Giảng viên:
                    </span>{" "}
                    {noti?.teacher_name ?? ""}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-700">Lớp:</span>{" "}
                    {noti?.class_name ?? ""}
                  </p>
                </div>

                {/* Nội dung */}
                <p className="text-gray-700 text-base leading-relaxed">
                  {noti.content}
                </p>
              </div>
            ))
          ) : (
            <div className="p-16 text-center text-gray-500 text-lg">
              Không có thông báo nào
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-200 bg-gray-50 text-center">
          <button className="w-full text-blue-600 hover:text-blue-800 font-semibold py-2 text-base transition-colors duration-200">
            Xem tất cả thông báo
          </button>
        </div>
      </div>
    </>
  );
}

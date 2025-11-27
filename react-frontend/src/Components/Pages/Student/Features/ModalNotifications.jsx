import { useEffect, useState } from "react";
import axios from "../../../../config/axios";
import { getRole, getUser } from "../../../Constants/INFO_USER";
import RoleStudent from "../../../ReUse/IsLogin/RoleStudent";
import {
  getSafeJSON,
  setSafeJSON,
} from "../../../ReUse/LocalStorage/LocalStorageSafeJSON";

export default function ModelNotifications({ stateOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [displayCount, setDisplayCount] = useState(3);
  const [loading, setLoading] = useState(false);

  const role = getRole();
  const user = getUser();
  if (role === "student") {
    RoleStudent(role);
  }

  // localStorage.clear();
  useEffect(() => {
    if (role !== "student" || !user?.user_id) return;
    const cachedNotifications = getSafeJSON(
      `student_notifications_${user?.user_id}`,
      []
    );

    if (cachedNotifications !== null && cachedNotifications.length > 0) {
      setNotifications(cachedNotifications);
    }

    setLoading(true);
    axios
      .get("/tvg/get-notify")
      .then((res) => {
        setNotifications(res.data);
        if (JSON.stringify(cachedNotifications) !== JSON.stringify(res.data)) {
          setSafeJSON(`student_notifications_${user?.user_id}`, res.data);
        }
      })
      .catch((error) => {
        console.log(error);
        setNotifications([]);
      })
      .finally(() => setLoading(false));
  }, [user?.user_id]);

  const unreadCount = notifications.filter((noti) => !noti.isRead).length;
  const handleClose = () => {
    setDisplayCount(3); // Reset về 3 khi đóng modal
    onClose(false);
  };

  // Hiển thị thông báo theo số lượng hiện tại
  const displayedNotifications = notifications.slice(0, displayCount);
  // Kiểm tra xem còn thông báo nào không hiển thị không
  const hasMore = displayCount < notifications.length;

  // Load thêm 2 thông báo
  const loadMore = () => {
    setDisplayCount((prev) => prev + 2);
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
          {loading ? (
            <div className="p-16 text-center text-gray-500 text-lg">
              Đang tải thông báo...
            </div>
          ) : displayedNotifications.length > 0 ? (
            displayedNotifications.map((noti) => (
              <div
                key={noti.notification_id}
                className={`p-5 border-b border-gray-100 cursor-pointer transition-all duration-150 ${
                  !noti.isRead
                    ? "bg-blue-50 hover:bg-blue-100 border-l-4 border-l-blue-500"
                    : "hover:bg-gray-50"
                }`}
              >
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
                {/* Tiêu đề */}
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-lg font-semibold text-gray-800">
                    {noti.title}
                  </h4>
                  <span className="text-sm text-gray-500">
                    {new Date(noti.created_at).toLocaleString()}
                  </span>
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
          {hasMore ? (
            <button
              onClick={loadMore}
              className="w-full text-blue-600 hover:text-blue-800 font-semibold py-2 text-base transition-colors duration-200"
            >
              Xem thêm thông báo (+{notifications.length - displayCount})
            </button>
          ) : displayedNotifications.length > 0 ? (
            <button className="w-full text-gray-500 font-semibold py-2 text-base">
              Đã hiển thị tất cả thông báo
            </button>
          ) : null}
        </div>
      </div>
    </>
  );
}

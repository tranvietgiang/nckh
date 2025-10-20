import { useEffect, useState } from "react";
import axios from "../../../../config/axios";
import { getRole } from "../../../Constants/INFO_USER";
export default function ModelNotifications({ stateOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const role = getRole();

  useEffect(() => {
    if (role !== "student") return;

    axios
      .get("/get-notify")
      .then((res) => {
        setNotifications(res.data);
      })
      .catch((error) => {
        console.log(error);
        setNotifications([]);
      });
  }, []);

  const unreadCount = notifications.filter((noti) => !noti.isRead).length;

  const handleClose = () => {
    onClose(false);
  };

  const markAsRead = (id) => {
    console.log("Mark as read:", id);
  };

  if (!stateOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={handleClose}
      ></div>

      {/* Modal - TO hơn */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-4xl bg-white rounded-xl shadow-2xl z-50 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-white">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center">
              📢 Thông báo
              {unreadCount > 0 && (
                <span className="ml-3 bg-red-500 text-white text-sm rounded-full w-7 h-7 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto max-h-96">
          {notifications?.length > 0 ? (
            notifications?.map((notification) => (
              <div
                key={notification.id}
                className={`p-6 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                  !notification.isRead
                    ? "bg-blue-50 border-l-4 border-l-blue-500"
                    : ""
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex justify-between items-start mb-3">
                  <span
                    className={`px-3 py-1 rounded text-sm font-semibold ${
                      notification.isNew
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {notification.type}
                  </span>
                  <span className="text-sm text-gray-500">
                    {notification.time}
                  </span>
                </div>

                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                  {notification.title}
                </h4>

                <div className="text-base text-gray-600 mb-3">
                  <span className="font-medium">{notification.subject}</span>
                  <span className="mx-2">•</span>
                  <span>{notification.teacher}</span>
                </div>

                <p className="text-base text-gray-700 leading-relaxed">
                  {notification.content}
                </p>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-gray-500 text-lg">
              📭 Không có thông báo
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-white">
          <button className="w-full text-center text-blue-600 hover:text-blue-800 font-semibold py-3 text-lg">
            📋 Xem tất cả thông báo
          </button>
        </div>
      </div>
    </>
  );
}

import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../../../../config/axios";
import Navbar from "../../../ReUse/Navbar/Navbar";
import Footer from "../../Student/Home/Footer";
import RouterBack from "../../../ReUse/Back/RouterBack";
import { CiUser } from "react-icons/ci";
import { getAuth } from "../../../Constants/INFO_USER";
import useIsLogin from "../../../ReUse/IsLogin/IsLogin";

export default function ShowMemberGroup() {
  const { user, token } = getAuth();

  useIsLogin(user, token, "teacher");

  const navigate = useNavigate();
  const location = useLocation();

  const classId = location.state?.class_id;
  const reportId = location.state?.report_id;
  const rmCode = location.state?.rm_code;

  const [allGroups, setAllGroups] = useState([]);

  //  Tải danh sách nhóm cho thống kê + chọn nhóm

  useEffect(() => {
    if (!classId || !reportId) return;

    axios
      .get(`/tvg/reports/${reportId}/classes/${classId}/groups`)
      .then((res) => {
        setAllGroups(res.data);
        console.log("All groups:", res.data);
      })
      .catch((err) => console.error(err));
  }, [classId, reportId]);

  if (!rmCode) {
    return (
      <>
        <Navbar />
        <div className="max-w-4xl mx-auto p-6 mt-8 bg-white shadow-lg rounded-xl">
          <RouterBack navigate={navigate} />

          <h1 className="text-2xl font-bold text-blue-700 mb-4">
            Danh sách nhóm của báo cáo nhóm {}
          </h1>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {allGroups?.map((g) => (
              <div
                key={g.rm_code}
                className="cursor-pointer p-4 border rounded-lg hover:bg-gray-100 transition"
              >
                <p className="text-lg font-bold text-blue-700">
                  Nhóm {g.rm_code}
                </p>
                <p className="flex items-center">
                  <CiUser size={17} /> Thành viên: {g.total_members}
                </p>
                <p className="flex items-center">
                  {g.leader_name === null
                    ? "Chưa có NT"
                    : `${g?.leader_id} - ${g?.leader_name}`}
                </p>

                {/* 🔥 HIỂN THỊ TRẠNG THÁI */}
                <p className="mt-1 font-semibold">
                  {/* Đã nộp – chưa chấm */}
                  {g.status === "submitted" && (
                    <>
                      <span className="text-green-600">Đã nộp</span>
                      {g.grade === 0 ? (
                        <span className="ml-1 text-red-400">(Chưa chấm)</span>
                      ) : (
                        <span className="ml-1 text-green-400">
                          (Đã chấm - {g.grade})
                        </span>
                      )}
                    </>
                  )}

                  {/* Bị từ chối */}
                  {g.status === "rejected" && (
                    <span className="text-red-600">Bị từ chối</span>
                  )}

                  {/* Chưa nộp */}
                  {g.status === "not_submitted" && (
                    <span className="text-gray-600">Chưa nộp</span>
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>

        <Footer />
      </>
    );
  }
}

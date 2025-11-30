import { useEffect, useState } from "react";
// import formatDate from "../../../ReUse/FormDate/formatDate";
import {
  getSafeJSON,
  setSafeJSON,
} from "../../../ReUse/LocalStorage/LocalStorageSafeJSON";
import axios from "../../../../config/axios";
import { getAuth } from "../../../Constants/INFO_USER";
import useIsLogin from "../../../ReUse/IsLogin/IsLogin";
export default function ModalViewDetailGroups({
  statusOpen,
  onClose,
  rm_code,
  majorId,
  classId,
}) {
  const { user, token } = getAuth();
  useIsLogin(user, token, "teacher");

  const [getMemberOfGroup, setMemberOfGroup] = useState([]);
  const [loadingMember, setLoadingMember] = useState(false);

  const handleClose = () => {
    onClose(false);
  };

  useEffect(() => {
    if (!majorId || !classId || !rm_code) return;
    setLoadingMember(true);

    const data_member = getSafeJSON(`data_member_${rm_code}`);
    if (data_member) {
      setMemberOfGroup(data_member);
    }

    axios
      .get(
        `/get-members/majors/${majorId}/classes/${classId}/rm_code/${rm_code}`
      )
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setMemberOfGroup(list);
        setSafeJSON(`data_member_${rm_code}`, list);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => setLoadingMember(false));
  }, [rm_code, majorId, classId]);

  if (!statusOpen) return;
  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={handleClose}
      ></div>

      {/* Modal - TO hơn */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-4xl bg-white rounded-xl shadow-2xl z-50 max-h-[90vh] overflow-hidden">
        {loadingMember ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Đang tải ds...</span>
          </div>
        ) : getMemberOfGroup?.length <= 1 ? (
          <div className="text-center py-10 text-gray-500">
            Nhom nay chi co 1tv
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Hiển thị thông tin nhóm */}
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-800">
                Tên nhóm: {getMemberOfGroup[0]?.rm_name || "—"} — Số thành viên:{" "}
                {getMemberOfGroup[0]?.member_count || 0}
              </h2>
            </div>
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                    MSV
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                    Mã sinh viên
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                    Vai trò
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getMemberOfGroup?.map((g, idx) => {
                  const getRoleColor = (role) => {
                    switch (role) {
                      case "NT": // trưởng nhóm
                        return "text-green-600 font-semibold";
                      case "NP": // phó nhóm
                        return "text-blue-600 font-semibold";
                      default:
                        return "text-gray-900";
                    }
                  };
                  return (
                    <>
                      <tr
                        key={`${
                          g.rm_code || g.report_member_idx || "row"
                        }-${idx}`}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-3">{idx + 1}</td>
                        <td
                          className={`px-6 py-3 ${getRoleColor(
                            g?.report_m_role ?? null
                          )}`}
                        >
                          {g?.tv || "—"}
                        </td>
                        <td className="px-6 py-3">{g?.msv || "—"}</td>
                        <td className="px-6 py-3">{g?.report_m_role || "—"}</td>
                      </tr>
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

// export default function Footer() {
//   return (
//     <footer className="bg-[#01609a] w-full mt-10">
//       <div className="max-w-7xl mx-auto px-4 py-3">
//         <p className="text-center text-sm text-white">
//           © 2025 TRUONG CAO DANG CONG NGHE THU DUC
//         </p>
//         <p className="text-center text-xs text-white/70 mt-1">
//           Cập nhật lần cuối: {new Date().toLocaleDateString("vi-VN")}
//         </p>
//       </div>
//     </footer>
//   );
// }

import { useEffect, useState } from "react";

export default function Footer() {
  const [isFixed, setIsFixed] = useState(false);

  useEffect(() => {
    const checkHeight = () => {
      const bodyHeight = document.body.scrollHeight;
      const windowHeight = window.innerHeight;

      if (bodyHeight <= windowHeight) {
        setIsFixed(true);
      } else {
        setIsFixed(false);
      }
    };

    checkHeight();
    window.addEventListener("resize", checkHeight);

    return () => window.removeEventListener("resize", checkHeight);
  }, []);

  return (
    <footer
      className={`bg-[#01609a] w-full ${
        isFixed ? "fixed bottom-0 left-0" : ""
      }`}
    >
      <p className="m-[50px]"></p>
      <div className="max-w-7xl mx-auto px-4 py-3">
        <p className="text-center text-sm text-white">
          © 2025 TRUONG CAO DANG CONG NGHE THU DUC
        </p>
        <p className="text-center text-xs text-white/70 mt-1">
          Cập nhật lần cuối: {new Date().toLocaleDateString("vi-VN")}
        </p>
      </div>
    </footer>
  );
}

import { useEffect, useState } from "react";

export default function TopLoadingBar() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Ẩn sau 1.2 giây
    const timer = setTimeout(() => setShow(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-[3px] bg-transparent z-[9999] overflow-hidden">
      <div
        className="
          h-full w-1/3 bg-blue-500 rounded-r-full
          animate-[loading_1.2s_ease-in-out]
        "
        style={{
          "--tw-keyframes-loading":
            "{0%{transform:translateX(-100%);}100%{transform:translateX(100%);}}",
        }}
      />
    </div>
  );
}

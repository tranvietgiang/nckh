import { useEffect, useState } from "react";

export default function TopLoadingBar({ loading }) {
  const [width, setWidth] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (loading) {
      setVisible(true);

      // chạy CHẬM hơn (tăng 0.6% mỗi 50ms)
      const interval = setInterval(() => {
        setWidth((prev) => {
          if (prev < 80) return prev + 0.2; // tốc độ chậm
          return prev;
        });
      }, 50);

      return () => clearInterval(interval);
    } else {
      // khi load xong thì chạy nhanh tới 100%
      setWidth(100);

      setTimeout(() => {
        setVisible(false);
        setWidth(0);
      }, 400);
    }
  }, [loading]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-[3px] z-[9999] bg-transparent">
      <div
        className="h-full bg-blue-500 transition-all duration-200 rounded-r-full"
        style={{ width: `${width}%` }}
      ></div>
    </div>
  );
}

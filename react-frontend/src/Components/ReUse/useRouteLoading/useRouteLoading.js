import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function useRouteLoading() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Khi route thay đổi → loading ON
    setLoading(true);

    // Giả lập load route (200–400ms)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return loading;
}

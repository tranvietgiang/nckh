import { useState, useEffect } from "react";
import { IoIosArrowUp } from "react-icons/io";

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // Hiển thị nút khi scroll xuống
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Scroll lên đầu trang
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return (
    <div className="bg-white shadow">
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 z-50"
          aria-label="Lên đầu trang"
        >
          <IoIosArrowUp size={22} />
        </button>
      )}
    </div>
  );
}

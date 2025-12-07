export default function Footer() {
  return (
    // Dùng 'fixed' hoặc 'sticky'
    <footer className="bg-[#01609a] fixed bottom-0 w-full z-10">
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

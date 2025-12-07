export default function Footer() {
  return (
    <footer className="bg-[#01609a] relative after:pointer-events-none after:absolute after:inset-x-0 after:top-0 after:h-px after:bg-white/10">
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

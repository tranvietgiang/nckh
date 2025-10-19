export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 text-center py-3 text-sm">
      <p className="text-xs text-gray-500 text-center">
        Cập nhật lần cuối: {new Date().toLocaleDateString("vi-VN")}
      </p>
    </footer>
  );
}

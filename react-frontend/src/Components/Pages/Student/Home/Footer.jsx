export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 text-center py-3 text-sm fixed bottom-0 left-0 w-full">
      <p className="text-xs text-gray-500 text-center">
        TDC - {new Date().toLocaleDateString("vi-VN")}
      </p>
    </footer>
  );
}

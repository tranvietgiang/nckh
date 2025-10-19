export default function RouterBack({ navigate }) {
  return (
    <button
      onClick={() => navigate(-1)}
      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 mb-3 rounded-lg transition-colors duration-200 flex items-center space-x-2 m-2"
    >
      Quay lại
    </button>
  );
}

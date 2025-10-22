import { useNavigate } from "react-router-dom";
export default function ModalImport({ stateOpen, onClose }) {
  const navigate = useNavigate();

  if (!stateOpen) return null;

  const handleImportClass = () => {
    navigate("/nckh-import-class");
  };

  const handleImportGroup = () => {
    navigate("/nckh-import-group");
  };
  const handleClose = () => {
    onClose(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 w-80">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Import Dữ Liệu</h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="space-y-3">
            <button
              onClick={handleImportClass}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Import lớp
            </button>

            <button
              onClick={handleImportGroup}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition duration-200"
            >
              Import nhóm
            </button>
          </div>

          {/* Footer */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-1xl"
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

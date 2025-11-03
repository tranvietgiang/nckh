import { useState, useRef } from "react";

function DotLoading({ text = "Đang tải", color = "gray" }) {
  const dotColor =
    color === "white"
      ? "bg-white"
      : color === "blue"
      ? "bg-blue-500"
      : "bg-gray-500";

  return (
    <div className="inline-flex items-center space-x-2">
      <span>{text}</span>
      <div className="flex items-center space-x-1 ml-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={`${dotColor} w-2 h-2 rounded-full animate-pulse`}
            style={{ animationDelay: `${i * 0.2}s` }}
          ></span>
        ))}
      </div>
    </div>
  );
}

export default function ReportSubmissionModal({ isOpen, onClose, onSubmit }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0])
      setSelectedFile(e.dataTransfer.files[0]);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile || !onSubmit) return;

    setUploading(true);
    try {
      await onSubmit(selectedFile);
      console.log("✅ File submitted:", selectedFile);
      setSelectedFile(null);
      onClose();
    } catch (error) {
      if (error.response) {
        alert(error.response.data.message_error);
      }
      console.error("❌ Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setDragActive(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Nộp bài báo cáo</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition duration-200"
            disabled={uploading}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Upload Area */}
          <div className="mb-6">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <p className="text-gray-600 mb-2">Tải file lên</p>
              <p className="text-sm text-gray-500">Định dạng: PDF, DOCX, ZIP</p>
            </div>

            {/* Drag & Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer ${
                dragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
              } ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => !uploading && fileInputRef.current?.click()}
            >
              {uploading ? (
                <DotLoading text="Đang upload..." color="blue" />
              ) : (
                <>
                  <p className="text-gray-600 mb-4">
                    Kéo thả file vào đây
                    <br />
                    <span className="text-sm text-gray-500">hoặc</span>
                  </p>
                  <button
                    type="button"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200 inline-block"
                  >
                    Chọn file từ máy tính
                  </button>
                </>
              )}

              <input
                ref={fileInputRef}
                type="file"
                id="file-upload-modal"
                className="hidden"
                name="file"
                onChange={handleFileChange}
                accept=".pdf,.docx,.zip"
                disabled={uploading}
              />
            </div>
          </div>

          {/* Selected File Preview */}
          {selectedFile && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-900">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => !uploading && setSelectedFile(null)}
                  disabled={uploading}
                  className="text-red-500 hover:text-red-700 transition duration-200 disabled:opacity-50"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            disabled={uploading}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition duration-200 disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedFile || uploading}
            className={`px-6 py-2 rounded-lg font-medium transition duration-200 ${
              selectedFile && !uploading
                ? "bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {uploading ? (
              <DotLoading text="Đang nộp..." color="white" />
            ) : (
              "Nộp bài báo cáo"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

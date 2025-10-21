import React, { useState } from "react";

export default function ReportSubmissionModal({ isOpen, onClose, onSubmit }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false); // Thêm state uploading

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    // Thêm async
    e.preventDefault();
    if (!selectedFile || !onSubmit) return;

    setUploading(true); // Bắt đầu upload

    try {
      await onSubmit(selectedFile); // Đợi upload hoàn tất
      console.log("File submitted:", selectedFile);
      setSelectedFile(null);
      onClose(); // Chỉ đóng modal khi upload thành công
    } catch (error) {
      console.error("Upload failed:", error);
      // Có thể thêm thông báo lỗi ở đây
    } finally {
      setUploading(false); // Kết thúc upload
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
            disabled={uploading} // Vô hiệu hóa khi đang upload
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
          {/* Assignment Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">
              THÔNG TIN BÁO CÁO
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
              <div>
                <p>
                  <strong>Nhóm:</strong> Nhóm G
                </p>
                <p>
                  <strong>Báo cáo:</strong> Chuyên đề web 1
                </p>
                <p>
                  <strong>Lớp:</strong> Chuyên đề web 1
                </p>
              </div>
              <div>
                <p>
                  <strong>Thời gian:</strong> 01/12/2024 – 15/12/2024
                </p>
                <p>
                  <strong>Trạng thái:</strong>{" "}
                  <span className="text-orange-500">Chưa nộp</span>
                </p>
              </div>
            </div>
          </div>

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
              } ${uploading ? "opacity-50 cursor-not-allowed" : ""}`} // Giảm opacity khi uploading
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() =>
                !uploading &&
                document.getElementById("file-upload-modal").click()
              } // Chỉ cho click khi không uploading
            >
              <svg
                className="w-12 h-12 text-gray-400 mx-auto mb-4"
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

              <p className="text-gray-600 mb-4">
                {uploading ? "Đang upload..." : "Kéo thả file vào đây"}
                <br />
                {!uploading && (
                  <span className="text-sm text-gray-500">hoặc</span>
                )}
              </p>

              <input
                type="file"
                id="file-upload-modal"
                className="hidden"
                name="file"
                onChange={handleFileChange}
                accept=".pdf,.docx,.zip"
                disabled={uploading} // Vô hiệu hóa khi uploading
              />

              {!uploading && (
                <button
                  type="button"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200 inline-block"
                >
                  Chọn file từ máy tính
                </button>
              )}

              <p className="text-sm text-gray-500 mt-4">
                Định dạng: PDF, DOCX, ZIP
              </p>
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
                  onClick={() => !uploading && setSelectedFile(null)} // Chỉ cho xóa khi không uploading
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
            {uploading ? "Đang nộp..." : "Nộp bài báo cáo"}
          </button>
        </div>
      </div>
    </div>
  );
}

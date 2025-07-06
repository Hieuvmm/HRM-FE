"use client";

import { useState, useRef } from "react";
import { X, Link, Upload, ImageIcon } from "lucide-react";
import { uploadBanner, uploadTempImages } from "../../../apis/Editor.api.js";

export const ImageUploadModal = ({
  isOpen,
  onClose,
  onConfirm,
  sectionPosition,
}) => {
  const [uploadMethod, setUploadMethod] = useState("url");
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const resetForm = () => {
    setImageUrl("");
    setImageAlt("");
    setUploading(false);
    setUploadMethod("url");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (uploadMethod === "url" && imageUrl.trim()) {
      onConfirm([imageUrl.trim()], imageAlt || "Image");
      resetForm();
      onClose();
    }
  };

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn file hình ảnh!");
      return;
    }
    setUploading(true);
    try {
      let path;
      if (sectionPosition) {
        // Đang upload cho content: dùng uploadTempImages (API /upload-image)
        const res = await uploadTempImages([file]);
        // API trả về { urls: [...] }
        path = res?.urls?.[0] || res?.data?.urls?.[0];
      } else {
        // Đang upload cho banner
        const position = window.bannerImages?.length || 1;
        const res = await uploadBanner(file, file.name, position);
        path = res?.imageUrl || res?.data?.imageUrl || res;
      }
      if (!path || typeof path !== "string") {
        throw new Error("Không lấy được đường dẫn ảnh từ server!");
      }
      if (!path.startsWith("/")) path = `/${path}`;
      onConfirm([path], imageAlt || file.name);
      resetForm();
      onClose();
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload thất bại! " + (error?.message || ""));
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    handleFileUpload(e.target.files);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (
      e.type === "dragenter" ||
      e.type === "dragleave" ||
      e.type === "dragover"
    ) {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileUpload(e.dataTransfer.files);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-lg mx-4 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Thêm hình ảnh</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Method Selection */}
          <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setUploadMethod("url")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                uploadMethod === "url"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Link size={16} className="inline mr-2" />
              Nhập URL
            </button>
            <button
              type="button"
              onClick={() => setUploadMethod("upload")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                uploadMethod === "upload"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Upload size={16} className="inline mr-2" />
              Tải lên file
            </button>
          </div>

          {uploadMethod === "url" ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL hình ảnh <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  autoFocus
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả hình ảnh (tùy chọn)
                </label>
                <input
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="Mô tả ngắn gọn về hình ảnh"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Preview */}
              {imageUrl && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Xem trước:
                  </label>
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <img
                      src={imageUrl || "/placeholder.svg"}
                      alt="Preview"
                      className="max-w-full h-32 object-contain mx-auto rounded"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "block";
                      }}
                    />
                    <div
                      className="text-center text-gray-500 text-sm mt-2"
                      style={{ display: "none" }}
                    >
                      Không thể tải hình ảnh
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={!imageUrl.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Thêm hình ảnh
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {/* Drag & Drop Area */}
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  dragActive
                    ? "border-blue-400 bg-blue-50"
                    : "border-gray-300 bg-gray-50 hover:border-gray-400"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="space-y-3">
                  <div className="mx-auto w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <ImageIcon size={24} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">
                      Kéo thả hình ảnh vào đây hoặc{" "}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-blue-600 hover:text-blue-700 font-semibold"
                      >
                        chọn từ máy tính
                      </button>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Hỗ trợ PNG, JPG, JPEG (tối đa 10MB)
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả hình ảnh (tùy chọn)
                </label>
                <input
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="Mô tả ngắn gọn về hình ảnh"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? "Đang tải..." : "Chọn file"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

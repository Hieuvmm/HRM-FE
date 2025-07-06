import { Upload, Trash2, ImageIcon } from "lucide-react";

const BannerManager = ({
  bannerImages = [],
  editMode = false,
  fileInputRef,
  handleFileUpload,
  handleDeleteImage,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg mb-2 overflow-hidden shadow-sm">
      <button
        className="w-full px-5 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between hover:bg-gray-100 transition-colors"
        type="button"
        // Nút này sẽ được điều khiển expand/collapse từ ngoài
        // onClick={toggleSection("banner")}
      >
        <span className="font-medium text-gray-800">Quản lý Banner</span>
        {/* ChevronDown sẽ được truyền từ ngoài nếu cần */}
      </button>
      <div className="p-5">
        {editMode && (
          <>
            <div className="text-sm text-gray-600 mb-4">
              Tải lên hình ảnh banner <span className="text-red-500">*</span>
              <span className="text-xs text-gray-400 ml-2">
                (Tối đa 6 hình ảnh, định dạng PNG/JPEG)
              </span>
            </div>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 mb-6 hover:border-red-400 hover:bg-red-50 transition-colors cursor-pointer group"
            >
              <Upload
                size={32}
                className="mx-auto text-gray-400 group-hover:text-red-500 mb-3 transition-colors"
              />
              <div className="text-sm text-gray-600 mb-1">
                Kéo thả hình ảnh vào đây hoặc{" "}
                <span className="text-red-600 font-medium">
                  chọn từ máy tính
                </span>
              </div>
              <div className="text-xs text-gray-400">
                Hỗ trợ định dạng PNG, JPEG với kích thước tối đa 5MB
              </div>
            </div>
          </>
        )}
        <div className="grid grid-cols-2 gap-4">
          {bannerImages.map((image) => (
            <div
              key={image.id}
              className="relative border-2 border-dashed border-gray-200 rounded-xl p-6 bg-gray-50 flex flex-col items-center justify-center min-h-[120px] group hover:border-gray-300 transition-colors"
            >
              {editMode && (
                <button
                  onClick={() => handleDeleteImage(image.id)}
                  className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 transition-colors z-10 bg-white rounded-full shadow-sm hover:shadow-md"
                >
                  <Trash2 size={14} />
                </button>
              )}
              {image.url ? (
                <img
                  src={image.url || "/placeholder.svg"}
                  alt={image.name}
                  className="max-w-full max-h-16 object-contain mb-2 rounded"
                />
              ) : (
                <ImageIcon size={24} className="text-gray-400 mb-2" />
              )}
              <div className="text-sm text-gray-600 text-center">
                <div className="truncate max-w-full font-medium">
                  {image.name}
                </div>
                <div className="text-xs text-gray-400">{image.size}</div>
              </div>
            </div>
          ))}
        </div>
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default BannerManager;

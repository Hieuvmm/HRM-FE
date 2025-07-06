import { CustomQuillEditor } from "./CustomEditor";
import { Palette, ImageIcon, Trash2 } from "lucide-react";

const ContentSection = ({
  section,
  editMode,
  handleContentChange,
  handleOpenBadgeModal,
  renderBadge,
  openAddImageGalleryModal,
  handleRemoveImageUrl,
}) => {
  if (!section) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg mb-2 overflow-hidden shadow-sm">
      <button
        className="w-full px-5 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between hover:bg-gray-100 transition-colors"
        type="button"
        // Nút này sẽ được điều khiển expand/collapse từ ngoài
        // onClick={toggleSection(section.id)}
      >
        <span className="font-medium text-gray-800">{section.title}</span>
        {/* ChevronDown sẽ được truyền từ ngoài nếu cần */}
      </button>
      <div className="p-5">
        {editMode ? (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Tiêu đề Content
              </label>
              <button
                type="button"
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 px-2 py-1 rounded-md hover:bg-blue-50 transition-colors"
                onClick={() => handleOpenBadgeModal(section.id)}
                title="Chỉnh nhãn nổi bật"
              >
                <Palette size={12} />
                Chỉnh nhãn
              </button>
            </div>
            <input
              type="text"
              value={section.title}
              onChange={(e) =>
                handleContentChange(section.id, "title", e.target.value)
              }
              placeholder={`Nhập tiêu đề cho Content ${section.position}...`}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 font-medium"
            />
            {/* Badge Preview in Edit Mode */}
            {section.badge && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Xem trước nhãn:
                </label>
                <div className="p-3 bg-gray-50 rounded-lg border">
                  {renderBadge(section.badge)}
                </div>
              </div>
            )}
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Nội dung {section.title.toLowerCase()}
            </label>
            <CustomQuillEditor
              value={section.content}
              onChange={(val) =>
                handleContentChange(section.id, "content", val)
              }
              sectionId={section.id}
              openAddImageGalleryModal={openAddImageGalleryModal}
            />
            {section.imageUrls && section.imageUrls.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Hình ảnh đã thêm ({section.imageUrls.length})
                  </label>
                  <button
                    type="button"
                    onClick={() => openAddImageGalleryModal(section.id)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                  >
                    <ImageIcon size={14} />
                    Thêm ảnh
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {section.imageUrls.map((imageUrl, index) => (
                    <div
                      key={index}
                      className="relative group bg-gray-50 border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <img
                        src={
                          imageUrl.startsWith("http")
                            ? imageUrl
                            : `${process.env.VITE_URL_MINIO}${imageUrl}`
                        }
                        alt={`Content Image ${index + 1}`}
                        className="w-full h-20 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          className="bg-white rounded-full p-1.5 text-red-600 hover:bg-red-50 transition-colors"
                          onClick={() =>
                            handleRemoveImageUrl(section.id, imageUrl)
                          }
                          title="Xóa ảnh"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                        <p className="text-white text-xs truncate">
                          Image {index + 1}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Display badge in view mode */}
            {section.badge && (
              <div className="mb-3">{renderBadge(section.badge)}</div>
            )}
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              {section.title}
            </h4>
            <div dangerouslySetInnerHTML={{ __html: section.content }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentSection;

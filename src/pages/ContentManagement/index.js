"use client";

import { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  Edit,
  Save,
  X,
  Trash2,
  ImageIcon,
  Upload,
  Palette,
  Plus,
} from "lucide-react";
import {
  uploadBanner,
  deleteBanner,
  updateContent,
} from "../../apis/Editor.api.js";
import { useNavigate, useLocation } from "react-router-dom";

// Import all components
import { Toast } from "./components/Toast.js";
import { BadgeModal } from "./components/BadgeModal.js";
import { InputModal } from "./components/InputModal.js";
import { ConfirmModal } from "./components/ConfirmModal.js";
import { ImageUploadModal } from "./components/ImageUploadModal.js";
import { CustomQuillEditor } from "./components/CustomEditor.js";
import AppBreadcrumb from "../../components/Breadcrumbs/AppBreadcrumb";
import { Modal } from "./components/Modal.js";
import ContentSection from "./components/ContentSection.js";

// Import hooks
import { useToast } from "./hooks/useToast.js";
import { useContentData } from "./hooks/useContentData.js";

export default function ContentManagement() {
  // State management
  const [editMode, setEditMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteImageId, setDeleteImageId] = useState(null);
  const fileInputRef = useRef(null);
  const [expandedSections, setExpandedSections] = useState({
    banner: true,
    content1: false,
    content2: false,
    content3: false,
  });
  const [showAddImageUrlModal, setShowAddImageUrlModal] = useState(false);
  const [currentContentIdToAddImage, setCurrentContentIdToAddImage] =
    useState(null);
  const [badgeModal, setBadgeModal] = useState({
    open: false,
    sectionId: null,
    currentBadge: null,
  });
  const [showAddImageModal, setShowAddImageModal] = useState(false);
  const [currentSectionIdToAddImage, setCurrentSectionIdToAddImage] =
    useState(null);
  const [showAddContentModal, setShowAddContentModal] = useState(false);
  const [newContent, setNewContent] = useState(null);
  const [addBadgeModal, setAddBadgeModal] = useState({
    open: false,
    sectionId: null,
    currentBadge: null,
  });
  const [addImageModal, setAddImageModal] = useState(false);
  const [addSectionIdToAddImage, setAddSectionIdToAddImage] = useState(null);

  // Custom hooks
  const { showToast, toastMessage, toastType, showToastMessage, setShowToast } =
    useToast();
  const {
    bannerImages,
    setBannerImages,
    contentSections,
    setContentSections,
    loading,
    fetchData,
  } = useContentData();
  const navigate = useNavigate();
  const location = useLocation();

  // Helper functions
  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleOpenAddImageUrlModal = (sectionId) => {
    setCurrentContentIdToAddImage(sectionId);
    setShowAddImageUrlModal(true);
  };

  const openAddImageGalleryModal = (sectionId) => {
    setCurrentSectionIdToAddImage(sectionId);
    setShowAddImageModal(true);
  };

  const handleRemoveImageUrl = (sectionId, imageUrlToRemove) => {
    setContentSections((prevSections) =>
      prevSections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              imageUrls: section.imageUrls.filter(
                (url) => url !== imageUrlToRemove
              ),
            }
          : section
      )
    );
    showToastMessage("Đã xóa hình ảnh khỏi thư viện.", "success");
  };

  // Upload banner (tối đa 6)
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);

    if (bannerImages.length + files.length > 6) {
      showToastMessage(
        "Chỉ được phép tải lên tối đa 6 hình ảnh banner!",
        "warning"
      );
      event.target.value = "";
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (const file of files) {
      try {
        await uploadBanner(file, file.name, bannerImages.length + 1);
        successCount++;
      } catch (e) {
        errorCount++;
        console.error(`Error uploading ${file.name}:`, e);
      }
    }

    if (successCount > 0) {
      showToastMessage(
        `Đã tải lên thành công ${successCount} hình ảnh!`,
        "success"
      );
    }

    if (errorCount > 0) {
      showToastMessage(
        `Có ${errorCount} hình ảnh tải lên thất bại. Vui lòng thử lại!`,
        "error"
      );
    }

    event.target.value = "";
    fetchData();
  };

  // Xóa banner với confirmation
  const handleDeleteImage = (imageId) => {
    setDeleteImageId(imageId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteImage = async () => {
    try {
      await deleteBanner([deleteImageId]);
      showToastMessage("Hình ảnh đã được xóa thành công!", "success");
      fetchData();
    } catch (e) {
      showToastMessage("Không thể xóa hình ảnh. Vui lòng thử lại!", "error");
      console.error("Error deleting image:", e);
    }
    setDeleteImageId(null);
  };

  // Cập nhật nội dung content
  const handleContentChange = (sectionId, field, value) => {
    setContentSections((prev) =>
      prev.map((section) =>
        section.id === sectionId ? { ...section, [field]: value } : section
      )
    );
  };

  // Lưu content (gọi API updateContent)
  const handleSave = async () => {
    try {
      for (const section of contentSections) {
        await updateContent({
          id: section.id,
          title: section.title,
          body: section.content,
          imageUrls: section.imageUrls,
          date: new Date().toISOString().slice(0, 10),
          position: section.position,
          type: section.type || undefined,
          badge:
            typeof section.badge === "object"
              ? JSON.stringify(section.badge)
              : section.badge,
        });
      }
      setEditMode(false);
      showToastMessage("Tất cả nội dung đã được lưu thành công!", "success");
      fetchData();
    } catch (e) {
      showToastMessage("Có lỗi khi lưu nội dung!", "error");
    }
  };

  const handleAddImageUrl = (url, sectionId) => {
    if (!sectionId) return;
    let path = url;
    const minioPrefix = process.env.VITE_URL_MINIO;
    if (minioPrefix && url.startsWith(minioPrefix)) {
      path = url.replace(minioPrefix, "");
    }
    if (path.startsWith("blob:")) return;
    setContentSections((prevSections) =>
      prevSections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              imageUrls: [
                ...(Array.isArray(section.imageUrls)
                  ? section.imageUrls
                  : section.imageUrls
                  ? [section.imageUrls]
                  : []),
                path,
              ],
            }
          : section
      )
    );
    showToastMessage("Đã thêm URL hình ảnh vào content.", "success");
    setCurrentSectionIdToAddImage(null);
  };

  // Enhanced badge handling functions
  const handleOpenBadgeModal = (sectionId) => {
    const section = contentSections.find((s) => s.id === sectionId);
    setBadgeModal({
      open: true,
      sectionId: sectionId,
      currentBadge: section?.badge || null,
    });
  };

  const handleBadgeConfirm = (badgeData) => {
    setContentSections((prev) =>
      prev.map((section) =>
        section.id === badgeModal.sectionId
          ? {
              ...section,
              badge: badgeData ? JSON.stringify(badgeData) : null,
            }
          : section
      )
    );

    if (badgeData) {
      showToastMessage("Nhãn đã được cập nhật thành công!", "success");
    } else {
      showToastMessage("Nhãn đã được xóa!", "info");
    }

    setBadgeModal({ open: false, sectionId: null, currentBadge: null });
  };

  // Function to render badge in display mode
  const renderBadge = (badge) => {
    if (!badge) return null;
    let obj = badge;
    if (typeof obj === "string" && obj.trim().startsWith("{")) {
      try {
        obj = JSON.parse(obj);
      } catch {
        obj = badge;
      }
    }
    if (typeof obj === "object" && obj.text) {
      return (
        <span
          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium shadow-sm"
          style={{
            backgroundColor: (obj.color || "#3b82f6") + "20",
            color: obj.color || "#3b82f6",
            border: `1px solid ${obj.color || "#3b82f6"}40`,
          }}
        >
          <span
            className="w-2 h-2 rounded-full mr-2"
            style={{ backgroundColor: obj.color || "#3b82f6" }}
          />
          {obj.text}
        </span>
      );
    }
    return (
      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
        {badge}
      </span>
    );
  };
  const openAddContentModal = () => {
    setNewContent({
      id: `content${Date.now()}`,
      title: "",
      content: "",
      imageUrls: [],
      badge: "",
      position: (contentSections?.length || 0) + 1,
    });
    setShowAddContentModal(true);
  };

  // Hiển thị toast nếu có state từ trang trước
  useEffect(() => {
    if (location.state && location.state.toast) {
      showToastMessage(
        location.state.toast.message,
        location.state.toast.type || "success"
      );
      // Xóa state để toast không lặp lại khi F5
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Toast Notification */}
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Xác nhận xóa hình ảnh"
        message="Bạn có chắc chắn muốn xóa hình ảnh này? Hành động này không thể hoàn tác."
        onConfirm={confirmDeleteImage}
        type="danger"
      />

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex justify-between items-center mb-4">
          <AppBreadcrumb />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Quản lý nội dung
          </h1>

          <div className="flex items-center gap-3">
            {editMode ? (
              <>
                <button
                  onClick={() => setEditMode(false)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  <X size={16} />
                  Hủy bỏ
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={16} />
                  {loading ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate("/content-management/add")}
                  className="flex items-center gap-2 px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
                >
                  <Plus size={16} />
                  Thêm mới Content
                </button>
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm font-medium"
                >
                  <Edit size={16} />
                  Chỉnh sửa nội dung
                </button>
              </>
            )}
          </div>
        </div>

        {/* Banner Section */}
        <div className="bg-white border border-gray-200 rounded-lg mb-2 overflow-hidden shadow-sm">
          <button
            onClick={() => toggleSection("banner")}
            className="w-full px-5 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between hover:bg-gray-100 transition-colors"
          >
            <span className="font-medium text-gray-800">Quản lý Banner</span>
            <ChevronDown
              size={16}
              className={`text-gray-500 transition-transform ${
                expandedSections.banner ? "rotate-180" : ""
              }`}
            />
          </button>
          {expandedSections.banner && (
            <div className="p-5">
              {editMode && (
                <>
                  <div className="text-sm text-gray-600 mb-4">
                    Tải lên hình ảnh banner{" "}
                    <span className="text-red-500">*</span>
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
            </div>
          )}
        </div>

        {/* Content Sections */}
        {contentSections.map((section) => (
          <div
            key={section.id}
            className="bg-white border border-gray-200 rounded-lg mb-2 overflow-hidden shadow-sm"
          >
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full px-5 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between hover:bg-gray-100 transition-colors"
            >
              <span className="font-medium text-gray-800">{section.title}</span>
              <ChevronDown
                size={16}
                className={`text-gray-500 transition-transform ${
                  expandedSections[section.id] ? "rotate-180" : ""
                }`}
              />
            </button>
            {expandedSections[section.id] && (
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

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Xem trước nhãn:
                      </label>
                      <div className="flex items-center justify-center min-h-[48px] bg-gray-50 rounded-xl border shadow-sm p-4">
                        {section.badge ? (
                          renderBadge(section.badge)
                        ) : (
                          <span className="text-gray-400 italic text-sm">
                            Chưa chọn nhãn nổi bật
                          </span>
                        )}
                      </div>
                    </div>

                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Nội dung {section.title.toLowerCase()}
                    </label>

                    {/* Use our custom editor component that matches the Figma design */}
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
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Xem trước nhãn:
                      </label>
                      <div className="flex items-center justify-center min-h-[48px] bg-gray-50 rounded-xl border shadow-sm p-4">
                        {section.badge ? (
                          renderBadge(section.badge)
                        ) : (
                          <span className="text-gray-400 italic text-sm">
                            Chưa chọn nhãn nổi bật
                          </span>
                        )}
                      </div>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      {section.title}
                    </h4>
                    <div
                      dangerouslySetInnerHTML={{ __html: section.content }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Input Modal for Image URL */}
        <InputModal
          isOpen={showAddImageUrlModal}
          onClose={() => {
            setShowAddImageUrlModal(false);
            setCurrentContentIdToAddImage(null);
          }}
          title="Thêm hình ảnh vào Content"
          placeholder="Nhập URL hình ảnh"
          onConfirm={handleAddImageUrl}
        />

        {/* Enhanced Badge Modal */}
        <BadgeModal
          isOpen={badgeModal.open}
          onClose={() =>
            setBadgeModal({ open: false, sectionId: null, currentBadge: null })
          }
          onConfirm={handleBadgeConfirm}
          currentBadge={badgeModal.currentBadge}
        />

        {/* Enhanced Image Gallery Modal */}
        {showAddImageModal && (
          <ImageUploadModal
            isOpen={showAddImageModal}
            onClose={() => {
              setShowAddImageModal(false);
              setCurrentSectionIdToAddImage(null);
            }}
            onConfirm={(url, alt) => {
              handleAddImageUrl(url, currentSectionIdToAddImage);
              setShowAddImageModal(false);
              setCurrentSectionIdToAddImage(null);
            }}
            sectionPosition={currentSectionIdToAddImage}
          />
        )}

        <Modal
          isOpen={showAddContentModal}
          onClose={() => setShowAddContentModal(false)}
          title="Thêm mới Content"
        >
          {newContent && (
            <ContentSection
              section={newContent}
              editMode={true}
              handleContentChange={(id, field, value) =>
                setNewContent((prev) => ({ ...prev, [field]: value }))
              }
              handleOpenBadgeModal={(sectionId) =>
                setAddBadgeModal({
                  open: true,
                  sectionId,
                  currentBadge: newContent.badge,
                })
              }
              renderBadge={renderBadge}
              openAddImageGalleryModal={(sectionId) => {
                setAddSectionIdToAddImage(sectionId);
                setAddImageModal(true);
              }}
              handleRemoveImageUrl={(id, url) =>
                setNewContent((prev) => ({
                  ...prev,
                  imageUrls: prev.imageUrls.filter((img) => img !== url),
                }))
              }
            />
          )}
          {/* Badge modal cho thêm mới */}
          <BadgeModal
            isOpen={addBadgeModal.open}
            onClose={() =>
              setAddBadgeModal({
                open: false,
                sectionId: null,
                currentBadge: null,
              })
            }
            currentBadge={addBadgeModal.currentBadge}
            onConfirm={(badgeData) => {
              setNewContent((prev) => ({ ...prev, badge: badgeData }));
              setAddBadgeModal({
                open: false,
                sectionId: null,
                currentBadge: null,
              });
            }}
          />
          {/* Modal thêm ảnh cho thêm mới */}
          <ImageUploadModal
            isOpen={addImageModal}
            onClose={() => setAddImageModal(false)}
            onConfirm={(urls) => {
              setNewContent((prev) => ({
                ...prev,
                imageUrls: [...(prev.imageUrls || []), ...urls],
              }));
              setAddImageModal(false);
            }}
          />
          <div className="flex justify-end mt-4 gap-2">
            <button
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              onClick={() => setShowAddContentModal(false)}
            >
              Hủy
            </button>
            <button
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              onClick={() => setShowAddContentModal(false)}
            >
              Lưu
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
}

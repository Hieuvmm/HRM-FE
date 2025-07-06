import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { updateContent, getContents } from "../../apis/Editor.api.js";
import ContentSection from "./components/ContentSection.js";
import { BadgeModal } from "./components/BadgeModal.js";
import { ImageUploadModal } from "./components/ImageUploadModal.js";
import { Toast } from "./components/Toast.js";
import { useToast } from "./hooks/useToast.js";

export default function AddContent() {
  const nav = useNavigate();
  const [newContent, setNewContent] = useState(null);
  const [addBadgeModal, setAddBadgeModal] = useState({
    open: false,
    sectionId: null,
    currentBadge: null,
  });
  const [addImageModal, setAddImageModal] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const { showToastMessage } = useToast();

  // Lấy danh sách content hiện tại từ API, tính position mới
  useEffect(() => {
    async function fetchContentList() {
      try {
        const res = await getContents();
        const sections = res?.data || [];
        const maxPosition =
          sections.length > 0
            ? Math.max(...sections.map((s) => s.position || 0))
            : 0;
        setNewContent({
          id: `content${Date.now()}`,
          title: "",
          content: "",
          imageUrls: [],
          badge: "",
          position: maxPosition + 1,
        });
      } catch {
        setNewContent({
          id: `content${Date.now()}`,
          title: "",
          content: "",
          imageUrls: [],
          badge: "",
          position: 1,
        });
      }
    }
    fetchContentList();
  }, []);

  const handleAddContent = async () => {
    try {
      const payload = {
        title: newContent.title,
        body: newContent.content,
        imageUrls: newContent.imageUrls,
        position: newContent.position,
        date: new Date().toISOString().slice(0, 10),
        type: newContent.type || undefined,
        badge:
          typeof newContent.badge === "object"
            ? JSON.stringify(newContent.badge)
            : newContent.badge,
      };
      await updateContent(payload);
      showToastMessage("Đã thêm mới content thành công!", "success");
      setTimeout(
        () =>
          nav("/content-management", {
            state: {
              toast: {
                message: "Đã thêm mới content thành công!",
                type: "success",
              },
            },
          }),
        800
      );
    } catch (e) {
      setToast({
        show: true,
        message: "Có lỗi khi thêm content!",
        type: "error",
      });
    }
  };

  if (!newContent) return null;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6">Thêm mới Content</h2>
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
        renderBadge={(badge) => {
          if (!badge) return null;
          let obj = badge;
          if (typeof badge === "string" && badge.trim().startsWith("{")) {
            try {
              obj = JSON.parse(badge);
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
        }}
        openAddImageGalleryModal={() => setAddImageModal(newContent.position)}
        handleRemoveImageUrl={(id, url) =>
          setNewContent((prev) => ({
            ...prev,
            imageUrls: prev.imageUrls.filter((img) => img !== url),
          }))
        }
      />
      <BadgeModal
        isOpen={addBadgeModal.open}
        onClose={() =>
          setAddBadgeModal({ open: false, sectionId: null, currentBadge: null })
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
      <ImageUploadModal
        isOpen={!!addImageModal}
        onClose={() => setAddImageModal(false)}
        sectionPosition={addImageModal}
        onConfirm={(urls) => {
          setNewContent((prev) => ({
            ...prev,
            imageUrls: [...(prev.imageUrls || []), ...urls],
          }));
          setAddImageModal(false);
        }}
      />
      <div className="flex justify-end mt-6 gap-2">
        <button
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
          onClick={() => nav("/content-management")}
        >
          Hủy
        </button>
        <button
          className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
          onClick={handleAddContent}
        >
          Lưu
        </button>
      </div>
    </div>
  );
}

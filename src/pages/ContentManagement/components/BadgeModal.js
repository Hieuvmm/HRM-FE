"use client";

import { useState, useEffect } from "react";
import { X, Palette, Eye } from "lucide-react";

export const BadgeModal = ({
  isOpen,
  onClose,
  onConfirm,
  currentBadge = null,
}) => {
  const [badgeText, setBadgeText] = useState("");
  const [badgeColor, setBadgeColor] = useState("#3b82f6");
  const [showPreview, setShowPreview] = useState(false);

  // Predefined color options
  const colorPresets = [
    { name: "Xanh dương", value: "#3b82f6" },
    { name: "Xanh lá", value: "#10b981" },
    { name: "Đỏ", value: "#ef4444" },
    { name: "Vàng", value: "#f59e0b" },
    { name: "Tím", value: "#8b5cf6" },
    { name: "Hồng", value: "#ec4899" },
    { name: "Cam", value: "#f97316" },
    { name: "Xám", value: "#6b7280" },
    { name: "Xanh cyan", value: "#06b6d4" },
    { name: "Xanh lime", value: "#84cc16" },
    { name: "Đỏ rose", value: "#f43f5e" },
    { name: "Tím indigo", value: "#6366f1" },
  ];

  // Badge style presets
  const stylePresets = [
    { name: "Mới", color: "#10b981" },
    { name: "Nổi bật", color: "#f59e0b" },
    { name: "Khuyến mãi", color: "#ef4444" },
    { name: "Đặc biệt", color: "#8b5cf6" },
    { name: "Phổ biến", color: "#3b82f6" },
    { name: "Giới hạn", color: "#f97316" },
  ];

  useEffect(() => {
    if (isOpen) {
      if (currentBadge) {
        try {
          const badge =
            typeof currentBadge === "string"
              ? JSON.parse(currentBadge)
              : currentBadge;
          setBadgeText(badge.text || "");
          setBadgeColor(badge.color || "#3b82f6");
        } catch (error) {
          console.error("Error parsing badge:", error);
          setBadgeText("");
          setBadgeColor("#3b82f6");
        }
      } else {
        setBadgeText("");
        setBadgeColor("#3b82f6");
      }
      setShowPreview(false);
    }
  }, [isOpen, currentBadge]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (badgeText.trim()) {
      onConfirm({
        text: badgeText.trim(),
        color: badgeColor,
      });
      onClose();
    }
  };

  const handlePresetClick = (preset) => {
    setBadgeText(preset.name);
    setBadgeColor(preset.color);
  };

  const handleColorPresetClick = (color) => {
    setBadgeColor(color);
  };

  const renderBadgePreview = () => (
    <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
      {badgeText ? (
        <span
          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium shadow-sm"
          style={{
            backgroundColor: badgeColor + "20",
            color: badgeColor,
            border: `1px solid ${badgeColor}40`,
          }}
        >
          <span
            className="w-2 h-2 rounded-full mr-2"
            style={{ backgroundColor: badgeColor }}
          />
          {badgeText}
        </span>
      ) : (
        <span className="text-gray-400 text-sm">
          Nhập nội dung để xem trước
        </span>
      )}
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 w-full sm:max-w-xl md:max-w-2xl max-h-screen overflow-y-auto mx-4 p-0 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Palette size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Chỉnh sửa nhãn nổi bật
              </h3>
              <p className="text-sm text-gray-500">
                Tạo nhãn để làm nổi bật nội dung
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Badge Text Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Nội dung nhãn <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
                placeholder="Ví dụ: Mới, Nổi bật, Khuyến mãi..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                autoFocus
                maxLength={20}
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-500">Tối đa 20 ký tự</p>
                <span className="text-xs text-gray-400">
                  {badgeText.length}/20
                </span>
              </div>
            </div>

            {/* Style Presets */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Mẫu có sẵn
              </label>
              <div className="grid grid-cols-3 gap-2">
                {stylePresets.map((preset, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handlePresetClick(preset)}
                    className="p-2 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors text-left"
                  >
                    <span
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: preset.color + "20",
                        color: preset.color,
                        border: `1px solid ${preset.color}40`,
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full mr-1"
                        style={{ backgroundColor: preset.color }}
                      />
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Màu sắc nhãn
              </label>

              {/* Custom Color Picker */}
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={badgeColor}
                    onChange={(e) => setBadgeColor(e.target.value)}
                    className="w-12 h-12 border-2 border-gray-300 rounded-lg cursor-pointer"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Tùy chỉnh
                    </p>
                    <p className="text-xs text-gray-500 font-mono">
                      {badgeColor}
                    </p>
                  </div>
                </div>
                <input
                  type="text"
                  value={badgeColor}
                  onChange={(e) => setBadgeColor(e.target.value)}
                  placeholder="#3b82f6"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                />
              </div>

              {/* Color Presets */}
              <div className="grid grid-cols-6 gap-2">
                {colorPresets.map((color, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleColorPresetClick(color.value)}
                    className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 ${
                      badgeColor === color.value
                        ? "border-gray-800 ring-2 ring-blue-500"
                        : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Preview Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Xem trước
                </label>
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Eye size={14} />
                  {showPreview ? "Ẩn" : "Hiện"} xem trước
                </button>
              </div>

              {showPreview && (
                <div className="space-y-3">
                  {/* Preview in different contexts */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">
                      Trong danh sách tin tức:
                    </p>
                    <div className="bg-white p-3 rounded border">
                      <div className="flex items-center gap-2 mb-1">
                        {renderBadgePreview()}
                        <span className="text-sm text-gray-500">27/5/2024</span>
                      </div>
                      <h4 className="font-medium text-gray-900">
                        Tiêu đề tin tức mẫu
                      </h4>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">
                      Trong nội dung:
                    </p>
                    <div className="bg-white p-3 rounded border">
                      {renderBadgePreview()}
                      <h4 className="font-medium text-gray-900 mt-2">
                        Nội dung chính
                      </h4>
                    </div>
                  </div>
                </div>
              )}

              {!showPreview && renderBadgePreview()}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  setBadgeText("");
                  setBadgeColor("#3b82f6");
                  onConfirm(null); // Remove badge
                  onClose();
                }}
                className="px-4 py-2 text-red-600 hover:text-red-700 transition-colors font-medium"
              >
                Xóa nhãn
              </button>
              <button
                type="submit"
                disabled={!badgeText.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Lưu nhãn
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

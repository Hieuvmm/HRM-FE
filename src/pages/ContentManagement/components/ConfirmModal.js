"use client";

import { Modal } from "./Modal.js";

export const ConfirmModal = ({
  isOpen,
  onClose,
  title,
  message,
  onConfirm,
  type = "danger",
}) => {
  const getButtonConfig = () => {
    switch (type) {
      case "danger":
        return {
          confirmClass: "bg-red-600 hover:bg-red-700 text-white",
          confirmText: "Xóa",
        };
      case "warning":
        return {
          confirmClass: "bg-amber-600 hover:bg-amber-700 text-white",
          confirmText: "Xác nhận",
        };
      default:
        return {
          confirmClass: "bg-red-600 hover:bg-red-700 text-white",
          confirmText: "Xác nhận",
        };
    }
  };

  const config = getButtonConfig();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <p className="text-gray-600 leading-relaxed">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-6 py-2 rounded-lg transition-colors font-medium ${config.confirmClass}`}
          >
            {config.confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

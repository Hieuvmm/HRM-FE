"use client";

import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

export const Toast = ({ message, type = "success", isVisible, onClose }) => {
  if (!isVisible) return null;

  const getToastConfig = () => {
    switch (type) {
      case "success":
        return {
          icon: CheckCircle,
          bgColor: "bg-emerald-50/95",
          borderColor: "border-emerald-200",
          textColor: "text-emerald-800",
          iconColor: "text-emerald-600",
        };
      case "error":
        return {
          icon: AlertCircle,
          bgColor: "bg-red-50/95",
          borderColor: "border-red-200",
          textColor: "text-red-800",
          iconColor: "text-red-600",
        };
      case "warning":
        return {
          icon: AlertTriangle,
          bgColor: "bg-amber-50/95",
          borderColor: "border-amber-200",
          textColor: "text-amber-800",
          iconColor: "text-amber-600",
        };
      case "info":
        return {
          icon: Info,
          bgColor: "bg-blue-50/95",
          borderColor: "border-blue-200",
          textColor: "text-blue-800",
          iconColor: "text-blue-600",
        };
      default:
        return {
          icon: CheckCircle,
          bgColor: "bg-emerald-50/95",
          borderColor: "border-emerald-200",
          textColor: "text-emerald-800",
          iconColor: "text-emerald-600",
        };
    }
  };

  const config = getToastConfig();
  const IconComponent = config.icon;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
      <div
        className={`
        flex items-center gap-3 px-6 py-4 rounded-xl shadow-lg border backdrop-blur-sm
        ${config.bgColor} ${config.borderColor} ${config.textColor}
        min-w-[320px] max-w-[480px]
      `}
      >
        <IconComponent size={20} className={config.iconColor} />
        <span className="font-medium flex-1">{message}</span>
        <button
          onClick={onClose}
          className="ml-2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-white/50"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

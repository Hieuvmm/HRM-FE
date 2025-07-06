import React, {useEffect, useState} from "react";
import {AiOutlineClose} from "react-icons/ai";

function AppModal({isOpen, onClose, children, title, className, action}) {
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShowModal(true);
        } else {
            setTimeout(() => setShowModal(false), 200);
        }
    }, [isOpen]);

    if (!showModal) return null;

    return (
        <div className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50
            transition-opacity duration-200 ${isOpen ? "opacity-100" : "opacity-0"}`}
        >
            <div className={`${className} bg-white rounded-lg shadow-lg w-96 p-4 relative max-h-[85vh] flex flex-col
                transform transition-transform duration-200 ${isOpen ? "scale-100" : "scale-90 opacity-0"}`}
            >
                <div className="flex items-center mb-1">
                    <span className="text-xl font-bold">{title}</span>
                    {onClose && <AiOutlineClose
                        onClick={onClose}
                        size={17}
                        className="ml-auto cursor-pointer"
                    />}
                </div>
                <div className="overflow-y-auto flex-grow max-h-[80vh]">
                    {children}
                </div>
                <div>{action}</div>
            </div>
        </div>
    );
}

export default AppModal;

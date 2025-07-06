import React, {useEffect, useState} from "react";
import {AiOutlineClose} from "react-icons/ai";

function AppModalForm({isOpen, onClose, children, title, className, action}) {
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShowModal(true);
        } else {
            setTimeout(() => setShowModal(false), 200); // Đợi 200ms rồi ẩn hẳn
        }
    }, [isOpen]);

    if (!showModal) return null;

    return (
        <div className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50
            transition-opacity duration-200 ${isOpen ? "opacity-100" : "opacity-0"}`}
        >
            <div className={`${className} bg-white rounded-lg shadow-lg w-96 p-4 relative max-h-[85vh] flex flex-col min-w-[35%]
                transform transition-transform duration-200 ${isOpen ? "scale-100" : "scale-90 opacity-0"}`}
            >
                <div className="flex items-center mb-1">
                    <span className="text-xl font-bold">{title}</span>
                    <AiOutlineClose
                        onClick={onClose}
                        size={17}
                        className="ml-auto cursor-pointer"
                    />
                </div>
                <div className="bg-red-700 h-[2px] w-full mb-5"/>
                <div className="mt-2 overflow-y-auto flex-grow pr-2 max-h-[80vh]">
                    {children}
                </div>
                <div>{action}</div>
            </div>
        </div>
    );
}

export default AppModalForm;

import React from "react";
import {FiUpload, FiX} from "react-icons/fi";

export const AppUploadImage = (props) => {
    const handleFileChange = (event) => {
        const files = Array.from(event.target.files); // Lấy danh sách file
        if (files.length > 0) {
            const fileUrls = files.map((file) => URL.createObjectURL(file)); // Tạo URL tạm
            props?.onChange(files, fileUrls);
        }
    };
    const handleRemoveImage = (e, index) => {
        e.preventDefault();
        if (!props?.path || !props?.files) return;

        const newPaths = [...props.path];
        const newFiles = [...props.files]; // Danh sách file ảnh

        newPaths.splice(index, 1); // Xóa URL khỏi danh sách
        newFiles.splice(index, 1); // Xóa file khỏi danh sách

        props?.onChange(newFiles, newPaths); // Cập nhật danh sách mới
    };
    return (
        <>
            <div className="flex items-center w-full">
                {props?.type === "multi" ? (

                    <div>
                        <div className={"flex"}>
                            {
                                props?.path?.length > 0 && props?.path?.map((item, index) => (
                                    <div
                                        key={index}
                                        title="Click để chọn ảnh"
                                        className="relative group mr-2  p-1 border-[1px] border-red-300 rounded-[4px] w-[80px] h-[80px] cursor-pointer overflow-hidden"
                                    >
                                        <img src={item} alt="..." className="w-full h-full object-cover"/>

                                        <button
                                            className="absolute top-1 right-1 bg-gray-800 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveImage(e, index);
                                            }}
                                        >
                                            <FiX size={14}/>
                                        </button>
                                    </div>
                                ))
                            }
                        </div>
                        <label htmlFor="fileInput" className="w-full flex flex-wrap gap-2">
                            <div
                                className={`mt-3 border-[1px] border-red-700 rounded-[4px] p-1 text-red-700 w-[150px] flex items-center justify-center cursor-pointer ${props?.className}`}
                            >
                                <FiUpload size={20} className="mr-2"/>
                                <div>Thêm ảnh</div>
                            </div>

                        </label>
                    </div>
                ) : (
                    <label htmlFor="fileInput" className="w-full">
                        {props?.path ? (
                            <div
                                title={"Click để chọn ảnh"}
                                className="p-1 border-[1px] border-red-300 rounded-[4px] w-[100px] h-[100px] cursor-pointer overflow-hidden"
                            >
                                <img src={props?.path} alt="..." className="w-full h-full object-cover"/>
                            </div>
                        ) : (
                            <div
                                className={`border-[1px] border-red-700 rounded-[4px] p-1 text-red-700 w-[200px] flex items-center justify-center cursor-pointer ${props?.className}`}
                            >
                                <FiUpload size={20} className="mr-2"/>
                                <div>Đính kèm ảnh</div>
                            </div>
                        )}
                    </label>
                )}
            </div>

            {!props?.disabled && (
                <input
                    style={{display: "none"}}
                    type="file"
                    onChange={handleFileChange}
                    id="fileInput"
                    multiple={props?.type === "multi"} // Cho phép chọn nhiều file nếu là "multi"
                />
            )}
        </>
    );
};

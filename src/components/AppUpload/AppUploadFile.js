import React from 'react'
import {FiUpload} from "react-icons/fi";

export const AppUploadFile = (props) => {

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        props?.onChange(file);
    };
    return (
        <>
            <div className="flex items-center">
                <label htmlFor="fileInput">
                    <div
                        className={`border-[1px] border-red-700 rounded-[4px] p-1 text-red-700 w-[200px] flex items-center justify-center cursor-pointer ${props?.className}}`}>
                        <FiUpload size={20} className="mr-2"/>
                        <div> {props?.title ? props?.title : "ĐÍNH KÈM FILE"}</div>
                    </div>
                </label>
                <div className="ml-5">{props?.name}</div>
            </div>
            <input style={{display: 'none'}} type="file" onChange={handleFileChange} id="fileInput"/>
        </>
    )
}


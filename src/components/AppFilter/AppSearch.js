import React, {useState} from 'react'
import {TbListSearch} from "react-icons/tb";

function AppSearch({
                       className,
                       onChange,
                       value,
                       disabled,
                       readonly,
                       label,
                       required,
                       error,
                       type,
                       min,
                       show,
                       contentStatus,
                       placeholder
                   }) {


    const [isFilterOpen, setIsFilterOpen] = useState(false); // State to toggle filter dropdown

    const toggleFilter = () => {
        setIsFilterOpen(!isFilterOpen);
    };
    return (
        <React.Fragment>
            {show !== false ? (
                <div>
                    <div className={"mb-1"}>
                        <label htmlFor={label} className={"text-[14px] text-gray-700 "}>
                            {label}
                            <span className={"text-red-600"}>{required ? " *" : null}</span>
                        </label>
                    </div>
                    <div
                        className={`${className} ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"} pl-2 border-b-[1px] border-b-gray-500 border-[0.5px] border-stone-100 focus-within:border-b-red-700 h-[40px] grid grid-cols-[90%_10%] w-1/4`}
                    >

                        <input
                            id={label}
                            placeholder={error ? error : placeholder}
                            className={`${disabled ? "bg-gray-100 cursor-not-allowed text-gray-500" : null} ${error ? "placeholder-red-400" : null}  rounded-none focus:outline-none focus:border-none h-full`}
                            value={value}
                            onChange={onChange}
                            readOnly={readonly}
                            disabled={disabled}
                            type={type}
                            min={min}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault(); // Chặn submit form khi nhấn Enter
                                }
                            }}
                        />
                        <div
                            className={"relative flex items-center justify-center border-l border-l-gray-600 cursor-pointer"}
                            onClick={toggleFilter}>
                            <TbListSearch
                                size={25}
                                className={"text-red-700"}
                            />
                            {isFilterOpen && (
                                <div
                                    className="absolute top-10 bg-white border border-gray-300 rounded-md shadow-md w-48 z-10 p-3">
                                    {contentStatus}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : null}

        </React.Fragment>
    )
}

export default AppSearch;

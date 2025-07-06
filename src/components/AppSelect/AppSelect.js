import React, {useEffect, useRef, useState} from 'react'
import {AiFillCaretDown} from "react-icons/ai";
import {ImCheckmark2} from "react-icons/im";
import {IoIosSearch} from "react-icons/io";

function AppSelect({
                       className,
                       onChange,
                       value,
                       disabled,
                       label,
                       required,
                       error,
                       options,
                       type
                   }) {

    const [isShown, setIsShown] = useState(false);
    const [valueInput, setValueInput] = useState("");
    const getLabel = (value) => {
        if (type === "multi") {
            return options
                ?.filter((item) => value?.includes(item.value))
                ?.map((item) => item.label)
                ?.join(", ");
        } else {
            return options?.find((item) => item.value === value)?.label;
        }
    }
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsShown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    const removeDiacritics = (str) => {
        return str
            .normalize("NFD") // Tách dấu
            .replace(/[\u0300-\u036f]/g, "") // Xóa dấu
            .toLowerCase(); // Chuyển thành chữ thường
    };

    const hasDiacritics = (str) => {
        return str !== removeDiacritics(str); // Nếu có dấu thì khác với bản không dấu
    };

    const handleFilterData = (searchText) => {
        if (!searchText) return options; // Trả về tất cả nếu không có searchText

        return options?.filter((item) => {
            const itemLabel = item.label;
            if (hasDiacritics(searchText)) {
                // Nếu searchText có dấu, tìm kiếm trực tiếp
                return itemLabel.toLowerCase().includes(searchText.toLowerCase());
            } else {
                // Nếu searchText không dấu, loại bỏ dấu của cả hai
                return removeDiacritics(itemLabel).includes(removeDiacritics(searchText));
            }
        });
    };
    const handleSelect = (itemNew) => {
        if (type === "multi") {
            const checkExist = value?.find((itemOld) => itemOld === itemNew)
            let newData;
            if (checkExist) {
                newData = value?.filter((itemOld) => itemOld !== itemNew)
            } else {
                if (value) {
                    newData = [...value, itemNew];
                } else {
                    newData = [itemNew]
                }
            }
            onChange(newData)

        } else {
            onChange(itemNew)
            setIsShown(false)
        }

    }
    return (
        <div ref={dropdownRef} className={`${className}`}>
            {label && <div className={"mb-1"}>
                <label htmlFor={label} className={"text-[14px] text-gray-700"}>
                    {label}
                    <span className={"text-red-600"}>{required ? " *" : null}</span>
                </label>
            </div>}
            <div
                className={`${disabled ? "bg-gray-100" : "bg-white"} grid grid-cols-[90%_10%] pl-2 border-b-[1px] border-b-gray-500 border-[0.5px] border-stone-100 w-full focus-within:border-b-red-700 relative  h-[40px]`}
                onClick={() => {
                    setIsShown(!isShown)
                    document.getElementById(label)?.focus()
                }}
            >
                <input
                    id={label}
                    placeholder={error ? error : getLabel(value)}
                    className={`w-full truncate rounded-none focus:outline-none focus:border-none  ${error ? "placeholder:text-red-400 placeholder:text-[12px]" : (isShown ? "placeholder:text-gray-400" : "placeholder:text-black")} h-full`}
                    onChange={(e) => setValueInput(e.target.value)}
                />
                <div className={"ml-auto mr-2 flex items-center"}>
                    {isShown ? <IoIosSearch/> :
                        <AiFillCaretDown/>}
                </div>
                {isShown ? (
                    <div
                        className={`absolute z-50 border-[0.5px] border-gray-300 bg-white top-12 w-full drop-shadow-xl transition-all duration-300 ease-in-out transform ${
                            isShown ? "opacity-100 scale-100" : "opacity-0 scale-95"
                        }`}
                    >
                        {handleFilterData(valueInput)?.length > 0 ? (
                            handleFilterData(valueInput)?.map((item, index) => (
                                <div key={index} onClick={(e) => {
                                    e.stopPropagation()
                                    handleSelect(item.value)
                                }}
                                     className={"items-center flex p-1 hover:bg-red-700 hover:text-white cursor-pointer"}
                                >
                                    <
                                        div>{item.label}</div>
                                    {value?.includes(item?.value) && <ImCheckmark2 className={"ml-auto"}/>}

                                </div>
                            ))
                        ) : (
                            <div className={"flex justify-center py-[10%]"}>Không có dữ liệu</div>
                        )}
                    </div>
                ) : null}
            </div>
        </div>
    )
}

export default AppSelect;

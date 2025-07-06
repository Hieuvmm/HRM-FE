import React from 'react'

function AppInput({className, onChange, value, disabled, readonly, label, required, error, type, min, show}) {


    return (
        <React.Fragment>
            {show !== false ? (
                <div>
                    {label && <div className={"mb-1"}>
                        <label htmlFor={label} className={"text-[14px] text-gray-700 "}>
                            {label}
                            <span className={"text-red-600"}>{required ? " *" : null}</span>
                        </label>
                    </div>}

                    <div
                        className={`${className} ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"} pl-2 border-b-[1px] border-b-gray-500 border-[0.5px] border-stone-100 focus-within:border-b-red-700 h-[40px]`}
                        onClick={() => document.getElementById(label)?.focus()}
                    >

                        <input
                            id={label}
                            placeholder={error ? error : null}
                            className={`${disabled ? "bg-gray-100 cursor-not-allowed text-gray-500" : null} placeholder-red-400 placeholder:text-[12px] rounded-none focus:outline-none focus:border-none h-full`}
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
                    </div>
                </div>
            ) : null}

        </React.Fragment>
    )
}

export default AppInput;

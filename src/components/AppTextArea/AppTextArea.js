import React from 'react'

function AppTextArea({className, onChange, value, disabled, readonly, label, required, error}) {


    return (
        <React.Fragment>
            <div className={className}>
                <div className={"mb-1"}>
                    <label htmlFor={label} className={"text-[14px] text-gray-700"}>
                        {label}
                        <span className={"text-red-600"}>{required ? " *" : null}</span>
                    </label>
                </div>
                <div
                    className={` ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"} pl-2 border-b-[1px] border-b-gray-500 border-[0.5px] border-stone-100 focus-within:border-b-red-700 h-[70px]`}
                    onClick={() => document.getElementById(label)?.focus()}
                >
                    <textarea
                        id={label}
                        placeholder={error ? error : null}
                        className={`w-full ${
                            disabled ? "bg-gray-100 cursor-not-allowed text-gray-500" : null
                        } rounded-none focus:outline-none focus:border-none resize-none placeholder-red-400 placeholder:text-[12px] h-[95%]`}
                        value={value}
                        onChange={onChange}
                        readOnly={readonly}
                        disabled={disabled}
                    />
                </div>
            </div>
        </React.Fragment>
    )
}

export default AppTextArea;

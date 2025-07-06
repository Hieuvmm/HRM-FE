import React from 'react';

function AppDatePicker({
                           className,
                           onChange,
                           value,
                           disabled,
                           readonly,
                           label,
                           required,
                           error,
                           show
                       }) {
    return (
        <React.Fragment>
            {show !== false ? (
                <div>
                    <div className="mb-2">
                        <label htmlFor={label} className="text-[14px] text-gray-700">
                            {label}
                            <span className="text-red-600">{required ? " *" : null}</span>
                        </label>
                    </div>
                    <div
                        className={`${className} ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"} pl-2 border-b-[1px] border-b-gray-500 border-[0.5px] border-stone-100 focus-within:border-b-red-700 h-[40px]`}
                        onClick={() => document.getElementById(label)?.focus()}
                    >
                        <input
                            id={label}
                            type="date"
                            placeholder={error ? error : null}
                            className={`${disabled ? "bg-gray-100 cursor-not-allowed text-gray-500" : "text-gray-700"} placeholder-red-400 placeholder:text-[12px] rounded-none focus:outline-none focus:border-none h-full w-full`}
                            value={value}
                            onChange={onChange}
                            readOnly={readonly}
                            disabled={disabled}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                }
                            }}

                        />
                    </div>
                </div>
            ) : null}
        </React.Fragment>
    );
}

export default AppDatePicker;
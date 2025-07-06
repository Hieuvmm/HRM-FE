import React from "react";

function AppRadio({checked, onChange, children, className, name}) {
    return (
        <label className="inline-flex items-center gap-2 cursor-pointer w-fit">
            <input
                type="radio"
                className={`accent-red-600 w-3 h-3 ${className}`}
                checked={checked}
                onChange={onChange}
                name={name}
            />
            {children}
        </label>
    );
}

export default AppRadio;

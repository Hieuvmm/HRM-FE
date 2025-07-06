import React from "react";

function AppCheckBox({checked, onChange, label, className}) {

    return (
        <label className="inline-flex items-center gap-2 cursor-pointer w-fit">
            <input
                type="checkbox"
                className={`rounded-none accent-red-600 w-3.5 h-3.5 ${className}`}
                checked={checked}
                onChange={onChange}
            />
            {label}
        </label>
    );
}

export default AppCheckBox;

import React from 'react'

function AppFormPage({title, children}) {

    return (
        <React.Fragment>
            <div className="p-3 border-[1px] border-gray-200 rounded-md mb-5">
                <div className={"h-[35px] bg-gray-200 flex items-center pl-3 text-16 font-bold mb-3"}>{title}</div>
                {children}
            </div>
        </React.Fragment>
    )
}

export default AppFormPage;

import React from 'react'
import {GrFormPrevious} from "react-icons/gr";
import {useNavigate} from "react-router-dom";

function AppFormPage({title, redirect, children, className, action}) {
    const nav = useNavigate()

    return (
        <React.Fragment>
            <div className={"bg-white h-full"}>
                <div className={"flex items-center mb-3 h-[50px] border-b-red-700 border-b-[1px]"}>
                    {redirect ? <GrFormPrevious className={"pointer text-red-700"} size={30}
                                                onClick={() => nav(redirect)}/> : null}

                    <span className={`text-lg font-bold text-red-700 ${redirect ? null : "ml-5"}`}> {title}</span>
                    <div className={"flex ml-auto mr-10"}>
                        {action}
                    </div>
                </div>
                <div className={`pl-4 pr-4 ${className}`}>{children}</div>
            </div>
        </React.Fragment>
    )
}

export default AppFormPage;

import React from 'react'

// import {IoSaveOutline} from "react-icons/io5";


function AppSaveButton(props) {
    return (
        <button
            className={`flex bg-red-700 text-white rounded animate-jump-in hover-slide h-8 items-center justify-center ${props.className}`}
            onClick={props.onClick} title={props.title} disabled={props.disabled}>
            {props.title}
        </button>

    )
}

export default AppSaveButton;

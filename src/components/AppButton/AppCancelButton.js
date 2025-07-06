import React from 'react'
// import './style.scss'


// import {IoMdClose} from "react-icons/io";

function AppCancelButton(props) {
    return (
        <button
            className={`flex bg-gray-200 text-gray-600 rounded animate-jump-in hover-slide h-8 items-center justify-center ${props.className}`}
            onClick={props.onClick} title={props.title}>
            {props.title}
            {/*<IoMdClose size={20}*/}
            {/*           color={"#ffffff"}*/}
            {/*           style={{marginLeft: 5}}/>*/}
        </button>

    )
}

export default AppCancelButton;

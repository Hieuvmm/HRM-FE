import React, {memo} from 'react';
import './style.scss';
import {useLoadingStore} from "../../store/storeLoading";

const AppLoading = ({show}) => {
    const loadingStore = useLoadingStore(state => state.loading);

    if (loadingStore <= 0 && !show) {
        return null;
    }

    return (
        // <div className='loading flex-center'>
        <div className='loading flex-center h-screen top-0 w-screen'>
            <div className="lds-spinner">
                {Array(12).fill(0).map((item, index) => (
                    <div key={index}/>
                ))}
            </div>
        </div>
    )
}

export default memo(AppLoading);

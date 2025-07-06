import React from 'react';
import {Tag} from 'antd';
import './index.scss'

const AppTag = ({status, text, color}) => {
    const colorClass = `ant-tag-${color}`;

    return (
        <Tag className={`${colorClass} ml-2.5 text-center`} key={status}>
            <h6 style={{fontSize: 12}}>
                {text}
            </h6>
        </Tag>
    );
};

export default AppTag;
import React, {useEffect, useRef, useState} from 'react'
import {Button, Input, Popover, Radio, Space} from "antd";
import {IoSearchOutline} from "react-icons/io5";
import {FaSliders} from "react-icons/fa6";


function AppFilter({placeholder, className, status, changeFormSearch, contentStatus}) {
    const debounceTimeout = useRef(null);
    const [searchText, setSearchText] = useState('');
    const content = (
        contentStatus ? contentStatus : (
            <div>
                <Radio.Group onChange={(e) => changeFormSearch('status', e.target.value)} value={status}>
                    <Space direction="vertical">
                        <Radio value="">Tất cả</Radio>
                        <Radio value="ACTIVE">Hoạt động</Radio>
                        <Radio value="INACTIVE">Không hoạt động</Radio>
                    </Space>
                </Radio.Group>
            </div>
        )
    );
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchText(value);

        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        debounceTimeout.current = setTimeout(() => {
            changeFormSearch("searchText", value);
        }, 1000);
    };
    return (
        <Space.Compact className={className}>
            <Input
                size={"large"}
                value={searchText}
                onChange={handleSearchChange}
                prefix={<IoSearchOutline color={'#000'}/>}
                placeholder={placeholder}
            />
            <Popover content={content} trigger="click"
                     placement={"bottom"}
                     className="text-base  p-[6px] h-[40px]">
                <Button className="p-[6px]" title={"Trạng thái"} icon={<FaSliders color={"#c02627"}/>}/>
            </Popover>
        </Space.Compact>

    )
}

export default AppFilter;

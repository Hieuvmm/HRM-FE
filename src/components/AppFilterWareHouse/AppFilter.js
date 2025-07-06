import React from 'react'
import {Button, Input, Popover, Radio, Space} from "antd";
import {IoSearchOutline} from "react-icons/io5";
import {FaSliders} from "react-icons/fa6";


export default function AppFilterWareHouse({placeholder, className, status, searchText, changeFormSearch}) {
    const content = (
        <div>
            <Radio.Group onChange={(e) => changeFormSearch('status', e.target.value)} value={status}>
                <Space direction="vertical">
                    <Radio value="">Tất cả</Radio>
                    <Radio value="ACTIVE">Hoạt động</Radio>
                    <Radio value="INACTIVE">Không hoạt động</Radio>
                </Space>
            </Radio.Group>
        </div>
    );
    return (
        <Space.Compact className={className}>
            <Input
                size={"large"}
                value={searchText}
                onChange={(e) => changeFormSearch("keyword", e.target.value)}
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

import {Popconfirm, Popover, Select, Tag} from "antd";
import React, {useEffect, useState} from "react";
import {PiDotsThreeOutlineVerticalFill} from "react-icons/pi";
import AppCreateButton from "../../components/AppButton/AppCreateButton";
//import {AppNotification} from "../../../components/Notification/AppNotification";
import AppTable from "../../components/Table/AppTable";
import AppFilterExBill from "../../components/AppFilter/AppFilterExBill";
//import {handleFormSearch, handleFormUpdate} from "../../../utils/AppUtil";
//import ModalCreateExport from "./ModalCreateExport";
//import {ExportBillWarehouse} from "../../../apis/ExportBillWarehouse.api";
//const {Option} = Select
export default function AttributeManagement() {
    const columns = [
        {
            title: "STT",
            dataIndex: "stt",
            key: "stt",
        },

        {
            title: "Chất liệu",
            dataIndex: "exCode",
            key: "exCode",
        },

        {
            title: "Màu",
            dataIndex: "wareHouse",
            key: "wareHouse",
        },
        {
            title: "Kích cỡ",
            dataIndex: "totalPrice",
            key: "totalPrice",
        },
        {
            title: "Chủng loại",
            dataIndex: "createdBy",
            key: "createdBy",
        },
        // {
        //     title: "Nhà cung cấp",
        //     dataIndex: "wareHouse",
        //     key: "wareHouse",
        // },

        {
            title: "Ghi chú",
            dataIndex: "value",
            key: "value",
        },
        //{
        //    title: "Hành động",
        //    dataIndex: "hanhDong",
        //    key: "hanhDong",
        //    align: "center",
        //    render: (_, record) => (
//
        //        <Popover placement="top" content={() => content(record)} overlayInnerStyle={{ padding: 0 }}>
        //            <div className="flex justify-center w-full h-full">
        //                <PiDotsThreeOutlineVerticalFill />
//
        //            </div>
        //        </Popover>
        //    ),
        //},
    ];
    return (
        <React.Fragment>
            <div className={"mt-5"}>
                <span className={"text-xl font-bold text-red-700"}>
                    Thuộc tính sản phẩm
                </span>
            </div>
            <div className="bg-red-700 h-[2px] w-full my-3"/>
            <div className="m-[20px] flex">
                <AppCreateButton text={"Thêm thông số"}/>
                <AppFilterExBill placeholder={"Tìm kiếm theo mã hoặc tên"} className="w-[25%] ml-auto mr-5"/>
            </div>
            <AppTable
                columns={columns}
                // dataSource={dataSource}
                //changeFormSearch={changeFormSearch}
                //formSearch={formSearch}
                //totalElement={totalElement}
                //totalPages={totalPages}
            />
        </React.Fragment>
    );

}

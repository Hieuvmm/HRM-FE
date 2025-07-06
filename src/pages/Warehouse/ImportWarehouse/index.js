import {Button, Popconfirm, Popover, Radio, Space, Tag, Table} from "antd";
import React, {useState} from "react";
import {PiDotsThreeOutlineVerticalFill} from "react-icons/pi";
import {AppNotification} from "../../../components/Notification/AppNotification";
import AppTable from "../../../components/Table/AppTable";
import AppCreateButton from "../../../components/AppButton/AppCreateButton";
import {dataSource, formatCurrency, handleFormSearch, useStyle} from "../../../utils/AppUtil";
import {IoIosSend} from "react-icons/io";
import {ImportBillApi} from "../../../apis/ImportBill.api";
import dayjs from "dayjs";
import ModalAssignApproval from "./Modal/AssignApproval";
import AppFilter from "../../../components/AppFilter/AppFilter";
import {useNavigate} from "react-router-dom";
import {routes} from "../../../utils/common";
import AppFormPage from "../../../components/AppFormPage/AppFormPage";
import ModalCreateExport from "../ExportWarehouse/ModalCreateExport";

export default function ImportWarehouse() {
    const nav = useNavigate();
    const {styles} = useStyle();
    const [formSearch, setFormSearch] = useState({
        page: 1,
        limit: 10,
        status: "",
        searchText: ""
    });
    const [modalAssignApproval, setModalAssignApproval] = useState({
            status: false,
            importBillCodes: []
        }
    );
    const [rowKey, setRowKey] = useState([]);
    const {data: importBills, refetch} = ImportBillApi.useGetList(formSearch, {staleTime: 0, cacheTime: 0})


    const content = (record) => {
        return (
            <div className="p-1 pointer">
                {record?.status === "NEW" ? (
                    <div className="mb-0 p-2 pr-6 hover:bg-red-100"
                         onClick={() => {
                             if (record?.status !== "NEW") {
                                 AppNotification.error("Không thể chỉnh sửa phiếu này")
                                 return;
                             }
                             nav(routes.IM_WAREHOUSE_UPDATE + record?.code);
                         }}>
                        Chỉnh sửa
                    </div>
                ) : null}

                <div className="mb-0 p-2 pr-6 hover:bg-red-100"
                     onClick={() => nav(routes.IM_WAREHOUSE_DETAIL + record?.code)}>
                    Chi tiết
                </div>
                {record?.status === "NEW" ? (
                    <Popconfirm
                        title="Thông báo"
                        description="Bạn có chắc chắn muốn hủy không ?"
                        onConfirm={() => {
                            handleCancel(record);
                        }}
                        okText="Có"
                        cancelText="Không"
                    >
                        <div className="mb-0 p-2 pr-6 hover:bg-red-100">Hủy</div>
                    </Popconfirm>
                ) : null}
                {record.status !== "REVIEWING" && record.status !== "NEW" ? (
                    <Popconfirm
                        title="Thông báo"
                        description="Bạn có chắc chắn muốn xóa không ?"
                        onConfirm={() => {
                            handleDelete(record);
                        }}
                        okText="Có"
                        cancelText="Không"
                    >
                        <div className="mb-0 p-2 pr-6 hover:bg-red-100">Xóa</div>
                    </Popconfirm>
                ) : null}
            </div>
        )
    };
    const handleStatusBill = (status) => {
        if (status === "NEW") {
            return <Tag color={"green"}>Mới</Tag>
        } else if (status === "REVIEWING") {
            return <Tag color="yellow">Chờ duyệt</Tag>
        } else if (status === "REFUSED") {
            return <Tag color="#f50">Đã từ chối</Tag>
        } else if (status === "CANCELED") {
            return <Tag color={"red"}>Đã hủy</Tag>
        } else {
            return <Tag color={"#87d068"}>Hoàn thành</Tag>
        }
    }
    const columns = [
        {
            title: "STT",
            dataIndex: "stt",
            key: "stt",
            align: "center",
            width: 60,
            fixed: "left"
        },
        {
            title: "Trạng thái đơn nhập",
            dataIndex: "status",
            key: "status",
            align: "center",
            render: (text) => handleStatusBill(text),
            width: 150,
            fixed: "left"
        },
        {
            title: "Số phiếu nhập",
            dataIndex: "code",
            key: "code",
            width: 150,
            fixed: "left"
        },

        {
            title: "Kho nhập",
            dataIndex: "warehouseName",
            key: "warehouseName",
            width: 150,
        },
        {
            title: "Giá trị đơn nhập",
            width: 150,
            render: (_, record) => formatCurrency(record?.totalBill) || 0
        },
        {
            title: "Người lập phiếu",
            dataIndex: "createdBy",
            key: "createdBy",
            width: 150,
        },
        {
            title: "Nhà cung cấp",
            dataIndex: "providerName",
            key: "providerName",
            width: 150,
        },
        {
            title: "Ngày lập phiếu",
            dataIndex: "createdDate",
            key: "createdDate",
            width: 150,
            render: (text) => dayjs(text).format("DD/MM/YYYY"),
        },
        {
            title: "Ghi chú",
            dataIndex: "description",
            key: "description",
            width: 150,
        },
        {
            title: "Tác vụ",
            align: "center",
            width: 40,
            fixed: "right",
            render: (_, record) => (

                <Popover placement="left" content={() => content(record)} overlayInnerStyle={{padding: 0}}>
                    <div className="flex justify-center w-full h-full pointer">
                        <PiDotsThreeOutlineVerticalFill size={20}/>
                    </div>
                </Popover>
            ),
        },
    ];

    const changeFormSearch = (name, value) => {
        handleFormSearch(setFormSearch, name, value)
    };

    const handleDelete = async (record) => {
        if (record.status === "REVIEWING" || record.status === "NEW") {
            AppNotification.error("Không thể xóa phiếu nhập này");
            return;
        }
        await ImportBillApi.delete({id: record.id, status: "DELETED"}).then((res) => {
            AppNotification.success("Xóa phiếu nhập thành công");
            refetch()
        }).catch((error) => {
                console.log(error)
            }
        )
    }
    const handleCancel = async (record) => {
        if (record.status !== "NEW") {
            AppNotification.error("Không thể hủy phiếu nhập này");
            return;
        }
        await ImportBillApi.delete({id: record.id, status: "CANCELED"}).then((res) => {
            AppNotification.success("Hủy phiếu nhập thành công");
            refetch()
        }).catch((error) => {
                console.log(error)
            }
        )
    }
    const onSelectChange = (newSelectedRowKeys) => {

        setRowKey(newSelectedRowKeys);
        console.log(newSelectedRowKeys)
    };

    const rowSelection = {
        selectedRowKeys: rowKey,
        onChange: onSelectChange,
    };

    const handleSendApproval = () => {
        if (rowKey.length === 0) {
            AppNotification.error("Vui lòng chọn phiếu để gửi phê duyệt");
            return;
        }

        const importBillCanSendCodes = new Set(
            importBills?.body?.filter(item => item.status === "NEW").map(item => item.code)
        );

        const importBillNoSend = rowKey.filter(item => !importBillCanSendCodes.has(item));

        if (importBillNoSend.length > 0) {
            AppNotification.error("Có phiếu không thể gửi phê duyệt")
            return;
        }
        setModalAssignApproval({importBillCodes: rowKey, status: true})
    }

    const contentStatus = (
        <div>
            <Radio.Group onChange={(e) => changeFormSearch('status', e.target.value)} value={formSearch?.status}>
                <Space direction="vertical">
                    <Radio value="">Tất cả</Radio>
                    <Radio value="NEW">Mới</Radio>
                    <Radio value="REVIEWING">Đang duyệt</Radio>
                    <Radio value="CANCELED">Đã hủy</Radio>
                    <Radio value="REFUSED">Đã từ chối</Radio>
                    <Radio value="DONE">Hoàn thành</Radio>
                </Space>
            </Radio.Group>
        </div>
    );

    // const AppTable = ({columns, dataSource, changeFormSearch, formSearch, totalElement, onclickRow, rowSelection}) => {
    //     return (
    //         <Table
    //             columns={columns}
    //             dataSource={dataSource}
    //             rowSelection={rowSelection}
    //             pagination={{
    //                 current: formSearch.page,
    //                 pageSize: formSearch.limit,
    //                 total: totalElement,
    //                 onChange: (page, pageSize) => {
    //                     changeFormSearch('page', page);
    //                     changeFormSearch('limit', pageSize);
    //                 },
    //             }}
    //             onRow={onclickRow}
    //         />
    //     );
    // };
    return (
        // <React.Fragment>
        //     <div className={"mt-5"}>
        //         <span className={"text-xl font-bold text-red-700"}>Quản lý nhập kho</span>
        //     </div>
        //     <div className="bg-red-700 h-[2px] w-full my-3"/>
        //     <div className="m-[20px] flex">
        //         <AppCreateButton text={"Lập phiếu nhập"} onClick={() => nav(routes.IM_WAREHOUSE_CREATE)}/>
        //
        //         <Button type="default" size="large" className="ml-4" onClick={handleSendApproval}>
        //             Gửi phê duyệt
        //             <Space>
        //                 <IoIosSend style={{marginLeft: 5}}/>
        //             </Space>
        //         </Button>
        //
        //         <AppFilter placeholder={"Tìm kiếm theo mã "} className="w-[25%] ml-auto mr-5"
        //                    status={formSearch.status} searchText={formSearch.searchText}
        //                    changeFormSearch={changeFormSearch} contentStatus={contentStatus}/>
        //         {/*<Space.Compact className="w-[25%] ml-auto mr-5">*/}
        //         {/*    <Input*/}
        //         {/*        size={"large"}*/}
        //         {/*        value={formSearch.searchText}*/}
        //         {/*        onChange={(e) => changeFormSearch("searchText", e.target.value)}*/}
        //         {/*        prefix={<IoSearchOutline color={'#000'}/>}*/}
        //         {/*        placeholder={"Tìm kiếm theo mã"}*/}
        //         {/*    />*/}
        //         {/*    <Popover content={contentStatus} trigger="click"*/}
        //         {/*             placement={"bottom"}*/}
        //         {/*             className="text-base  p-[6px] h-[40px]">*/}
        //         {/*        <Button className="p-[6px]" title={"Trạng thái"} icon={<FaSliders color={"#c02627"}/>}/>*/}
        //         {/*    </Popover>*/}
        //         {/*</Space.Compact>*/}
        //     </div>
        //     <AppTable
        //         className={styles?.customTable}
        //         rowSelection={rowSelection}
        //         columns={columns}
        //         dataSource={dataSource(importBills?.body, formSearch)}
        //         changeFormSearch={changeFormSearch}
        //         formSearch={formSearch}
        //         totalElement={importBills?.total}
        //         totalPages={importBills?.lastPage}
        //         onclickRow={(record) => ({
        //             style: {cursor: 'pointer'},
        //             onDoubleClick: () => {
        //                 nav(routes.IM_WAREHOUSE_DETAIL + record?.code);
        //             },
        //         })}
        //     />
        //     <ModalAssignApproval modalAssignApproval={modalAssignApproval}
        //                          setModalAssignApproval={setModalAssignApproval} importBillCodes={rowKey}
        //                          refetch={refetch}/>
        // </React.Fragment>
        <AppFormPage title={"Quản lý nhâp kho"}>
            <div className="m-[20px] flex">
                <AppCreateButton text={"Lập phiếu nhập"} onClick={() => nav(routes.IM_WAREHOUSE_CREATE)}/>

                <Button type="default" size="large" className="ml-4" onClick={handleSendApproval}>
                    Gửi phê duyệt
                    <Space>
                        <IoIosSend style={{marginLeft: 5}}/>
                    </Space>
                </Button>

                <AppFilter placeholder={"Tìm kiếm theo mã "} className="w-[25%] ml-auto mr-5"
                           status={formSearch.status} searchText={formSearch.searchText}
                           changeFormSearch={changeFormSearch} contentStatus={contentStatus}/>
                {/*<Space.Compact className="w-[25%] ml-auto mr-5">*/}
                {/*    <Input*/}
                {/*        size={"large"}*/}
                {/*        value={formSearch.searchText}*/}
                {/*        onChange={(e) => changeFormSearch("searchText", e.target.value)}*/}
                {/*        prefix={<IoSearchOutline color={'#000'}/>}*/}
                {/*        placeholder={"Tìm kiếm theo mã"}*/}
                {/*    />*/}
                {/*    <Popover content={contentStatus} trigger="click"*/}
                {/*             placement={"bottom"}*/}
                {/*             className="text-base  p-[6px] h-[40px]">*/}
                {/*        <Button className="p-[6px]" title={"Trạng thái"} icon={<FaSliders color={"#c02627"}/>}/>*/}
                {/*    </Popover>*/}
                {/*</Space.Compact>*/}
            </div>
            <AppTable
                // className={styles?.customTable}
                rowSelection={rowSelection}
                columns={columns}
                dataSource={dataSource(importBills?.body, formSearch)}
                changeFormSearch={changeFormSearch}
                formSearch={formSearch}
                totalElement={importBills?.total}
                totalPages={importBills?.lastPage}
                onclickRow={(record) => ({
                    style: {cursor: 'pointer'},
                    onDoubleClick: () => {
                        nav(routes.IM_WAREHOUSE_DETAIL + record?.code);
                    },
                })}
            />
            <ModalAssignApproval modalAssignApproval={modalAssignApproval}
                                 setModalAssignApproval={setModalAssignApproval} importBillCodes={rowKey}
                                 refetch={refetch}/>
        </AppFormPage>
    );
}

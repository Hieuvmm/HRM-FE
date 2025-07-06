import {
    Button,
    Popconfirm,
    Popover, Select,
    Space,
    Tag,
} from "antd";
import React, {useEffect, useState} from "react";
import {PiDotsThreeOutlineVerticalFill} from "react-icons/pi";
import {AppNotification} from "../../../components/Notification/AppNotification";
import AppTable from "../../../components/Table/AppTable";
import AppCreateButton from "../../../components/AppButton/AppCreateButton";
import AppFilterExBill from "../../../components/AppFilter/AppFilterExBill";
import {handleFormSearch, handleFormUpdate} from "../../../utils/AppUtil";
import ModalCreateExport from "./ModalCreateExport";
import {ExportBillWarehouse} from "../../../apis/ExportBillWarehouse.api";
import {IoIosSend} from "react-icons/io";
import ModalAssignApprovalExportBill from "./ModalCreateExport/AssignApprovalExportBill";
import {useNavigate} from "react-router-dom";
import AppFormPage from "../../../components/AppFormPage/AppFormPage";

const {Option} = Select
export default function ExportWarehouse() {
    const [formSearch, setFormSearch] = useState({
        searchText: "",
        status: "",
        page: 1,
        // pageNumber: 1,
        limit: 10
        // pageSize: 10
    });
    const [totalElement, setTotalElement] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    // const [exchangeRates, setExchangeRates] = useState([]);
    const [exBillList, setExBillList] = useState([]);
    const initialModalCreate = {
        status: false,
        type: "",
        exCode: "",
    };
    const [modalCreate, setModalCreate] = useState(initialModalCreate);
    const initialFormCreate = {
        status: "ACTIVE",
    }
    const [formCreate, setFormCreate] = useState(initialFormCreate);
    const [formErrors, setFormErrors] = useState({})
    const [rowKey, setRowKey] = useState([]);
    const onSelectChange = (newSelectedRowKeys) => {

        setRowKey(newSelectedRowKeys);
        console.log(newSelectedRowKeys)
    };

    const rowSelection = {
        selectedRowKeys: rowKey,
        onChange: onSelectChange,
    };

    const {data: resList, refetch} = ExportBillWarehouse.useGetList(formSearch, {staleTime: 0, cacheTime: 0})
    useEffect(() => {
        setExBillList(resList?.exBillList)
        setTotalPages(resList?.totalPage)
        setTotalElement(resList?.total)
    }, [resList]);

    useEffect(() => {
        if (modalCreate.id) {
            ExportBillWarehouse.detail({id: modalCreate.id}).then((res) => {
                setFormCreate(res.body)
            }).catch((error) => {
                console.log(error);
            })
        }
    }, [modalCreate.id]);

    const navigate = useNavigate();
    // Chuyển hướng tới màn hình chi tiết
    const handleDetailClick = (exCode) => {
        navigate(`/ex-warehouse/detail/${exCode}`);
    };

    const handleEditClick = (exCode) => {
        navigate(`/ex-warehouse/edit/${exCode}`);
    };
    const content = (record) => {
        return (
            <React.Fragment>
                {/*<div className={"mt-5"}>*/}
                {/*    <span className={"text-xl font-bold text-red-700"}>Quản lý phiếu xuất</span>*/}
                {/*</div>*/}
                <div className="p-1 pointer">
                    <div className="mb-0 p-2 pr-6 hover:bg-red-100"
                         onClick={() => {
                             if (record.status === "APPROVAL") {
                                 AppNotification.error("Không thể chỉnh sửa những phiếu đã duyệt");
                                 return;
                             }
                             if (record.status === "REJECT") {
                                 AppNotification.error("Không thể chỉnh sửa những phiếu đã huỷ");
                                 return;
                             }
                             // setModalCreate({status: true, exCode: record.exCode, type: 'detail'})
                             handleEditClick(record.exCode)
                         }}>
                        Chỉnh sửa
                    </div>
                    <div className="mb-0 p-2 pr-6 hover:bg-red-100"
                         onClick={() => {
                             // if(record.status === "APPROVAL"){
                             //     AppNotification.error("Không thể chỉnh sửa những phiếu đã duyệt");
                             //     return;
                             // }
                             //  if(record.status === "REJECT"){
                             //      AppNotification.error("Không thể chỉnh sửa những phiếu đã huỷ");
                             //      return;
                             //  }
                             // setModalCreate({status: true, exCode: record.exCode, type: 'detail_ex'})
                             handleDetailClick(record.exCode);
                         }}>
                        Chi tiết
                    </div>
                    {/* <div className="p-1 pointer">    */}
                    <Popconfirm
                        title="Thông báo"
                        description="Bạn có chắc chắn muốn xóa không ?"
                        onConfirm={() => {
                            handleDelete(record,);
                        }}
                        okText="Có"
                        cancelText="Không"
                    >
                        <div className="mb-0 p-2 pr-6 hover:bg-red-100">Xóa</div>
                    </Popconfirm>

                </div>
            </React.Fragment>
        )
    };
    const handleStatusBill = (status) => {
        if (status === "APPROVAL") {
            return <Tag color={"green"}>Đã duyệt</Tag>
        } else if (status === "NEW") {
            return <Tag color="blue">Mới</Tag>
        } else if (status === "CREATED") {
            return <Tag color="gold">Chờ duyệt</Tag>
        } else if (status === "REJECT") {
            return <Tag color="#f50">Đã từ chối</Tag>
        } else {
            return <Tag color={"yellow"}>Không xác định</Tag>
        }
    }
    const columns = [
        {
            title: "STT",
            dataIndex: "stt",
            key: "stt",
        },
        {
            title: "Trạng Thái",
            dataIndex: "status",
            key: "status",
            align: "center",
            render: (text) => handleStatusBill(text),
            // render: (text) => {
            //     return (
            //         <Tag color={(text === "CREATED" || text === "APPROVAL" ) ? "green" : "red"}>
            //             {(text === "ACTIVE" || text === "CREATED" || text === "APPROVAL") ? "Hoạt động" : "Không hoạt động"}
            //         </Tag>
            //     );
            // },
        },
        {
            title: "Số phiếu",
            dataIndex: "exCode",
            key: "exCode",
        },

        {
            title: "Kho",
            dataIndex: "wareHouse",
            key: "wareHouse",
        },
        {
            title: "Giá trị",
            dataIndex: "totalPrice",
            key: "totalPrice",
        },
        {
            title: "Người lập phiếu",
            dataIndex: "createdBy",
            key: "createdBy",
        },
        // {
        //     title: "Nhà cung cấp",
        //     dataIndex: "wareHouse",
        //     key: "wareHouse",
        // },
        {
            title: "Ngày lập phiếu",
            dataIndex: "createdDate",
            key: "createdDate",
        },
        {
            title: "Ghi chú",
            dataIndex: "value",
            key: "value",
        },
        {
            title: "Tác vụ",
            dataIndex: "tacVu",
            key: "tacVu",
            align: "center",
            render: (_, record) => (

                <Popover placement="top" content={() => content(record)} overlayInnerStyle={{padding: 0}}>
                    <div className="flex justify-center w-full h-full">
                        <PiDotsThreeOutlineVerticalFill/>

                    </div>
                </Popover>
            ),
        },
    ];
    const dataSource = exBillList?.map((item, index) => ({
        stt: (formSearch.page - 1) * formSearch.limit + index + 1,
        key: item?.exCode,
        ...item

    }))
    const closeModal = () => {
        setModalCreate(initialModalCreate);
        setFormCreate(initialFormCreate)
    };
    const changeFormSearch = (name, value) => {
        handleFormSearch(setFormSearch, name, value)
    };

    //pop-up gui phe duyet
    const [modalAssignApproval, setModalAssignApproval] = useState({
            status: false,
            exBillCodes: []
        }
    );

    const handleSendApproval = () => {
        if (rowKey.length === 0) {
            AppNotification.error("Vui lòng chọn phiếu để gửi phê duyệt");
            return;
        }

        const exBillCanSendCodes = new Set(
            exBillList?.filter(item => item.status === "NEW").map(item => item.exCode)
        );
        const exBillNoSend = rowKey.filter(item => !exBillCanSendCodes.has(item));
        if (exBillNoSend.length > 0) {
            AppNotification.error("Có phiếu không thể gửi phê duyệt")
            return;
        }
        setModalAssignApproval({exBillCodes: rowKey, status: true})
    }

    const handleDelete = (record) => {
        console.log("record delete: ", record)
        if (record.status === "APPROVAL") {
            AppNotification.error("Không được xoá những phiễu đã duyệt");
            return;
        }
        ExportBillWarehouse.delete({exCode: record.exCode}).then((res) => {
            AppNotification.success("Xóa thành công");
            const dataFilter = exBillList.filter((item) => item.exCode !== record.exCode)
            setExBillList(dataFilter)
        }).catch((error) => {
                console.log(error)
                AppNotification.error("Xóa thất bại do: ", error.message);
            }
        )
    }
    return (
        <AppFormPage title={"Quản lý phiếu xuất"}>
            <div className="m-[20px] flex">
                <AppCreateButton text={"Lập phiếu xuất"}
                                 onClick={() => setModalCreate({status: true, exCode: null, type: 'create'})}/>

                <Button type="default" size="large" className="ml-4"
                        onClick={handleSendApproval}
                >
                    Gửi phê duyệt
                    <Space>
                        <IoIosSend style={{marginLeft: 5}}/>
                    </Space>
                </Button>
                <AppFilterExBill placeholder={"Tìm kiếm theo mã hoặc tên"} className="w-[25%] ml-auto mr-5"
                                 status={formSearch.status} searchText={formSearch.searchText}
                                 changeFormSearch={changeFormSearch}/>
            </div>
            <AppTable
                columns={columns}
                dataSource={dataSource}
                rowSelection={rowSelection}
                changeFormSearch={changeFormSearch}
                formSearch={formSearch}
                totalElement={totalElement}
                totalPages={totalPages}
            />
            {modalCreate.status && (
                <ModalCreateExport
                    modalCreate={modalCreate}
                    setModalCreate={setModalCreate}
                />
            )}

            <ModalAssignApprovalExportBill modalAssignApproval={modalAssignApproval}
                                           setModalAssignApproval={setModalAssignApproval} importBillCodes={rowKey}
                                           refetch={refetch}/>
        </AppFormPage>
        // <React.Fragment>
        //     <div className={"mt-5"}>
        //         <span className={"text-xl font-bold text-red-700"}>Quản lý phiếu xuất</span>
        //     </div>
        //     <div className="bg-red-700 h-[2px] w-full my-3"/>
        //     <div className="m-[20px] flex">
        //         <AppCreateButton text={"Lập phiếu xuất"}
        //                          onClick={() => setModalCreate({status: true, exCode: null, type: 'create'})}/>
        //
        //         <Button type="default" size="large" className="ml-4"
        //                 onClick={handleSendApproval}
        //         >
        //             Gửi phê duyệt
        //             <Space>
        //                 <IoIosSend style={{marginLeft: 5}}/>
        //             </Space>
        //         </Button>
        //         <AppFilterExBill placeholder={"Tìm kiếm theo mã hoặc tên"} className="w-[25%] ml-auto mr-5"
        //                          status={formSearch.status} searchText={formSearch.searchText}
        //                          changeFormSearch={changeFormSearch}/>
        //     </div>
        //     <AppTable
        //         columns={columns}
        //         dataSource={dataSource}
        //         rowSelection={rowSelection}
        //         changeFormSearch={changeFormSearch}
        //         formSearch={formSearch}
        //         totalElement={totalElement}
        //         totalPages={totalPages}
        //     />
        //     {modalCreate.status && (
        //         <ModalCreateExport
        //             modalCreate={modalCreate}
        //             setModalCreate={setModalCreate}
        //         />
        //     )}
        //
        //     <ModalAssignApprovalExportBill modalAssignApproval={modalAssignApproval}
        //                                    setModalAssignApproval={setModalAssignApproval} importBillCodes={rowKey}
        //                                    refetch={refetch}/>
        //
        // </React.Fragment>
    );
}

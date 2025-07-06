import {Button, Checkbox, Form, Input, Modal, Popconfirm, Popover, Select, Tag,} from "antd";
import React, {useEffect, useState} from "react";
import {PiDotsThreeOutlineVerticalFill} from "react-icons/pi";
import {RiSaveLine} from "react-icons/ri";
import {AiOutlineClose} from "react-icons/ai";
import {AppNotification} from "../../../components/Notification/AppNotification";
import AppTable from "../../../components/Table/AppTable";
import AppCreateButton from "../../../components/AppButton/AppCreateButton";
import AppFilter from "../../../components/AppFilter/AppFilter";
import {useQueryClient} from "@tanstack/react-query";
import {DepartmentApi} from "../../../apis/Department.api";
import {dataSource, handleFormSearch, handleFormUpdate, handleLogMessageError} from "../../../utils/AppUtil";
import {errorTexts} from "../../../utils/common";
import {BranchApi} from "../../../apis/Branch.api";
import {WarehouseApi} from "../../../apis/Warehouse.api";

const {TextArea} = Input;
export default function Branch() {
    const [formSearch, setFormSearch] = useState({
        page: 1,
        limit: 10,
        status: "",
        searchText: ""
    });
    const initialModalCreate = {
        status: false,
        type: "",
        data: {},
    };
    const initialFormCreate = {
        status: "ACTIVE",
    }
    const [modalCreate, setModalCreate] = useState(initialModalCreate);
    const [formCreate, setFormCreate] = useState(initialFormCreate);
    const [formErrors, setFormErrors] = useState({})
    const {data: branches, refetch} = BranchApi.useGetList(formSearch, {staleTime: 0, cacheTime: 0})
    const {data: departments} = DepartmentApi.useGetList({status: "ACTIVE"}, {
        staleTime: 0,
        cacheTime: 0,
        enabled: !!modalCreate?.status
    })
    const {data: warehouses} = WarehouseApi.useGetList({
        status: "ACTIVE",
        keyword: "",
        pageSize: 100000000,
        pageNumber: 1,
    }, {staleTime: 0, cacheTime: 0, enabled: !!modalCreate?.status})

    useEffect(() => {
        if (modalCreate.type === "update") {
            const dataDetail = modalCreate?.data
            setFormCreate({
                ...dataDetail,
                departmentCode: dataDetail?.departmentInfo?.map((item) => item.code).join(","),
                wareHouseCode: dataDetail?.warehouseInfo?.map((item) => item.whCode).join(","),
            })
        }
    }, [modalCreate.data]);

    const content = (record) => {
        return (<div className="p-1 pointer">
            <div className="mb-0 p-2 pr-6 hover:bg-red-100"
                 onClick={() => setModalCreate({status: true, data: record, type: "update"})}>
                Chỉnh sửa
            </div>
            <Popconfirm
                title="Thông báo"
                description="Bạn có chắc chắn muốn xóa không ?"
                onConfirm={() => {
                    handleDelete(record);
                }}
                okText="Có"
                cancelText="Không"
            >
                <div className="mb-0 p-2 pr-6 hover:bg-red-100"
                >Xóa
                </div>
            </Popconfirm>

        </div>)
    };

    const columns = [
        {
            title: "STT",
            dataIndex: "stt",
            key: "stt",
        },
        {
            title: "Mã chi nhánh",
            dataIndex: "code",
            key: "code",
        },
        {
            title: "Tên chi nhánh",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Mô tả",
            dataIndex: "description",
            key: "description",
        },
        {
            title: "Trạng Thái",
            dataIndex: "status",
            key: "status",
            align: "center",
            render: (text) => {
                return (
                    <Tag color={text === "ACTIVE" ? "green" : "red"}>
                        {text === "ACTIVE" ? "Hoạt động" : "Không hoạt động"}
                    </Tag>
                );
            },
        },
        {
            title: "Tác vụ",
            dataIndex: "tacVu",
            key: "tacVu",
            align: "center",
            render: (text, record) => (
                <div style={{display: "flex", justifyContent: "center", gap: "10px"}}>
                    <Popover placement="top" title={text} content={() => content(record)}>
                        <PiDotsThreeOutlineVerticalFill/>
                    </Popover>
                </div>
            ),
        },
    ];

    const closeModal = () => {
        setModalCreate(initialModalCreate);
        setFormCreate(initialFormCreate)
    };
    const changeFormSearch = (name, value) => {
        handleFormSearch(setFormSearch, name, value)
    };
    const changeFormUpdate = (name, value) => {
        handleFormUpdate(setFormCreate, setFormErrors, name, value)
    };
    const handleSubmit = async () => {

        const isValid = formCreate.code && formCreate.name;
        if (!isValid) {
            const errors = {
                code: !formCreate.code ? errorTexts.REQUIRE_FIELD : "",
                name: !formCreate.name ? errorTexts.REQUIRE_FIELD : "",
            }
            console.log(errors)
            setFormErrors(errors);
            return
        }
        // const response = {
        //     ...formCreate,
        //     departmentInfo: departments?.body?.filter((item) => formCreate?.departmentCode?.includes(item.code)),
        //     warehouseInfo: warehouses?.body?.filter((item) => formCreate?.warehouseCode?.includes(item.code))
        // }
        if (modalCreate.type === "update") {
            await BranchApi.update(formCreate).then((res) => {
                refetch()
                closeModal()
                AppNotification.success("Cập nhật chi nhánh thành công");
            }).catch((error) => {
                const message = error.message;
                if (message) {
                    AppNotification.error(message);
                }
            })
        } else {
            await BranchApi.create(formCreate).then((res) => {
                refetch()
                closeModal()
                AppNotification.success("Thêm mới chi nhánh thành công");
            }).catch((error) => {
                const errorCode = error.errorCode;
                if (errorCode?.includes("ADSYS_004")) {
                    setFormErrors({...formErrors, code: errorTexts.DATA_EXIST})
                }
            })
        }
    }
    const handleDelete = async (record) => {
        if (record.status === "ACTIVE") {
            AppNotification.error("Chỉ được xóa bản ghi không hoạt động");
            return;
        }
        await BranchApi.delete({"code": record.code}).then((res) => {
            AppNotification.success("Xóa chi nhánh thành công");
            refetch()
        }).catch((error) => {
            handleLogMessageError(error);
        })
    }
    return (
        <React.Fragment>
            <div className="m-[20px] flex">
                <AppCreateButton text={"Thêm mới"} onClick={() => setModalCreate({status: true, type: "", id: ""})}/>
                <AppFilter placeholder={"Tìm kiếm theo tên"} className="w-[25%] ml-auto mr-5"
                           status={formSearch.status} searchText={formSearch.searchText}
                           changeFormSearch={changeFormSearch}/>
            </div>
            <div className={`pl-4 pr-4`}>
                <AppTable
                    columns={columns}
                    dataSource={dataSource(branches?.body, formSearch)}
                    changeFormSearch={changeFormSearch}
                    formSearch={formSearch}
                    totalElement={branches?.total}
                    totalPages={branches?.lastPage}
                />
                <Modal
                    title={` ${modalCreate.type === "update" ? "Cập nhật" : "Thêm mới"} chi nhánh`}
                    open={modalCreate.status}
                    onCancel={closeModal}
                    okButtonProps={{style: {display: "none"}}}
                    cancelButtonProps={{style: {display: "none"}}}
                    width={700}
                >
                    <Form name="validateOnly" layout="vertical" autoComplete="off">
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "48% 48%",
                                gap: "4%",
                            }}
                        >
                            <Form.Item
                                label="Mã chi nhánh"
                                validateStatus={formErrors["code"] ? "error" : ""}
                                help={formErrors["code"] || ""}
                            >
                                <Input
                                    size={"large"}
                                    value={formCreate?.code}
                                    onChange={(e) => changeFormUpdate("code", e.target.value)}
                                />
                            </Form.Item>
                            <Form.Item
                                label="Tên chi nhánh"
                                validateStatus={formErrors["name"] ? "error" : ""}
                                help={formErrors["name"] || ""}
                            >
                                <Input
                                    size={"large"}
                                    value={formCreate?.name}
                                    onChange={(e) => changeFormUpdate("name", e.target.value)}
                                />
                            </Form.Item>
                        </div>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "48% 48%",
                                gap: "4%",
                            }}
                        >
                            <Form.Item
                                label="Phòng ban"
                                validateStatus={formErrors["departmentCode"] ? "error" : ""}
                                help={formErrors["departmentCode"] || ""}
                            >
                                <Select
                                    mode="multiple"
                                    value={formCreate?.departmentCode?.length > 0 ? formCreate?.departmentCode?.split(",") : []}
                                    onChange={(value) => changeFormUpdate("departmentCode", value.join(","))}
                                    options={departments?.body?.map((item) => ({
                                        value: item.code,
                                        label: item.name,
                                    }))}
                                    size={"large"}
                                />
                            </Form.Item>
                            <Form.Item
                                label="Kho"
                                validateStatus={formErrors["warehouseCode"] ? "error" : ""}
                                help={formErrors["warehouseCode"] || ""}
                            >
                                <Select
                                    mode="multiple"
                                    value={formCreate?.warehouseCode?.length > 0 ? formCreate?.warehouseCode?.split(",") : []}
                                    onChange={(value) => changeFormUpdate("warehouseCode", value.join(","))}
                                    options={warehouses?.searchWareHouseModelList?.map((item) => ({
                                        value: item.whCode,
                                        label: item.whName,
                                    }))}
                                    size={"large"}
                                />
                            </Form.Item>
                        </div>
                        <Form.Item label="Mô tả">
                            <TextArea
                                size={"large"}
                                value={formCreate?.description}
                                onChange={(e) => changeFormUpdate("description", e.target.value)}
                            />
                        </Form.Item>
                        <Form.Item label="Trạng thái">
                            <Checkbox checked={formCreate?.status === "ACTIVE"}
                                      onChange={(e) => changeFormUpdate("status", e.target.checked ? "ACTIVE" : "INACTIVE")}
                            >
                                Hoạt động
                            </Checkbox>
                        </Form.Item>
                        <Form.Item>
                            <div style={{display: "flex", marginTop: 20}}>
                                <Button
                                    style={{marginLeft: "auto", marginRight: 10}}
                                    key="submit"
                                    title="Thêm"
                                    onClick={closeModal}
                                >
                                    <AiOutlineClose/> Hủy
                                </Button>
                                {modalCreate.type !== "detail" && (
                                    <Button
                                        className="button-add-promotion bg-red-700 text-[white]"
                                        key="submit"
                                        title="Thêm"
                                        onClick={() => {
                                            handleSubmit();
                                        }}
                                    >
                                        <RiSaveLine/> Lưu lại
                                    </Button>
                                )}
                            </div>
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </React.Fragment>
);
}

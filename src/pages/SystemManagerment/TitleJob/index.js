import {Button, Checkbox, Form, Input, Modal, Popconfirm, Popover, Tag,} from "antd";
import React, {useEffect, useState} from "react";
import {PiDotsThreeOutlineVerticalFill} from "react-icons/pi";
import {RiSaveLine} from "react-icons/ri";
import {AiOutlineClose} from "react-icons/ai";
import {AppNotification} from "../../../components/Notification/AppNotification";
import AppTable from "../../../components/Table/AppTable";
import AppCreateButton from "../../../components/AppButton/AppCreateButton";
import AppFilter from "../../../components/AppFilter/AppFilter";
import {JobTitleApi} from "../../../apis/JobTitle.api";
import {dataSource, handleFormSearch, handleFormUpdate, handleLogMessageError} from "../../../utils/AppUtil";
import {errorTexts} from "../../../utils/common";
import {useQueryClient} from "@tanstack/react-query";

const {TextArea} = Input;

export default function TitleJob() {
    const [formSearch, setFormSearch] = useState({
        page: 1,
        limit: 10,
        status: "",
        searchText: "",
    });

    const initialModalCreate = {
        status: false,
        type: "",
        data: {},
    };
    const initialFormCreate = {
        status: "ACTIVE",
    }
    const [modalCreate, setModalCrete] = useState(initialModalCreate);
    const [formCreate, setFormCreate] = useState(initialFormCreate);
    const [formErrors, setFormErrors] = useState({})
    const {data, refetch} = JobTitleApi.useGetList(formSearch, {staleTime: 0, cacheTime: 0})

    useEffect(() => {
        if (modalCreate.type === "update") {
            setFormCreate(modalCreate.data)
        }
    }, [modalCreate.data]);
    const content = (record) => {
        return (<div className="p-1 pointer">
            <div className="mb-0 p-2 pr-6 hover:bg-red-100"
                 onClick={() => setModalCrete({
                     status: true,
                     data: {...record, desc: record?.description},
                     type: "update"
                 })}>
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
            title: "Mã chức danh",
            dataIndex: "code",
            key: "code",
        },
        {
            title: "Tên chức danh",
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
        setModalCrete(initialModalCreate);
        setFormCreate(initialFormCreate)
    };
    const changeFormSearch = (name, value) => {
        handleFormSearch(setFormSearch, name, value)
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
        if (modalCreate.type === "update") {
            await JobTitleApi.update({...formCreate}).then((res) => {
                refetch()
                closeModal()
                AppNotification.success("Cập nhật chức danh thành công");
            }).catch((error) => {
                const message = error.message;
                if (message) {
                    AppNotification.error(message);
                }
            })
        } else {
            await JobTitleApi.create({...formCreate}).then((res) => {
                refetch()
                closeModal()
                AppNotification.success("Thêm mới chức danh thành công");
            }).catch((error) => {
                const errorCode = error.errorCode;
                if (errorCode?.includes("ADSYS_013")) {
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
        await JobTitleApi.delete({"code": record.code}).then((res) => {
            AppNotification.success("Xóa chức danh thành công");
            refetch()
        }).catch((error) => {
            handleLogMessageError(error);
        })
    }
    return (
        <React.Fragment>
            <div className="m-[20px] flex">
                <AppCreateButton text={"Thêm mới"} onClick={() => setModalCrete({status: true, type: "", id: ""})}/>
                <AppFilter placeholder={"Tìm kiếm theo tên"} className="w-[25%] ml-auto mr-5"
                           status={formSearch.status} searchText={formSearch.searchText}
                           changeFormSearch={changeFormSearch}/>
            </div>
            <div className={`pl-4 pr-4`}>
                <AppTable
                    columns={columns}
                    dataSource={dataSource(data?.body, formSearch)}
                    changeFormSearch={changeFormSearch}
                    formSearch={formSearch}
                    totalElement={data?.total}
                    totalPages={data?.lastPage}
                />
                <Modal
                    title={` ${modalCreate.type === "update" ? "Cập nhật" : "Thêm mới"} chức danh`}
                    open={modalCreate.status}
                    onCancel={closeModal}
                    okButtonProps={{style: {display: "none"}}}
                    cancelButtonProps={{style: {display: "none"}}}
                >
                    <Form name="validateOnly" layout="vertical" autoComplete="off">
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "48% 48%",
                                gap: "4%",
                            }}
                        >
                            <Form.Item label="Mã chức danh"
                                       validateStatus={formErrors["code"] ? "error" : ""}
                                       help={formErrors["code"] || ""}
                            >
                                <Input size={"large"}
                                       value={formCreate?.code}
                                       onChange={(e) => handleFormUpdate(setFormCreate, setFormErrors, "code", e.target.value)}
                                />
                            </Form.Item>
                            <Form.Item label="Tên chức danh"
                                       validateStatus={formErrors["name"] ? "error" : ""}
                                       help={formErrors["name"] || ""}
                            >
                                <Input size={"large"}
                                       value={formCreate?.name}
                                       onChange={(e) => handleFormUpdate(setFormCreate, setFormErrors, "name", e.target.value)}
                                />
                            </Form.Item>
                        </div>
                        <Form.Item label="Mô tả">
                            <TextArea
                                value={formCreate?.desc}
                                onChange={(e) => handleFormUpdate(setFormCreate, setFormErrors, "desc", e.target.value)}
                            />
                        </Form.Item>
                        <Form.Item label="Trạng thái">
                            <Checkbox checked={formCreate?.status === "ACTIVE"}
                                      onChange={(e) => handleFormUpdate(setFormCreate, setFormErrors, "status", e.target.checked ? "ACTIVE" : "INACTIVE")}
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
                            </div>
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </React.Fragment>
);
}
  
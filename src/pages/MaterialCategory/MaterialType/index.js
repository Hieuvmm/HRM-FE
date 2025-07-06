import {
    Button,
    Checkbox,
    Form,
    Input,
    Modal,
    Popconfirm,
    Popover,
    Tag,
} from "antd";
import React, {useEffect, useState} from "react";
import {PiDotsThreeOutlineVerticalFill} from "react-icons/pi";
import {RiSaveLine} from "react-icons/ri";
import {AiOutlineClose} from "react-icons/ai";
import {AppNotification} from "../../../components/Notification/AppNotification";
import AppTable from "../../../components/Table/AppTable";
import AppCreateButton from "../../../components/AppButton/AppCreateButton";
import AppFilter from "../../../components/AppFilter/AppFilter";
import {MaterialTypeApi} from "../../../apis/MaterialType.api";
import {dataSource, handleFormSearch, handleFormUpdate} from "../../../utils/AppUtil";
import {errorCodes, errorTexts} from "../../../utils/common";

const {TextArea} = Input;
export default function MaterialType() {
    const [formSearch, setFormSearch] = useState({
        page: 1,
        limit: 10,
        status: "",
        searchText: ""
    });

    const initialModalCreate = {
        status: false,
        type: "",
        id: "",
    };
    const [modalCreate, setModalCrete] = useState(initialModalCreate);

    const initialFormCreate = {
        status: "ACTIVE",
    };
    const [formCreate, setFormCreate] = useState(initialFormCreate);
    const [formErrors, setFormErrors] = useState({})
    const {data: materialTypes, refetch} = MaterialTypeApi.useGetMaterialTypes(formSearch, {staleTime: 0, cacheTime: 0})


    useEffect(() => {
        if (modalCreate.id) {
            MaterialTypeApi.detail({id: modalCreate.id}).then((res) => {
                setFormCreate(res.body)
            }).catch((error) => {
                console.log(error);
            })
        }
    }, [modalCreate.id]);
    const content = (record) => {
        return (
            <div className="p-1 pointer">
                <div className="mb-0 p-2 pr-6 hover:bg-red-100"
                     onClick={() => setModalCrete({status: true, id: record.id})}>
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

            </div>
        )
    };
    const columns = [
        {
            title: "STT",
            dataIndex: "stt",
            key: "stt",
        },
        {
            title: "Mã loại vật tư",
            dataIndex: "code",
            key: "code",
        },
        {
            title: "Tên loại vật tư",
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
            render: (_, record) => (

                <Popover placement="top" content={() => content(record)} overlayInnerStyle={{padding: 0}}>
                    <div className="flex justify-center w-full h-full">
                        <PiDotsThreeOutlineVerticalFill/>

                    </div>
                </Popover>
            ),
        },
    ];
    const closeModal = () => {
        setFormCreate(initialFormCreate)
        setModalCrete(initialModalCreate);
    };
    const changeFormSearch = (name, value) => {
        handleFormSearch(setFormSearch, name, value)
    };
    const handleSubmit = async () => {

        const isValid = formCreate.code && formCreate.name
        if (!isValid) {
            const errors = {
                code: !formCreate.code ? errorTexts.REQUIRE_FIELD : "",
                name: !formCreate.name ? errorTexts.REQUIRE_FIELD : ""
            }
            setFormErrors(errors);
            return
        }
        if (formCreate.id) {
            await MaterialTypeApi.update(formCreate).then((res) => {
                refetch()
                closeModal()
                AppNotification.success("Cập nhật loại vật tư thành công");
            }).catch((error) => {
                const errorCode = error.errorCode;
                if (errorCode?.includes(errorCodes.NAME_EXIST)) {
                    setFormErrors({...formErrors, name: errorTexts.DATA_EXIST})
                }
            })
        } else {
            await MaterialTypeApi.create(formCreate).then((res) => {
                refetch()
                closeModal()
                AppNotification.success("Thêm mới loại vật tư thành công");
            }).catch((error) => {
                const errorCode = error.errorCode;
                if (errorCode?.includes(errorCodes.NAME_EXIST)) {
                    setFormErrors({...formErrors, name: errorTexts.DATA_EXIST})
                }
                if (errorCode?.includes(errorCodes.CODE_EXIST)) {
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
        await MaterialTypeApi.delete({id: record.id}).then((res) => {
            AppNotification.success("Xóa loại vật tư thành công");
            refetch()
        }).catch((error) => {
                console.log(error)
            }
        )
    }
    return (
        <React.Fragment>
            <div className="m-[20px] flex">
                <AppCreateButton text={"Thêm mới"} onClick={() => setModalCrete({status: true})}/>
                <AppFilter placeholder={"Tìm kiếm theo mã hoặc tên"} className="w-[25%] ml-auto mr-5"
                           status={formSearch.status} searchText={formSearch.searchText}
                           changeFormSearch={changeFormSearch}/>
            </div>
            <div className={`pl-4 pr-4`}>
                <AppTable
                    columns={columns}
                    dataSource={dataSource(materialTypes?.body, formSearch)}
                    changeFormSearch={changeFormSearch}
                    formSearch={formSearch}
                    totalElement={materialTypes?.total}
                    totalPages={materialTypes?.lastPage}
                />
                <Modal
                    title={` ${
                        modalCreate.id ? "Cập nhật" : "Thêm mới"
                    } loại vật tư - nguyên liệu`}
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
                            <Form.Item label="Mã loại vật tư"
                                       validateStatus={formErrors["code"] ? "error" : ""}
                                       help={formErrors["code"] || ""}
                            >
                                <Input
                                    value={formCreate.code || ""}
                                    onChange={(e) => handleFormUpdate(setFormCreate, setFormErrors, "code", e.target.value)}
                                    size={"large"}

                                />
                            </Form.Item>
                            <Form.Item label="Tên loại vật tư"
                                       validateStatus={formErrors["name"] ? "error" : ""}
                                       help={formErrors["name"] || ""}
                            >
                                <Input size={"large"}
                                       value={formCreate.name || ""}
                                       onChange={(e) => handleFormUpdate(setFormCreate, setFormErrors, "name", e.target.value)}
                                />
                            </Form.Item>
                        </div>
                        <Form.Item label="Mô tả">
                            <TextArea
                                value={formCreate.description || ""}
                                onChange={(e) => handleFormUpdate(setFormCreate, setFormErrors, "description", e.target.value)}
                            />
                        </Form.Item>
                        <Form.Item label="Mô tả">
                            <Checkbox checked={formCreate?.status === "ACTIVE"}
                                      onChange={(value) => handleFormUpdate(setFormCreate, setFormErrors, "status", value.target.checked ? "ACTIVE" : "INACTIVE")}
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

import React, {useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {ParameterTypeApi} from "../../../apis/ParameterType.api";
import {useParameterStore} from "../../../store/storeParameter";
import AppFormPage from "../../../components/AppFormPage/AppFormPage";
import {errorCodes, errorTexts, routes} from "../../../utils/common";
import AppModalForm from "../../../components/AppModal/AppModalForm";
import {Button, Popover, Tag} from "antd";
import {AiOutlineClose} from "react-icons/ai";
import {RiSaveLine} from "react-icons/ri";
import AppInput from "../../../components/AppInput/AppInput";
import {dataSource, handleFormSearch, handleFormUpdate} from "../../../utils/AppUtil";
import AppTextArea from "../../../components/AppTextArea/AppTextArea";
import AppCheckBox from "../../../components/AppCheckBox/AppCheckBox";
import AppCreateButton from "../../../components/AppButton/AppCreateButton";
import AppFilter from "../../../components/AppFilter/AppFilter";
import AppTable from "../../../components/Table/AppTable";
import {ParameterApi} from "../../../apis/Parameter.api";
import {PiDotsThreeOutlineVerticalFill} from "react-icons/pi";
import {AppNotification} from "../../../components/Notification/AppNotification";

export default function Parameter() {
    const nav = useNavigate()
    const location = useLocation();
    const [parameterTypeCode, setParameterTypeCode] = useState(location.pathname.split("/").pop());

    const initialModalCreate = {
        status: false,
        type: "",
        code: "",
    };
    const [modalCreate, setModalCrete] = useState(initialModalCreate);
    const [formSearch, setFormSearch] = useState({
        page: 1,
        limit: 10000,
        status: "",
        searchText: "",
        prTypeCode: location.pathname.split("/").pop()
    });
    const {data: parameterTypes} = ParameterTypeApi.useGetList(formSearch, {staleTime: 0, cacheTime: 0})
    const {data: parameters, refetch} = ParameterApi.useGetList(formSearch, {
        staleTime: 0,
        cacheTime: 0,
        enabled: !!formSearch
    })

    const initialFormCreate = {
        status: "ACTIVE",
        parameterTypeCode: ""
    }
    const [formCreate, setFormCreate] = useState(initialFormCreate);
    const [formErrors, setFormErrors] = useState({})
    useEffect(() => {
        if (modalCreate.code) {
            ParameterApi.detail({code: modalCreate.code}).then((res) => {
                setFormCreate(res.body)
            }).catch((error) => {
                console.log(error);
            })
        }
    }, [modalCreate.code]);


    const content = (record) => {
        return (
            <div className="p-1 pointer">
                <div className="mb-0 p-2 pr-6 hover:bg-red-100"
                     onClick={() => setModalCrete({status: true, code: record.code})}>
                    Chỉnh sửa
                </div>
                <div className="mb-0 p-2 pr-6 hover:bg-red-100" onClick={() => {
                    handleDelete(record);
                }}
                >Xóa
                </div>
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
            title: "Mã loại thông số",
            dataIndex: "code",
            key: "code",
        },
        {
            title: "Tên loại thông số",
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
            title: "Hành động",
            dataIndex: "hanhDong",
            key: "hanhDong",
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
        setModalCrete(initialModalCreate);
        setFormCreate(initialFormCreate)
    };
    const changeFormSearch = (name, value) => {
        handleFormSearch(setFormSearch, name, value)
    };
    const handleSubmit = () => {

        const isValid = formCreate.name;
        if (!isValid) {
            const errors = {
                name: !formCreate.name ? errorTexts.REQUIRE_FIELD : "",
            }
            setFormErrors(errors);
            return
        }
        const req = {
            ...formCreate,
            parameterTypeCode: parameterTypeCode
        }
        if (formCreate.code) {
            ParameterApi.update(req).then((res) => {
                refetch()
                closeModal()
                AppNotification.success("Cập nhật thông số thành công");
            }).catch((error) => {
                const errorCode = error.errorCode;
                if (errorCode?.includes(errorCodes.NAME_EXIST)) {
                    setFormErrors({...formErrors, name: errorTexts.DATA_EXIST})
                }
            })
        } else {
            ParameterApi.create(req).then((res) => {
                refetch()
                closeModal()
                AppNotification.success("Thêm mới thông số thành công");
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

    const handleDelete = (record) => {
        if (record.status === "ACTIVE") {
            AppNotification.error("Chỉ được xóa bản ghi không hoạt động");
            return;
        }
        ParameterTypeApi.delete({code: record.code}).then((res) => {
            AppNotification.success("Xóa thông số thành công");
            refetch()
        }).catch((error) => {
                console.log(error)
            }
        )
    }
    const handleChangeCategory = (code) => {
        nav(routes.PARAMETER + code)
        setFormSearch({...formSearch, prTypeCode: code})
        setParameterTypeCode(code)
    };
    return (
        <AppFormPage title={"Quản lý thông số"} className={"p-2"}>
            <div className={`flex`}>
                {parameterTypes?.body
                    ?.sort((a, b) => new Date(a?.createdDate) - new Date(b?.createdDate)) // Sắp xếp theo createdDate từ cũ đến mới
                    .map((item, index) => (
                        <div
                            key={index}
                            className="ml-4 pointer hover:text-[#c02627] text-base"
                            style={{
                                color: parameterTypeCode.includes(item?.code) ? "#c02627" : null,
                                borderBottom: parameterTypeCode.includes(item?.code) ? "1px #c02627 solid" : null,
                            }}
                            onClick={() => {
                                handleChangeCategory(item?.code);
                            }}
                        >
                            {item?.name}
                        </div>
                    ))}
            </div>
            <div className="m-[20px] flex">
                <AppCreateButton text={"Thêm mới"} onClick={() => setModalCrete({status: true})}/>
                <AppFilter placeholder={"Tìm kiếm theo mã hoặc tên"} className="w-[25%] ml-auto mr-5"
                           status={formSearch.status} searchText={formSearch.searchText}
                           changeFormSearch={changeFormSearch}/>
            </div>
            <AppTable
                columns={columns}
                dataSource={dataSource(parameters?.body, formSearch)}
                changeFormSearch={changeFormSearch}
                formSearch={formSearch}
                totalElement={parameters?.total}
                totalPages={parameters?.lastPage}
            />
            <AppModalForm
                title={` ${
                    modalCreate.id ? "Cập nhật" : "Thêm mới"
                } thông số`}
                isOpen={modalCreate.status}
                action={<div style={{display: "flex", marginTop: 20}}>
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
                </div>}
                onClose={closeModal}
            >
                <form>
                    <div className={`grid grid-cols-2 gap-[4%]`}>
                        <AppInput className={"mb-5"} label={"Mã thông số"} value={formCreate?.code}
                                  show={!!modalCreate.code} disabled={true}/>
                        <AppInput className={"mb-5"} label={"Tên thông số"} value={formCreate?.name}
                                  onChange={(e) => handleFormUpdate(setFormCreate, setFormErrors, "name", e.target.value)}
                                  required={true} error={formErrors?.name}/>
                    </div>
                    <AppTextArea
                        className={"mb-5"}
                        label={"Mô tả"}
                        value={formCreate["description"] || ""}
                        onChange={(e) => handleFormUpdate(setFormCreate, setFormErrors, "description", e.target.value)}
                    />
                    <AppCheckBox
                        checked={formCreate?.status === "ACTIVE"}
                        onChange={(value) => handleFormUpdate(setFormCreate, setFormErrors, "status", value.target.checked ? "ACTIVE" : "INACTIVE")}
                        label="Hoạt động"
                    />
                </form>
            </AppModalForm>
        </AppFormPage>
    );
}

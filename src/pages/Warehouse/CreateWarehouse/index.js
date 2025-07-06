import React, {useEffect, useState} from "react";
import {Form, Link, useNavigate, useParams} from "react-router-dom";
import {WarehouseApi, WarehouseDetailApi} from "../../../apis/Warehouse.api";
import {Breadcrumb, Button, Checkbox, Popconfirm, Popover, Select, Space} from "antd";
import {PiDotsThreeOutlineVerticalFill} from "react-icons/pi";
import AppCreateButton from "../../../components/AppButton/AppCreateButton";
import AppFilterWareHouse from "../../../components/AppFilterWareHouse/AppFilter";
import AppTableWareHouse from "../../../components/TableWareHouse/AppTable";
import {IoIosSend} from "react-icons/io";
import {UserApi} from "apis/User.api";
import {Input} from "postcss";
import TextArea from "antd/es/input/TextArea";
import {AiOutlineClose} from "react-icons/ai";
import {RiSaveLine} from "react-icons/ri";
import {AppNotification} from "components/Notification/AppNotification";
import {handleFormUpdate} from "utils/AppUtil";
import AppInput from "components/AppInput/AppInput";
import AppCheckBox from "components/AppCheckBox/AppCheckBox";
import {errorCodes, errorTexts, routes} from "utils/common";
import AppCancelButton from "components/AppButton/AppCancelButton";
import AppSaveButton from "components/AppButton/AppSaveButton";
import AppTextArea from "components/AppTextArea/AppTextArea";
import AppFormPage from "components/AppFormPage/AppFormPage";
import AppSelect from "components/AppSelect/AppSelect";

export default function CreateWarehouse() {
    const {whCode} = useParams();
    const nav = useNavigate();
    const [searchForm, setSearchForm] = useState({
        whCode: whCode,
    });

    console.log("whCode get param: ", whCode)
    const [wareHouseList, setWareHouseList] = useState([]);

    const {data: wareHouse} = WarehouseApi.useGetList(searchForm, {staleTime: 0, cacheTime: 0});
    useEffect(() => {
        if (wareHouse?.productList !== wareHouseList) {
            setWareHouseList(wareHouse?.productList);
        }
    }, [wareHouse, wareHouseList]);


    const {data: userList} = UserApi.getUserByRole({role: ''})

    const initialModalCreate = {
        whCode: '',
        whName: '',
        userName: '',
        phoneNumber: '',
        whAddress: '',
        whDesc: '',
        status: 'ACTIVE',
        type: '',
        manager: ''
    };
    const [modalCreate, setModalCrete] = useState(initialModalCreate);
    const [formErrors, setFormErrors] = useState({})

    if (whCode) {
        console.log("wareHouse: ", wareHouse)
    }

    useEffect((() => {
        if (whCode) {
            const wareHouseDetail = wareHouse?.searchWareHouseModelList?.find(item => item.whCode === whCode)
            console.log("wareHouse?.searchWareHouseModelList?.filter(item => item.whCode === whCode)", wareHouseDetail);
            setModalCrete({
                ...wareHouseDetail, whDesc: wareHouseDetail?.desc
            });

        }
    }), [whCode, wareHouse])
    const handleSubmit = async (e) => {
        console.log("request ceate ware house = ", modalCreate);

        e.preventDefault();
        const isValid = modalCreate.whCode && modalCreate.whName
        if (!isValid) {
            const errors = {
                code: !modalCreate.whCode ? errorTexts.REQUIRE_FIELD : "",
                name: !modalCreate.whName ? errorTexts.REQUIRE_FIELD : ""
            }
            setFormErrors(errors);
            AppNotification.error(errorTexts.REQUIRE_FIELD);
            return
        }

        if (whCode) {
            await WarehouseApi.update(modalCreate)
                .then(() => {
                    AppNotification.success("cập nhật thành công");
                    nav(routes.WAREHOUSE)
                }).catch((error) => {
                    const errorCode = error.errorCode;
                    if (errorCode?.includes(errorCodes.NAME_EXIST)) {
                        setFormErrors({...modalCreate, name: errorTexts.DATA_EXIST})
                    }
                    if (errorCode?.includes(errorCodes.CODE_EXIST)) {
                        setFormErrors({...modalCreate, code: errorTexts.DATA_EXIST})
                    }
                    console.log(error)

                    AppNotification.error(error.message);
                })
        } else {
            await WarehouseApi.create(modalCreate)
                .then(() => {
                    AppNotification.success("Thêm mới thành công");
                    nav(routes.WAREHOUSE)
                }).catch((error) => {
                    const errorCode = error.errorCode;
                    if (errorCode?.includes(errorCodes.NAME_EXIST)) {
                        setFormErrors({...modalCreate, name: errorTexts.DATA_EXIST})
                    }
                    if (errorCode?.includes(errorCodes.CODE_EXIST)) {
                        setFormErrors({...modalCreate, code: errorTexts.DATA_EXIST})
                    }
                    console.log(error)
                    AppNotification.error(error.message);
                })
        }
    };
    return (
        <AppFormPage title={"Tạo mới kho"} redirect={routes.WAREHOUSE}>
            <form

                // name="validateOnly" layout="vertical" autoComplete="off" onFinish={() => handleSubmit(modalCreate)}
            >
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "48% 48%",
                        gap: "4%",
                    }}
                >

                    <AppInput className={"mb-5"} label={"Mã kho"} value={modalCreate?.whCode}
                              onChange={(e) => handleFormUpdate(setModalCrete, setFormErrors, "whCode", e.target.value)}
                              required={true} error={formErrors?.whCode}/>
                    <AppInput className={"mb-5"} label={"Tên kho"} value={modalCreate?.whName}
                              onChange={(e) => handleFormUpdate(setModalCrete, setFormErrors, "whName", e.target.value)}
                        // required={true}
                              error={formErrors?.whName}/>
                </div>
                {/* ====================================== */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "48% 48%",
                        gap: "4%",
                    }}
                >

                    <div className="w-full">
                        <div className="mb-1">
                            <label htmlFor={"Thủ kho"} className={"text-[14px] text-gray-700 "}>
                                Thủ Kho
                                <span className={"text-red-600"}> * </span>
                            </label>
                        </div>
                        <div
                            className="w-full border-b-[1px] border-b-gray-500 border-[0.5px] border-stone-100 focus-within:border-b-red-700">

                            <Select
                                size="large"
                                className=" w-full custom-select "
                                bordered={false}
                                // placeholder="Thủ kho"
                                labelInValue={true} // Hiển thị fullName thay vì userCode
                                value={
                                    modalCreate?.manager
                                        ? (() => {
                                            const user = userList.find((user) => user.userCode === modalCreate?.userCodeManager);
                                            return user ? {value: user.userCode, label: user.fullName} : undefined;
                                        })()
                                        : undefined
                                }
                                onChange={(value) =>
                                    setModalCrete({...modalCreate, userName: value?.value, userCode: value?.value}) // Chỉ lưu userCode
                                }
                            >
                                {userList?.map((item) => (
                                    <Option key={item.userId} value={item.userCode}>
                                        {item.fullName}
                                    </Option>
                                ))}
                            </Select>
                        </div>

                    </div>


                    <AppInput className={"mb-5"} label={"Số điện thoại"} value={modalCreate?.phoneNumber}
                              onChange={(e) => handleFormUpdate(setModalCrete, setFormErrors, "phoneNumber", e.target.value)}
                              required={true} error={formErrors?.phoneNumber}/>
                </div>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "48% 48%",
                        gap: "4%",
                    }}
                >

                    <AppInput className={"mb-5"} label={"Địa chỉ"} value={modalCreate?.whAddress}
                              onChange={(e) => handleFormUpdate(setModalCrete, setFormErrors, "whAddress", e.target.value)}
                              required={true} error={formErrors?.whAddress}/>
                    <AppInput
                        className={"mb-5"}
                        label={"Mô tả"}
                        value={modalCreate?.whDesc || ""}
                        onChange={(e) => handleFormUpdate(setModalCrete, setFormErrors, "whDesc", e.target.value)}
                    />
                </div>
                <AppCheckBox
                    checked={modalCreate?.status === "ACTIVE"}
                    onChange={(value) => handleFormUpdate(setModalCrete, setFormErrors, "status", value.target.checked ? "ACTIVE" : "INACTIVE")}
                    // className={}
                    label="Hoạt động"
                />

                <div className={"flex mt-10"}>
                    <AppCancelButton
                        className={"mr-4 w-[60px]"}
                        title="Huỷ"
                        onClick={() => nav(routes.WAREHOUSE)}
                    />

                    <AppSaveButton
                        className="w-[60px]"
                        title="Thêm"
                        onClick={(e) => handleSubmit(e)}
                    />
                </div>
            </form>
        </AppFormPage>
    );
}
import {Button, Checkbox, DatePicker, Form, Input, Modal, Popconfirm, Popover, Select, Tag,} from "antd";
import React, {useEffect, useState} from "react";
//import {PiDotsThreeOutlineVerticalFill} from "react-icons/pi";
import {RiSaveLine} from "react-icons/ri";
import {AiOutlineClose} from "react-icons/ai";
import {dataSource, handleFormSearch, handleFormUpdate} from "utils/AppUtil";
import {GrFormPrevious} from "react-icons/gr";
import {UserApi} from "apis/User.api";
import {errorCodes, errorTexts} from "../../../../utils/common";
import {AppNotification} from "../../../../components/Notification/AppNotification";
import dayjs from "dayjs";
import {JobTitleApi} from "../../../../apis/JobTitle.api";
import {DepartmentApi} from "../../../../apis/Department.api";
import {JobPositionApi} from "../../../../apis/JobPosition.api";
import {routes} from "../../../../utils/common";
import {useNavigate} from "react-router-dom";
import {PositionApi} from "../../../../apis/Position.api";
import AppDatePicker from "../../../../components/AppDatePicker/AppDatePicker";

const {Option} = Select;
export default function CreateAccount() {
    const nav = useNavigate()
    const [formSearch, setFormSearch] = useState({
        page: 1,
        limit: 10,
        status: "",
        searchText: "",
    });
    const initialFormCreate = {
        status: "ACTIVE",
        exchangeRateCode: "VND"
    };
    const initialModalCreate = {
        status: false,
        userCode: "",
        typeUpdate: false,
        typeCreate: false
    };
    const WORKING_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Đang làm việc" },
  { value: "INACTIVE", label: "Đã nghỉ việc" },
];

    const [modalCreate, setModalCreate] = useState(initialModalCreate);


    const {data: jobTitles} = JobTitleApi.useGetList({status: "ACTIVE"}, {
        staleTime: 0,
        cacheTime: 0,
       enabled: true
    })
    const {data: departments} = DepartmentApi.useGetList({status: "ACTIVE"}, {
        staleTime: 0,
        cacheTime: 0,
         enabled: true
    })
    const {data: jobPositions} = JobPositionApi.useGetList({status: "ACTIVE"}, {
        staleTime: 0,
        cacheTime: 0,
         enabled: true
    })
    const {data: rankPositions} = PositionApi.useGetList({status: "ACTIVE"}, {
        staleTime: 0,
        cacheTime: 0,
         enabled: true
    })
    const closeModal = () => {
        setModalCreate(initialModalCreate);
        setFormCreate(initialFormCreate);
        setFormErrors({})
    };

    const handleSubmit = async () => {
        const isValid = formCreate.userId && formCreate.fullName && formCreate.email && formCreate.phone && formCreate.birthday
            && formCreate.gender && formCreate.jobPositionCode && formCreate.jobTitleCode && formCreate.departmentCode
            
        if (!isValid) {
            const errors = {
                userId: !formCreate.userId ? errorTexts.REQUIRE_FIELD : "",
                logName: !formCreate.logName ? errorTexts.REQUIRE_FIELD : "",
                password: !formCreate.password ? errorTexts.REQUIRE_FIELD : "",
                fullName: !formCreate.fullName ? errorTexts.REQUIRE_FIELD : "",
                birthday: !formCreate.birthday ? errorTexts.REQUIRE_FIELD : "",
                phone: !formCreate.phone ? errorTexts.REQUIRE_FIELD : "",
                email: !formCreate.email ? errorTexts.REQUIRE_FIELD : "",
                gender: !formCreate.gender ? errorTexts.REQUIRE_FIELD : "",
                departmentCode: !formCreate.departmentCode ? errorTexts.REQUIRE_FIELD : "",
                jobPositionCode: !formCreate.jobPositionCode ? errorTexts.REQUIRE_FIELD : "",
                rankPositionCode: !formCreate.rankPositionCode ? errorTexts.REQUIRE_FIELD : "",
                jobTitleCode: !formCreate.jobTitleCode ? errorTexts.REQUIRE_FIELD : ""
            }
            setFormErrors(errors);
            return
        }
        const request = {
            userId: formCreate?.userId,
            userCode: formCreate?.userCode,
            username: formCreate?.email,
            password: formCreate?.password,
            userPersonalInfo: {
                fullName: formCreate?.fullName,
                email: formCreate?.email,
                phone: formCreate?.phone,
                birthday: formCreate?.birthday,
                gender: formCreate?.gender
            },
            userJobInfo: {
                jobPositionCode: formCreate.jobPositionCode,
                jobTitleCode: formCreate.jobTitleCode,
                jobDepartmentCode: formCreate.departmentCode,
                rankPositions: formCreate.rankPositionCode
            },
            roleCode: "",
            status: formCreate?.status,
        }
        if (formCreate?.userCode) {
            await UserApi.update(request).then((res) => {
                refetch()
                closeModal()
                AppNotification.success("Cập nhật tài khoản thành công");
            }).catch((error) => {
                const message = error?.message;
                if (message) {
                    AppNotification.error(message);
                }
            })
        } else {
            await UserApi.create(request).then((res) => {
                refetch()
                closeModal()
                AppNotification.success("Tạo tài khoản thành công");
            }).catch((error) => {
                const errorCode = error.errorCode;
                if (errorCode?.includes("ADSYS_004")) {
                    setFormErrors({...formErrors, userId: errorTexts.DATA_EXIST, email: errorTexts.DATA_EXIST})
                }
                const messagePass = error?.body?.password;
                if (messagePass) {
                    setFormErrors({...formErrors, password: "Mật khẩu phải chứa 1 chữ in hoa, 1 số, tối thiểu 8 ký tự"})
                }
            })

        }
    }

    const [formErrors, setFormErrors] = useState({})
    const [formCreate, setFormCreate] = useState({...initialFormCreate});
    const {data: accounts, refetch} = UserApi.useSearch(formSearch, {staleTime: 0, cacheTime: 0})

    return (
        <React.Fragment>

            <div>
                <div className={"flex items-center justify-between sticky top-0"}>
                    <div className="flex items-center">
                        <GrFormPrevious className={"pointer text-red-700"} size={30}
                                        onClick={() => nav(routes.ACCOUNT)}/>
                        <span className={"text-xl font-bold text-red-700"}>Thêm mới tài khoản</span>
                    </div>
                    <Form.Item>
                        <div style={{display: "flex", marginTop: 20}}>
                            <Button
                                style={{marginLeft: "auto", marginRight: 10}}
                                key="cancle"
                                title="Huỷ"
                                onClick={closeModal}
                            >
                                <AiOutlineClose/> Hủy
                            </Button>
                            {/* <Popconfirm
                                title="Thông báo"
                                description="Bạn có chắc chắn muốn thêm không ?"
                                 onConfirm={() => {
                                     handleSubmit();
                                 }}
                                okText="Có"
                                cancelText="Không"
                            > </Popconfirm> */}
                            <Button
                                className="button-add-promotion bg-red-700 text-[white]"
                                key="save"
                                onClick={handleSubmit}
                                title="Lưu"
                            >
                                <RiSaveLine/> Lưu lại
                            </Button>

                        </div>
                    </Form.Item>
                </div>
            </div>
            <div className="bg-red-700 h-[2px] w-full my-1"/>

            <Form name="validateOnly" layout="vertical" autoComplete="off">
                <div className="p-5 border-[1px] border-gray-200 rounded-md mb-3">
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "32% 32% 32%",
                            gap: "2%",
                            justifyContent: "center",
                            marginLeft: "auto",
                            marginRight: "auto"
                        }}
                    >
                        <Form.Item
                            label="Mã nhân viên"
                            style={{marginBottom: "12px"}}
                            validateStatus={!modalCreate?.typeUpdate ? (formErrors["userId"] ? "error" : "") : ""}
                            help={!modalCreate?.typeUpdate ? (formErrors["userId"] || "") : ""}>
                            <Input
                                disabled={!!modalCreate?.typeUpdate}
                                size={"large"}
                                placeholder="Mã nhân viên"
                                value={formCreate?.userId}
                                onChange={(e) => handleFormUpdate(setFormCreate, setFormErrors, "userId", e.target.value)}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Tên đăng nhập"
                            style={{marginBottom: "12px"}}
                            validateStatus={!modalCreate?.typeUpdate ? (formErrors["logName"] ? "error" : "") : ""}
                            help={!modalCreate?.typeUpdate ? (formErrors["logName"] || "") : ""}>
                            <Input
                                disabled={!!modalCreate?.typeUpdate}
                                size={"large"}
                                placeholder="Tên đăng nhập"
                                value={formCreate?.userName}
                                onChange={(e) => handleFormUpdate(setFormCreate, setFormErrors, "logName", e.target.value)}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Mật khẩu"
                            style={{marginBottom: "12px"}}
                            validateStatus={!modalCreate?.typeUpdate ? (formErrors["password"] ? "error" : "") : ""}
                            help={!modalCreate?.typeUpdate ? (formErrors["password"] || "") : ""}>
                            <Input
                                disabled={!!modalCreate?.typeUpdate}
                                size={"large"}
                                placeholder="Nhập mật khẩu"
                                value={formCreate?.password}
                                onChange={(e) => handleFormUpdate(setFormCreate, setFormErrors, "password", e.target.value)}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Họ và tên"
                            style={{marginBottom: "12px"}}
                            validateStatus={!modalCreate?.typeUpdate ? (formErrors["fullName"] ? "error" : "") : ""}
                            help={!modalCreate?.typeUpdate ? (formErrors["fullName"] || "") : ""}>
                            <Input
                                disabled={!!modalCreate?.typeUpdate}
                                size={"large"}
                                placeholder="Họ và tên"
                                value={formCreate?.fullName}
                                onChange={(e) => handleFormUpdate(setFormCreate, setFormErrors, "fullName", e.target.value)}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Ngày sinh"
                            style={{marginBottom: "12px"}}
                            validateStatus={formErrors["birthday"] ? "error" : ""}
                            help={formErrors["birthday"] || ""}>
                            <DatePicker
                                size={"large"}
                                className="w-[100%]"
                                value={formCreate?.birthday ? dayjs(formCreate?.birthday, "DD-MM-YYYY") : null}
                                onChange={(value) => handleFormUpdate(setFormCreate, setFormErrors, "birthday", value)}
                                format={"DD-MM-YYYY"}
                                placeholder="Chọn ngày sinh"
                            />
                        </Form.Item>

                        <Form.Item
                            label="Số điện thoại"
                            style={{marginBottom: "12px"}}
                            validateStatus={!modalCreate?.typeUpdate ? (formErrors["phone"] ? "error" : "") : ""}
                            help={!modalCreate?.typeUpdate ? (formErrors["phone"] || "") : ""}>
                            <Input
                                disabled={!!modalCreate?.typeUpdate}
                                size={"large"}
                                placeholder="Nhập số điện thoại"
                                value={formCreate?.phone}
                                onChange={(e) => handleFormUpdate(setFormCreate, setFormErrors, "phone", e.target.value)}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Địa chỉ Email"
                            style={{marginBottom: "12px"}}
                            validateStatus={!modalCreate?.typeUpdate ? (formErrors["email"] ? "error" : "") : ""}
                            help={!modalCreate?.typeUpdate ? (formErrors["email"] || "") : ""}>
                            <Input
                                disabled={!!modalCreate?.typeUpdate}
                                size={"large"}
                                placeholder="Địa chỉ Email" value={formCreate?.email}
                                onChange={(e) => handleFormUpdate(setFormCreate, setFormErrors, "email", e.target.value)}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Giới tính"
                            style={{marginBottom: "12px"}}
                            validateStatus={formErrors["gender"] ? "error" : ""}
                            help={formErrors["gender"] || ""}>
                            <Select
                                size={"large"}
                                className="custom-select"
                                placeholder="Chọn giới tính"
                                value={formCreate?.gender}
                                onChange={(value) => handleFormUpdate(setFormCreate, setFormErrors, "gender", value)}
                                options={[{value: "MALE", label: "Nam"}, {value: "FEMALE", label: "Nữ"}]}/>
                        </Form.Item>

                        <Form.Item
                            label="Phòng ban"
                            style={{marginBottom: "12px"}}
                            validateStatus={formErrors["departmentCode"] ? "error" : ""}
                            help={formErrors["departmentCode"] || ""}>
                            <Select
                                size={"large"}
                                className="custom-select"
                                placeholder="Chọn phòng ban"
                                value={formCreate?.departmentCode}
                                onChange={(value) => handleFormUpdate(setFormCreate, setFormErrors, "departmentCode", value)}>
                                {departments?.body?.map((item) =>
                                    (<Option key={item.code} value={item.code}>{item.name}</Option>))}
                            </Select>
                        </Form.Item>

                        <Form.Item
    label="Trạng thái làm việc"
    style={{marginBottom: "12px"}}
    validateStatus={formErrors["jobPositionCode"] ? "error" : ""}
    help={formErrors?.jobPositionCode}>
    <Select
        size={"large"}
        className="custom-select"
        placeholder="Chọn trạng thái làm việc"
        value={formCreate?.status}
        onChange={(value) => handleFormUpdate(setFormCreate, setFormErrors, "status", value)}
        options={WORKING_STATUS_OPTIONS}
    />
</Form.Item>


                        <Form.Item
                            label="Chức vụ"
                            style={{marginBottom: "12px"}}
                            validateStatus={formErrors["jobPositionCode"] ? "error" : ""}
                            help={formErrors?.jobPositionCode}>
                            <Select
                                size={"large"}
                                className="custom-select"
                                placeholder="Chọn chức vụ"
                                value={formCreate?.positionCode}
                                onChange={(value) => handleFormUpdate(setFormCreate, setFormErrors, "jobPositionCode", value)}>
                                {jobPositions?.body?.map((item) =>
                                    (<Option key={item.code} value={item.code}>{item.name}</Option>))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="Chức danh"
                            style={{marginBottom: "12px"}}
                            validateStatus={formErrors["jobTitleCode"] ? "error" : ""}
                            help={formErrors?.jobTitleCode}>
                            <Select
                                size={"large"}
                                className="custom-select"
                                placeholder="Chọn chức danh"
                                value={formCreate?.jobTitleCode}
                                onChange={(value) => handleFormUpdate(setFormCreate, setFormErrors, "jobTitleCode", value)}>
                                {jobTitles?.body?.map((item) =>
                                    (<Option key={item.code} value={item.code}>{item.name}</Option>))}
                            </Select>
                        </Form.Item>

                
                    </div>
                </div>
            </Form>
        </React.Fragment>
    )
}
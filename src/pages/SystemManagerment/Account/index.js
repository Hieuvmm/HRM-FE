import {Button, Checkbox, DatePicker, Form, Input, Modal, Popconfirm, Popover, Select, Tag,} from "antd";
import React, {useEffect, useState} from "react";
import {PiDotsThreeOutlineVerticalFill} from "react-icons/pi";
import {RiSaveLine} from "react-icons/ri";
import {AiOutlineClose} from "react-icons/ai";
import AppTable from "../../../components/Table/AppTable";
import AppCreateButton from "../../../components/AppButton/AppCreateButton";
import AppFilter from "../../../components/AppFilter/AppFilter";
import {dataSource, handleFormSearch, handleFormUpdate} from "utils/AppUtil";
import {UserApi} from "apis/User.api";
import {errorCodes, errorTexts} from "../../../utils/common";
import {AppNotification} from "../../../components/Notification/AppNotification";
import {JobTitleApi} from "../../../apis/JobTitle.api";
import {DepartmentApi} from "../../../apis/Department.api";
import {JobPositionApi} from "../../../apis/JobPosition.api";
import {useNavigate} from "react-router-dom";
import dayjs from "dayjs";
import {routes} from "../../../utils/common";

const {Option} = Select;
export default function Account() {
    const nav = useNavigate()
    const [formSearch, setFormSearch] = useState({
        page: 1,
        limit: 10,
        status: "",
        searchText: "",
    });
    const [formChangePass, setFormChangePass] = useState({
        action: "CHANGE",
    });

    const initialModalCreate = {
        status: false,
        userCode: "",
        typeUpdate: false,
        typeCreate: false
    };
    const [modalCreate, setModalCreate] = useState(initialModalCreate);

    const initialFormCreate = {
        status: "ACTIVE",
    }
    const [formCreate, setFormCreate] = useState(initialFormCreate);
    const [formErrors, setFormErrors] = useState({});
    const {data: accounts, refetch} = UserApi.useSearch(formSearch, {staleTime: 0, cacheTime: 0})

    const {data: jobTitles} = JobTitleApi.useGetList({status: "ACTIVE"}, {
        staleTime: 0,
        cacheTime: 0,
        enabled: !!modalCreate?.typeUpdate || !!modalCreate?.typeCreate
    })
    const {data: departments} = DepartmentApi.useGetList({status: "ACTIVE"}, {
        staleTime: 0,
        cacheTime: 0,
        enabled: !!modalCreate?.typeUpdate || !!modalCreate?.typeCreate
    })
    const {data: jobPositions} = JobPositionApi.useGetList({status: "ACTIVE"}, {
        staleTime: 0,
        cacheTime: 0,
        enabled: !!modalCreate?.typeUpdate || !!modalCreate?.typeCreate
    })
    const closeModal = () => {
        setModalCreate(initialModalCreate);
        setFormCreate(initialFormCreate);
        setFormErrors({})
    };
    const changeFormSearch = (name, value) => {
        handleFormSearch(setFormSearch, name, value)
    };

    const handleSubmit = async () => {
        const isValid = formCreate.userId && formCreate.fullName && formCreate.email && formCreate.phone && formCreate.birthday
            && formCreate.gender && formCreate.jobPositionCode
            && formCreate.jobTitleCode && formCreate.departmentCode;
        if (!isValid) {
            const errors = {
                userId: !formCreate.userId ? errorTexts.REQUIRE_FIELD : "",
                fullName: !formCreate.fullName ? errorTexts.REQUIRE_FIELD : "",
                email: !formCreate.email ? errorTexts.REQUIRE_FIELD : "",
                phone: !formCreate.phone ? errorTexts.REQUIRE_FIELD : "",
                birthday: !formCreate.birthday ? errorTexts.REQUIRE_FIELD : "",
                gender: !formCreate.gender ? errorTexts.REQUIRE_FIELD : "",
                jobPositionCode: !formCreate.jobPositionCode ? errorTexts.REQUIRE_FIELD : "",
                jobTitleCode: !formCreate.jobTitleCode ? errorTexts.REQUIRE_FIELD : "",
                departmentCode: !formCreate.departmentCode ? errorTexts.REQUIRE_FIELD : "",
                password: !formCreate.password ? errorTexts.REQUIRE_FIELD : ""
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
    const handleDelete = async (record) => {
        if (record.status === "ACTIVE") {
            AppNotification.error("Chỉ được xóa bản ghi không hoạt động");
            return;
        }
        await UserApi.delete({userId: record.userId}).then((res) => {
            AppNotification.success("Xóa tài khoản thành công");
            refetch()
        }).catch((error) => {
                const message = error?.message;
                if (message) {
                    AppNotification.error(message);
                }
            }
        )
    }
    const handleDetail = (record) => {
        const detail = {
            userId: record?.userId,
            userCode: record?.userCode,
            fullName: record?.userPersonalInfo?.fullName,
            gender: record?.userPersonalInfo?.gender,
            email: record?.userPersonalInfo?.email,
            phone: record?.userPersonalInfo?.phone,
            birthday: record?.userPersonalInfo?.birthday,
            username: record?.email,
            jobPositionCode: record?.userJobInfo?.jobPositionCode,
            jobTitleCode: record?.userJobInfo?.jobTitleCode,
            departmentCode: record?.userJobInfo?.jobDepartmentCode,
            status: record?.status,
        }
        setFormCreate(detail)
        if (formCreate) {
            setModalCreate({status: true, userCode: record.userCode, typeUpdate: true})
        }
    }
    const [passwordModal, setPasswordModal] = useState({
        visible: false,
        userId: null,
    });

    const [passwordForm, setPasswordForm] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [passwordErrors, setPasswordErrors] = useState({});

    const openPasswordModal = (record) => {
        console.log("reco " + record.userCode)
        setFormChangePass({...formChangePass, userCode: record.userCode});
        setPasswordModal({visible: true, userId: record.userId, userCode: record?.userCode});
        setPasswordForm({oldPassword: "", newPassword: "", confirmPassword: ""});
        setPasswordErrors({});
    };
    const changeFormPass = (name, value) => {
        handleFormUpdate(setPasswordForm, setPasswordErrors, name, value);
    };
    const closePasswordModal = () => {
        setPasswordModal({visible: false, userId: null});
    };

    const handlePasswordChange = async () => {
        const errors = {};
        if (!passwordForm.oldPassword) errors.oldPassword = "Vui lòng nhập mật khẩu cũ";
        if (!passwordForm.newPassword) errors.newPassword = "Vui lòng nhập mật khẩu mới";
        if (!passwordForm.confirmPassword) errors.confirmPassword = "Vui lòng xác nhận mật khẩu mới";
        if (passwordForm.newPassword && passwordForm.newPassword.length < 8) {
            errors.newPassword = "Mật khẩu mới phải có ít nhất 8 ký tự";
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            errors.confirmPassword = "Mật khẩu xác nhận không khớp";
        }

        if (Object.keys(errors).length > 0) {
            setPasswordErrors(errors);
            return;
        }

        try {

            const req = {
                action: "CHANGE",
                userCode: passwordModal.userCode,
                oldPass: passwordForm.oldPassword,
                newPass: passwordForm.newPassword,
            }
            await UserApi.updatePass(req);
            AppNotification.success("Đổi mật khẩu thành công");
            closePasswordModal();
        } catch (error) {
            const message = error?.message
            if (message) {
                setPasswordErrors({...passwordErrors, oldPassword: "Mật khẩu cũ không đúng"})
            }
        }
    };

    const handleClickChangePass = () => {
        console.log(formChangePass);
        UserApi.updatePass(formChangePass)
            .then((res) => {
                console.log("Thành oông")
            })
            .catch((e) => {
                console.log(e)
            })

    }

    const content = (record) => {
        return (
            <div className="p-1 pointer">
                <div className="mb-0 p-2 pr-6 hover:bg-red-100"
                     onClick={() => openPasswordModal(record)}>
                    Đổi mật khẩu
                </div>
                <div className="mb-0 p-2 pr-6 hover:bg-red-100"
                     onClick={() => handleDetail(record)}>
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
            title: "Mã nhân viên",
            dataIndex: "userId",
            key: "userId",
        },
        {
            title: "Họ & tên",
            dataIndex: "userPersonalInfo",
            render: (text) => text.fullName
        },
        {
            title: "Email",
            dataIndex: "userPersonalInfo",
            render: (text) => text.email
        },
        {
            title: "Phòng ban",
            dataIndex: "departmentCode",
            key: "departmentCode",
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
                <div style={{display: "flex", justifyContent: "center", gap: "10px"}}>
                    <Popover placement="top" content={() => content(record)} overlayInnerStyle={{padding: 0}}>
                        <PiDotsThreeOutlineVerticalFill/>
                    </Popover>
                </div>
            ),
        },
    ];
    return (
        <React.Fragment>
            <div className="m-[20px] flex">
                <AppCreateButton text={"Thêm mới"}
                                 onClick={() => nav(routes.ACCOUNT_CREATE)}/>
                <AppFilter placeholder={"Tìm kiếm theo tên"} className="w-[25%] ml-auto mr-5"
                           status={formSearch.status} searchText={formSearch.searchText}
                           changeFormSearch={changeFormSearch}/>
            </div>
            <div className={`pl-4 pr-4`}>
                <AppTable
                    columns={columns}
                    dataSource={dataSource(accounts?.body, formSearch)}
                    changeFormSearch={changeFormSearch}
                    formSearch={formSearch}
                    totalElement={accounts?.total}
                    totalPages={accounts?.lastPage}
                />
                <Modal
                    title="Đổi mật khẩu"
                    visible={passwordModal.visible}
                    onCancel={closePasswordModal}
                    // onOk={handlePasswordChange}
                    footer={[
                        <div style={{display: "flex", marginTop: 20}}>
                            <Button
                                style={{marginLeft: "auto", marginRight: 10}}
                                key="canclePass"
                                title="Huỷ đổi mật khẩu"
                                onClick={closePasswordModal}
                            >
                                <AiOutlineClose/> Hủy
                            </Button>
                            <Button
                                className="button-add-promotion bg-red-700 text-[white]"
                                key="changePass"
                                title="Đổi mật khẩu"
                                onClick={handlePasswordChange}
                            >
                                <RiSaveLine/> Lưu lại
                            </Button>
                        </div>
                    ]}
                >
                    <Form layout="vertical">
                        <Form.Item label="Mật khẩu hiện tại"
                                   validateStatus={passwordErrors?.oldPassword ? "error" : ""}
                                   help={(passwordErrors?.oldPassword || "")}
                        >
                            <Input.Password
                                value={formChangePass?.oldPassword}
                                onChange={(e) => changeFormPass("oldPassword", e.target.value)}
                                placeholder="Nhập mật khẩu hiện tại"
                            />
                        </Form.Item>
                        <Form.Item label="Mật khẩu mới" validateStatus={passwordErrors.newPassword ? "error" : ""}
                                   help={(passwordErrors?.newPassword || "")}
                        >
                            <Input.Password
                                value={formChangePass?.newPassword}
                                onChange={(e) => changeFormPass("newPassword", e.target.value)}
                                placeholder="Nhập mật khẩu mới"
                            />
                        </Form.Item>
                        <Form.Item label="Nhập lại mật khẩu mới"
                                   validateStatus={passwordErrors.confirmPassword ? "error" : ""}
                                   help={(passwordErrors?.confirmPassword || "")}
                        >
                            <Input.Password
                                value={formChangePass?.confirmPassword}
                                placeholder="Nhập lại mật khẩu mới"
                                onChange={(e) => changeFormPass("confirmPassword", e.target.value)}
                            />
                        </Form.Item>
                    </Form>
                </Modal>

                <Modal
                    title={` ${modalCreate?.typeUpdate ? "Cập nhật" : "Thêm mới"} tài khoản`}
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
                                gridTemplateColumns: modalCreate?.typeUpdate ? "48% 48%" : "28% 32% 32%",
                                gap: "4%",
                            }}
                        >
                            <Form.Item label="Mã nhân viên"
                                       validateStatus={!modalCreate?.typeUpdate ? (formErrors["userId"] ? "error" : "") : ""}
                                       help={!modalCreate?.typeUpdate ? (formErrors["userId"] || "") : ""}
                            >
                                <Input disabled={!!modalCreate?.typeUpdate} size={"large"}
                                       value={formCreate?.userId}
                                       onChange={(e) => handleFormUpdate(setFormCreate, setFormErrors, "userId", e.target.value)}/>
                            </Form.Item>
                            <Form.Item label="Họ và tên"
                                       validateStatus={!modalCreate?.typeUpdate ? (formErrors["fullName"] ? "error" : "") : ""}
                                       help={!modalCreate?.typeUpdate ? (formErrors["fullName"] || "") : ""}
                            >
                                <Input disabled={!!modalCreate?.typeUpdate} size={"large"} value={formCreate?.fullName}
                                       onChange={(e) => handleFormUpdate(setFormCreate, setFormErrors, "fullName", e.target.value)}/>
                            </Form.Item>
                            {!modalCreate.typeUpdate ? (
                                <Form.Item label="Mật khẩu"
                                           validateStatus={formErrors["password"] ? "error" : ""}
                                           help={formErrors["password"] || ""}
                                >
                                    <Input.Password size={"large"} value={formCreate?.password}
                                                    onChange={(e) => handleFormUpdate(setFormCreate, setFormErrors, "password", e.target.value)}/>
                                </Form.Item>
                            ) : null}
                        </div>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "48% 48%",
                                gap: "4%",
                            }}
                        >
                            <Form.Item label="Email"
                                       validateStatus={!modalCreate?.typeUpdate ? (formErrors["email"] ? "error" : "") : ""}
                                       help={!modalCreate?.typeUpdate ? (formErrors["email"] || "") : ""}
                            >
                                <Input disabled={!!modalCreate?.typeUpdate} size={"large"} value={formCreate?.email}
                                       onChange={(e) => handleFormUpdate(setFormCreate, setFormErrors, "email", e.target.value)}/>
                            </Form.Item>
                            <Form.Item label="Số điện thoại"
                                       validateStatus={formErrors["phone"] ? "error" : ""}
                                       help={formErrors["phone"] || ""}
                            >
                                <Input size={"large"} value={formCreate?.phone}
                                       onChange={(e) => handleFormUpdate(setFormCreate, setFormErrors, "phone", e.target.value)}/>
                            </Form.Item>
                        </div>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "48% 48%",
                                gap: "4%",
                            }}
                        >
                            <Form.Item label="Ngày sinh"
                                       validateStatus={formErrors["birthday"] ? "error" : ""}
                                       help={formErrors["birthday"] || ""}
                            >
                                <DatePicker
                                    size={"large"}
                                    className="w-[100%]"
                                    value={formCreate?.birthday ? dayjs(formCreate?.birthday, "DD-MM-YYYY") : null}
                                    onChange={(value) => handleFormUpdate(setFormCreate, setFormErrors, "birthday", value)}
                                    format={"DD-MM-YYYY"}
                                    placeholder="Chọn ngày sinh"
                                />
                            </Form.Item>
                            <Form.Item label="Giới tính"
                                       validateStatus={formErrors["gender"] ? "error" : ""}
                                       help={formErrors["gender"] || ""}
                            >
                                <Select
                                    size={"large"}
                                    className="custom-select"
                                    placeholder="Chọn giới tính"
                                    value={formCreate?.gender}
                                    onChange={(value) => handleFormUpdate(setFormCreate, setFormErrors, "gender", value)}
                                    options={[
                                        {
                                            value: "MALE",
                                            label: "Nam",
                                        },
                                        {
                                            value: "FEMALE",
                                            label: "Nữ",
                                        },
                                    ]}
                                />
                            </Form.Item>
                        </div>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "30% 31% 31%",
                                gap: "4%",
                            }}
                        >
                            <Form.Item label="Phòng ban"
                                       validateStatus={formErrors["departmentCode"] ? "error" : ""}
                                       help={formErrors["departmentCode"] || ""}
                            >
                                <Select
                                    size={"large"}
                                    className="custom-select"
                                    placeholder="Chọn phòng ban"
                                    value={formCreate?.departmentCode}
                                    onChange={(value) => handleFormUpdate(setFormCreate, setFormErrors, "departmentCode", value)}
                                >
                                    {departments?.body?.map((item) => (
                                        <Option key={item.code} value={item.code}>{item.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item label="Chức vụ"
                                       validateStatus={formErrors["jobPositionCode"] ? "error" : ""}
                                       help={formErrors?.jobPositionCode}
                            >
                                <Select
                                    size={"large"}
                                    className="custom-select"
                                    placeholder="Chọn chức vụ"
                                    value={formCreate?.jobPositionCode}
                                    onChange={(value) => handleFormUpdate(setFormCreate, setFormErrors, "jobPositionCode", value)}
                                >
                                    {jobPositions?.body?.map((item) => (
                                        <Option key={item.code} value={item.code}>{item.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item label="Chức danh"
                                       validateStatus={formErrors["jobTitleCode"] ? "error" : ""}
                                       help={formErrors?.jobTitleCode}
                            >
                                <Select
                                    size={"large"}
                                    className="custom-select"
                                    placeholder="Chọn chức danh"
                                    value={formCreate?.jobTitleCode}
                                    onChange={(value) => handleFormUpdate(setFormCreate, setFormErrors, "jobTitleCode", value)}

                                >
                                    {jobTitles?.body?.map((item) => (
                                        <Option key={item.code} value={item.code}>{item.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </div>
                        <Form.Item>
                            <Checkbox checked={formCreate?.status === "ACTIVE"}
                                      onChange={(value) => handleFormUpdate(setFormCreate, setFormErrors, "status", value.target.checked ? "ACTIVE" : "INACTIVE")}
                            >
                                Làm việc
                            </Checkbox>
                        </Form.Item>
                        <Form.Item>
                            <div style={{display: "flex", marginTop: 20}}>
                                <Button
                                    style={{marginLeft: "auto", marginRight: 10}}
                                    key="cancleAccount"
                                    title="Huỷ"
                                    onClick={handlePasswordChange}
                                >
                                    <AiOutlineClose/> Hủy
                                </Button>
                                <Button
                                    className="button-add-promotion bg-red-700 text-[white]"
                                    key="saveAccount"
                                    title="Lưu"
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

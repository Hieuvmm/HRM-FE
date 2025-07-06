import {Button, Modal, Popconfirm, Popover, Tag,} from "antd";
import React, {useEffect, useState} from "react";
import {PiDotsThreeOutlineVerticalFill} from "react-icons/pi";
import {RiSaveLine} from "react-icons/ri";
import {AiOutlineClose} from "react-icons/ai";
import AppTable from "../../../components/Table/AppTable";
import AppFilter from "../../../components/AppFilter/AppFilter";
import {dataSource, handleFormSearch} from "utils/AppUtil";
import {UserApi} from "apis/User.api";
import {errorTexts} from "../../../utils/common";
import {AppNotification} from "../../../components/Notification/AppNotification";
import InfoTab from "./InfoTab/InfoTab";
import JobTab from "./JobTab/JobTab";

export default function UserInfo() {
    const [formSearch, setFormSearch] = useState({
        page: 1,
        limit: 10,
        searchText: "",
        status: ""
    });
    const [totalElement, setTotalElement] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const initialModalCreate = {
        status: false,
        typeUpdate: false
    };
    const [modalCreate, setModalCreate] = useState(initialModalCreate);

    const initialFormCreate = {
        status: "ACTIVE",
    }
    const [formCreate, setFormCreate] = useState(initialFormCreate);
    const [formErrors, setFormErrors] = useState({});
    const [accounts, setAccounts] = useState([])
    const {data: resAccount} = UserApi.useSearch(formSearch, {staleTime: 0, cacheTime: 0})
    useEffect(() => {
        if (resAccount) {
            setAccounts(resAccount?.body)
            setTotalPages(resAccount?.lastPage)
            setTotalElement(resAccount?.total)
        }
    }, [resAccount])

    const closeModal = () => {
        setModalCreate(initialModalCreate);
        setFormCreate(initialFormCreate);
        setFormErrors({})
    };
    const changeFormSearch = (name, value) => {
        handleFormSearch(setFormSearch, name, value)
    };

    const handleSubmit = () => {
        const isValid = formCreate.fullName && formCreate.phone && formCreate.birthday
            && formCreate.jobPositionCode
            && formCreate.jobTitleCode && formCreate.jobDepartmentCode;
        if (!isValid) {
            const errors = {
                fullName: !formCreate.fullName ? errorTexts.REQUIRE_FIELD : "",
                phone: !formCreate.phone ? errorTexts.REQUIRE_FIELD : "",
                birthday: !formCreate.birthday ? errorTexts.REQUIRE_FIELD : "",
                jobPositionCode: !formCreate.jobPositionCode ? errorTexts.REQUIRE_FIELD : "",
                jobTitleCode: !formCreate.jobTitleCode ? errorTexts.REQUIRE_FIELD : "",
                jobDepartmentCode: !formCreate.jobDepartmentCode ? errorTexts.REQUIRE_FIELD : "",
            }
            setFormErrors(errors);
            return
        }
        const request = {
            userId: formCreate.userId,
            userCode: formCreate.userCode,
            userPersonalInfo: {
                fullName: formCreate.fullName,
                personalEmail: formCreate.personalEmail,
                phone: formCreate.phone,
                birthday: formCreate.birthday,
                address: formCreate.address,
                email: formCreate.email,
                gender: formCreate.gender
            },
            userJobInfo: {
                jobPositionCode: formCreate.jobPositionCode,
                jobTitleCode: formCreate.jobTitleCode,
                jobDepartmentCode: formCreate.jobDepartmentCode,
                jobOnboardDate: formCreate.jobOnboardDate,
                jobOfficialDate: formCreate.jobOfficialDate,
                jobManager: formCreate.jobManager,
                jobAddress: formCreate.jobAddress,
            },
            status: formCreate.status,
        }
        UserApi.update(request).then((res) => {
            setAccounts(prev =>
                prev.map((item) => item.userId === request.userId ? request : item)
            )
            closeModal()
            AppNotification.success("Cập nhật thông tin nhân sự thành công");
        }).catch((error) => {
            const message = error?.message;
            if (message) {
                AppNotification.error(message);
            }
        })
    }
    const handleDelete = (record) => {
        if (record.status === "ACTIVE") {
            AppNotification.error("Chỉ được xóa bản ghi không hoạt động");
            return;
        }
        UserApi.delete({userId: record.userId}).then((res) => {
            AppNotification.success("Xóa tài khoản thành công");
            const dataFilter = accounts.filter((item) => item.userId !== record.userId)
            setAccounts(dataFilter)
        }).catch((error) => {
                console.log(error)
            }
        )
    }
    const handleDetail = (record) => {
        const detail = {
            userId: record?.userId,
            userCode: record?.userCode,
            fullName: record?.userPersonalInfo?.fullName,
            email: record?.userPersonalInfo?.email,
            personalEmail: record?.userPersonalInfo?.personalEmail,
            phone: record?.userPersonalInfo?.phone,
            gender: record?.userPersonalInfo?.gender,
            address: record?.userPersonalInfo?.address,
            birthday: record?.userPersonalInfo?.birthday,
            password: record?.password,
            jobPositionCode: record?.userJobInfo?.jobPositionCode,
            jobTitleCode: record?.userJobInfo?.jobTitleCode,
            jobDepartmentCode: record?.userJobInfo?.jobDepartmentCode,
            jobOnboardDate: record?.userJobInfo?.jobOnboardDate,
            jobOfficialDate: record?.userJobInfo?.jobOfficialDate,
            jobManager: record?.userJobInfo?.jobManager,
            jobAddress: record?.userJobInfo?.jobAddress,
            status: record?.status,
        }
        setFormCreate(detail)
        if (formCreate) {
            setModalCreate({status: true, typeUpdate: true})
        }
    }
    const content = (record) => {
        return (
            <div className="p-1 pointer">
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
    const changeFormUpdate = (name, value) => {
        setFormCreate((prev) => (
            {
                ...prev,
                [name]: value
            }
        ))
    }

    const [type, setType] = useState("userInfo");

    const handleGetTab = () => {
        switch (type) {
            case "userInfo":
                return <InfoTab formUpdate={formCreate}
                                changeFormUpdate={changeFormUpdate}
                                formError={formErrors}
                />;
            case "jobInfo":
                return <JobTab formUpdate={formCreate}
                               changeFormUpdate={changeFormUpdate}
                               formError={formErrors}
                               typeUpdate={modalCreate.typeUpdate}/>;
            default:
                return;
        }
    };
    const handleChangeTab = (type) => {
        setType(type);
    };

    return (
        <React.Fragment>
            {/*<div className={"mt-5"}>*/}
            {/*    <span className={"text-xl font-bold text-red-700"}>Quản lý hồ sơ nhân sự</span>*/}
            {/*</div>*/}
            {/*<div className="bg-red-700 h-[2px] w-full my-3"/>*/}
            <div className={"bg-white h-full"}>
                <div className="ml-4 mr-4 mb-1 pt-3 pb-3 flex">
                    <span className={"text-xl font-bold text-red-700"}>Quản lý hồ sơ nhân sự</span>
                    {/*<AppCreateButton text={"Thêm mới"} onClick={() => setModalCreate({status: true, type: "", id: ""})}/>*/}
                    <AppFilter placeholder={"Tìm kiếm theo tên"} className="w-[25%] ml-auto mr-5"
                               status={formSearch.status} searchText={formSearch.searchText}
                               changeFormSearch={changeFormSearch}/>
                </div>
                <div className={`pl-4 pr-4`}>
                    <AppTable
                        columns={columns}
                        dataSource={dataSource(accounts, formSearch)}
                        changeFormSearch={changeFormSearch}
                        formSearch={formSearch}
                        totalElement={totalElement}
                        totalPages={totalPages}
                    />
                    <Modal
                        open={modalCreate.status}
                        onCancel={closeModal}
                        okButtonProps={{style: {display: "none"}}}
                        cancelButtonProps={{style: {display: "none"}}}
                        width={"60%"}
                    >
                        <div>
                            <div
                                className="flex mb-5 border-b-[2px] border-b-red-700 py-[10px] px-[20px]"
                            >
                                <div
                                    className="mr-[30px] pointer hover:text-[#c02627] text-base"
                                    style={{
                                        color: type === "userInfo" ? "#c02627" : null,
                                        borderBottom:
                                            type === "userInfo" ? "1px #c02627 solid" : null,
                                    }}
                                    onClick={() => handleChangeTab("userInfo")}
                                >
                                    Thông tin cá nhân
                                </div>
                                <div
                                    className="mr-[30px] pointer hover:text-[#c02627] text-base"
                                    style={{
                                        color: type === "jobInfo" ? "#c02627" : null,
                                        borderBottom:
                                            type === "jobInfo" ? "1px #c02627 solid" : null,
                                    }}
                                    onClick={() => handleChangeTab("jobInfo")}
                                >
                                    Thông tin công việc
                                </div>

                            </div>
                            <div>{handleGetTab()}</div>
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
                        </div>

                    </Modal>
                </div>
            </div>

        </React.Fragment>
    );
}

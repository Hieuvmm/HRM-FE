import {Button, DatePicker, Form, Input, InputNumber, Popconfirm, Popover, Select, Table, Tag,} from "antd";
import React, {useEffect, useState} from "react";

import {RiSaveLine} from "react-icons/ri";
import {AiOutlineClose} from "react-icons/ai"
import AppCreateButton from "../../../../components/AppButton/AppCreateButton";
import {
    handleCheckEmptyList,
    handleFormUpdate,
    handleLogMessageError,
    isValidImage,
    useHandleAddress,
    useStyle
} from "../../../../utils/AppUtil";
import {errorCodes, errorTexts, routes, statusUtils} from "../../../../utils/common";
import {AppNotification} from "../../../../components/Notification/AppNotification";
import dayjs from "dayjs";
import {UserApi} from "../../../../apis/User.api";
import {FaDeleteLeft} from "react-icons/fa6";
import {TiDeleteOutline} from "react-icons/ti";
import {GrFormPrevious} from "react-icons/gr";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import {ObjectApi} from "../../../../apis/Object.api";
import {ProjectTypeApi} from "../../../../apis/ProjectType.api";
import {ProjectCategoryApi} from "../../../../apis/ProjectCategory.api";
import {MaterialApi} from "../../../../apis/Material.api";
import {ProjectApi} from "../../../../apis/Project.api";
import {AppUploadImage} from "../../../../components/AppUpload/AppUploadImage";

const {TextArea} = Input;
const {Option} = Select;
export default function CreateProject() {
    const {code} = useParams();
    const nav = useNavigate();
    const location = useLocation();
    const pageDetailCheck = location?.pathname?.includes("detail")
    const {styles} = useStyle();
    const {data: provinces} = useHandleAddress()
    const [districts, setDistricts] = useState([])
    const initialFormCreate = {
        status: "ACTIVE",
    }
    const [formCreate, setFormCreate] = useState(initialFormCreate);
    const [formErrors, setFormErrors] = useState({})
    const [projectCategoriesInfo, setProjectCategoriesInfo] = useState([{
        stt: 1,
        status: "CREATED",
        projectCategoryCode: "",
        projectCategoryQuantity: "",
        materialCode: "",
        materialQuantity: "",
        note: "",
    }])
    const [otherInfo, setOtherInfo] = useState([])

    const {data: userInfos} = UserApi.useSearch({
        status: statusUtils.ACTIVE,
    }, {staleTime: 0, cacheTime: 0})

    const {data: customers} = ObjectApi.useGetObjects({page: 1, limit: 100000, status: statusUtils.ACTIVE})
    const {data: projectTypes} = ProjectTypeApi.useGetProjectTypes({page: 1, limit: 100000, status: statusUtils.ACTIVE})
    const {data: projectCategories} = ProjectCategoryApi.useGetProjectCategories({
        page: 1,
        limit: 100000,
        status: statusUtils.ACTIVE
    })

    const {data: materials} = MaterialApi.useGetList({page: 1, limit: 100000, status: statusUtils.ACTIVE})
    useEffect(() => {
        if (code) {
            ProjectApi.detail({"code": code}).then((res) => {
                const dataDetail = res?.body;
                const customerInfo = customers?.body?.find((item) => item.code === res?.body?.customerCode)
                setFormCreate({
                    ...dataDetail,
                    customerName: customerInfo?.name,
                    customerPhone: customerInfo?.phoneNumber,
                    customerProvinceName: provinces.find(item => item.code === customerInfo?.provinceCode)?.name,
                    customerDistrictName: provinces.find(item => item.code === customerInfo?.provinceCode)?.districts.find(item => item.code === customerInfo?.districtCode)?.name,
                    customerAddDetail: customerInfo?.addressDetail,
                })
                setOtherInfo(dataDetail?.otherInfo?.map((item, index) => ({
                    key: index + 1,
                    ...item
                })))
                setProjectCategoriesInfo(dataDetail?.categoryInfo?.map((item, index) => ({
                    stt: index + 1,
                    ...item
                })))


            }).catch((error) => {
                handleLogMessageError(error)
            })
        }
    }, [code]);

    // handle get district list
    useEffect(() => {
        if (formCreate?.provinceCode) {
            console.log(provinces.find((item) => item.code === formCreate.provinceCode))
            const handleGetDistricts = provinces.find((item) => item.code === formCreate.provinceCode)?.districts;
            setDistricts(handleGetDistricts);
            handleFormUpdate(setFormCreate, setFormErrors, "districtCode", '')
        }
    }, [formCreate?.provinceCode])

    //get customer info
    useEffect(() => {
        if (formCreate?.customerCode) {
            const customerInfo = customers?.body?.find((item) => item.code === formCreate.customerCode)
            setFormCreate({
                ...formCreate,
                customerName: customerInfo?.name,
                customerCode: customerInfo?.code,
                customerPhone: customerInfo?.phoneNumber,
                customerProvinceName: provinces.find(item => item.code === customerInfo?.provinceCode)?.name,
                customerDistrictName: provinces.find(item => item.code === customerInfo?.provinceCode)?.districts.find(item => item.code === customerInfo?.districtCode)?.name,
                customerAddDetail: customerInfo?.addressDetail,
            })
        }
    }, [formCreate?.customerCode])
    const handleSubmit = () => {

        const isValid = formCreate.code && formCreate.name && formCreate.projectTypeCode
            && formCreate.technicianCode && formCreate.startDate && formCreate.endDate &&
            formCreate.customerCode && formCreate.provinceCode && formCreate.districtCode && formCreate.addressDetail
            && formCreate.technicianPhone;
        if (!isValid) {
            const errors = {
                code: !formCreate.code ? errorTexts.REQUIRE_FIELD : "",
                name: !formCreate.name ? errorTexts.REQUIRE_FIELD : "",
                projectTypeCode: !formCreate.projectTypeCode ? errorTexts.REQUIRE_FIELD : "",
                technicianCode: !formCreate.technicianCode ? errorTexts.REQUIRE_FIELD : "",
                startDate: !formCreate.startDate ? errorTexts.REQUIRE_FIELD : "",
                endDate: !formCreate.endDate ? errorTexts.REQUIRE_FIELD : "",
                customerCode: !formCreate.customerCode ? errorTexts.REQUIRE_FIELD : "",
                provinceCode: !formCreate.provinceCode ? errorTexts.REQUIRE_FIELD : "",
                districtCode: !formCreate.districtCode ? errorTexts.REQUIRE_FIELD : "",
                addressDetail: !formCreate.addressDetail ? errorTexts.REQUIRE_FIELD : "",
                technicianPhone: !formCreate.technicianPhone ? errorTexts.REQUIRE_FIELD : "",
            }
            setFormErrors(errors);
            AppNotification.error("Điền đầy đủ các thông tin các trường")
            return
        }
        if (otherInfo.length > 0 && !handleCheckEmptyList(otherInfo)) {
            AppNotification.error("Điền đầy đủ các thông tin")
            return;
        }
        if (!handleCheckEmptyList(projectCategoriesInfo, ["note"])) {
            AppNotification.error("Điền đầy đủ thông tin các hạng mục")
            return;
        }
        console.log(formCreate)
        const formData = new FormData();
        // handleAppendFormData(formData, formCreate);
        formData.append('code', formCreate?.code);
        formData.append('name', formCreate?.name);
        formData.append('projectTypeCode', formCreate?.projectTypeCode);
        formData.append('customerCode', formCreate?.customerCode);
        formData.append('startDate', formCreate?.startDate);
        formData.append('endDate', formCreate?.endDate);
        formData.append('provinceCode', formCreate?.provinceCode);
        formData.append('districtCode', formCreate?.districtCode);
        formData.append('addressDetail', formCreate?.addressDetail);
        formData.append('supervisorCode', formCreate?.supervisorCode);
        formData.append('supervisorPhone', formCreate?.supervisorPhone);
        formData.append('technicianCode', formCreate?.technicianCode);
        formData.append('technicianPhone', formCreate?.technicianPhone);
        formData.append('note', formCreate?.note);
        console.log(formCreate?.attachments, formCreate?.urlImage)
        formCreate?.urlImage && formData.append('attachments', formCreate?.attachments);
        projectCategoriesInfo.forEach((category, index) => {
            formData.append(`categoryInfo[${index}].status`, category?.status);
            formData.append(`categoryInfo[${index}].projectCategoryCode`, category?.projectCategoryCode);
            formData.append(`categoryInfo[${index}].projectCategoryQuantity`, category?.projectCategoryQuantity);
            formData.append(`categoryInfo[${index}].materialCode`, category?.materialCode);
            formData.append(`categoryInfo[${index}].materialQuantity`, category?.materialQuantity);
            formData.append(`categoryInfo[${index}].startDate`, category?.startDate);
            formData.append(`categoryInfo[${index}].endDate`, category?.endDate);
            formData.append(`categoryInfo[${index}].technicianCode`, category?.technicianCode);
            formData.append(`categoryInfo[${index}].note`, category?.note);
        });
        otherInfo.forEach((info, index) => {
            formData.append(`otherInfo[${index}].title`, info?.title);
            formData.append(`otherInfo[${index}].value`, info?.value);
        });

        if (code) {
            ProjectApi.update(formData).then((res) => {
                AppNotification.success("Cập nhật công trình thành công");
                nav(routes.PROJECT)
            }).catch((error) => {
                const errorCode = error.errorCode;
                if (errorCode?.includes(errorCodes.NAME_EXIST)) {
                    setFormErrors({...formErrors, name: errorTexts.DATA_EXIST})
                }
            })

        } else {

            ProjectApi.create(formData).then((res) => {
                AppNotification.success("Thêm mới công trình thành công");
                nav(routes.PROJECT)
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


    const handleChooseFile = (file, fileUrl) => {
        if (!isValidImage(file)) {
            AppNotification.error("Bạn đã chọn sai định dạng ảnh, vui lòng chọn lại")
            return;
        }
        setFormCreate({...formCreate, attachments: file, urlImage: fileUrl})
    }

    const changeFormRequest = (name, value) => {
        handleFormUpdate(setFormCreate, setFormErrors, name, value)
    }

    const handleAddProjectCategory = () => {
        setProjectCategoriesInfo((prev) => {
            const requestNew = {
                stt: prev?.length + 1,
                status: "CREATED",
                projectCategoryCode: "",
                projectCategoryQuantity: "",
                materialCode: "",
                materialQuantity: "",
                note: "",
            }
            if (prev?.length === 0 || prev?.length === undefined) {
                return [requestNew];
            } else {
                return [...prev, requestNew]
            }
        })
    }
    const handleDeletePCItem = (record) => {
        setProjectCategoriesInfo((prev) => {
            const filterDelete = prev?.filter(item => item.stt !== record.stt);
            return filterDelete?.map((item, index) => ({
                ...item,
                stt: index + 1
            }))
        })
    }

    const handleChangePCItem = (record, name, value) => {
        setProjectCategoriesInfo((prev) => {
            const index = prev.findIndex(item => item.stt === record.stt);
            if (index === -1) return prev;

            const updatedItems = [...prev];
            updatedItems[index] = {...updatedItems[index], [name]: value};

            console.log(updatedItems);
            return updatedItems;
        })

    }
    const handleChangeOIItem = (record, name, value) => {
        setOtherInfo((prev) => {
            const index = prev.findIndex(item => item.key === record.key);
            if (index === -1) return prev;
            const updatedItems = [...prev];
            updatedItems[index] = {...updatedItems[index], [name]: value};
            return updatedItems;
        })
    }
    const contentSelectStatus = (record) => {
        return (<div className="p-1 pointer">
            <div className="mb-0 p-2 pr-6 hover:bg-red-100"
                 onClick={() => handleChangePCItem(record, "status", "CREATED")}>
                Mới
            </div>
            <div className="mb-0 p-2 pr-6 hover:bg-red-100"
                 onClick={() => handleChangePCItem(record, "status", "HANDLING")}>
                Thi công
            </div>
            <div className="mb-0 p-2 pr-6 hover:bg-red-100"
                 onClick={() => handleChangePCItem(record, "status", "CANCELED")}>
                Hủy
            </div>
            <div className="mb-0 p-2 pr-6 hover:bg-red-100"
                 onClick={() => handleChangePCItem(record, "status", "DONE")}>
                Hoàn thành
            </div>
        </div>)
    };
    const getStatusInfo = (status) => {
        const statusMap = {
            CREATED: {label: "Mới", color: "yellow"},
            HANDLING: {label: "Thi công", color: "blue"},
            CANCELED: {label: "Đã hủy", color: "red"},
            DONE: {label: "Hoàn thành", color: "green"}
        };

        return statusMap[status] || {label: "Unknown", color: "default"};
    };

    const columnCategory = [
        {
            title: "STT", dataIndex: "stt", width: 50, key: "stt", fixed: "left"
        },
        {
            title: "Trạng thái", width: 100, fixed: "left", render: (_, record) => {
                const {label, color} = getStatusInfo(record.status);
                return (
                    <Popover placement="right" title={"Thay đổi trạng thái"}
                             content={() => contentSelectStatus(record)}>
                        <Tag className={"w-[100px] text-center pointer"} color={color}
                             readOnly={pageDetailCheck}>{label}</Tag>
                    </Popover>
                );
            }
        },
        {
            title: "Hạng mục", fixed: "left", render: (_, record) => {
                return (
                    <Select
                        placeholder="Chọn hạng mục"
                        value={record?.projectCategoryCode}
                        onChange={(value) => handleChangePCItem(record, "projectCategoryCode", value)}
                        className="w-[200px] h-[40px]"
                        disabled={pageDetailCheck}
                    >
                        {projectCategories?.body?.map((item) => (<Option key={item.code} value={item.code}>
                            {item.name}
                        </Option>))}
                    </Select>

                );
            },
        }, {
            title: "Số lượng HM", render: (_, record) => {
                return (
                    <InputNumber
                        placeholder="SL"
                        defaultValue={0}
                        value={record?.projectCategoryQuantity}
                        onChange={(value) => handleChangePCItem(record, "projectCategoryQuantity", value)}
                        size={"large"}
                        min={1}
                        readOnly={pageDetailCheck}
                    />

                );
            },
        }, {
            title: "Vật tư", width: 250, render: (_, record) => {
                return (
                    <Select
                        placeholder="Chọn vật tư"
                        className="w-[250px] h-[40px]"
                        value={record?.materialCode}
                        onChange={(value) => handleChangePCItem(record, "materialCode", value)}
                        disabled={pageDetailCheck}
                    >
                        {materials?.body?.map((item) => (<Option key={item.code} value={item.code}>
                            {item.name}
                        </Option>))}
                    </Select>

                );
            },
        }, {
            title: "Số lượng VT", render: (_, record) => {
                return (
                    <InputNumber
                        placeholder="Số lượng vật tư"
                        defaultValue={0}
                        value={record?.materialQuantity}
                        onChange={(value) => handleChangePCItem(record, "materialQuantity", value)}
                        size={"large"}
                        min={1}
                        readOnly={pageDetailCheck}
                    />
                );
            },
        }, {
            title: "Thời gian dự kiến BĐ", width: 250, render: (_, record) => {
                return (
                    <DatePicker
                        className="w-full" size={"large"}
                        value={record?.startDate ? dayjs(record?.startDate) : null}
                        onChange={(value) => handleChangePCItem(record, "startDate", dayjs(value).format("DD-MM-YYYY"))}
                        disabled={pageDetailCheck}
                    />

                );
            },
        }
        , {
            title: "Thời gian dự kiến KT", width: 250, render: (_, record) => {
                return (
                    <DatePicker
                        className="w-full" size={"large"}
                        value={record?.endDate ? dayjs(record?.endDate) : null}
                        onChange={(value) => handleChangePCItem(record, "endDate", dayjs(value).format("DD-MM-YYYY"))}
                        disabled={pageDetailCheck}
                    />

                );
            },
        }
        , {
            title: "KT xử lý", width: 250, render: (_, record) => {
                return (
                    <Select
                        placeholder="Chọn hạng mục"
                        value={record?.technicianCode}
                        onChange={(value) => handleChangePCItem(record, "technicianCode", value)}
                        className="w-[250px] h-[40px]"
                        disabled={pageDetailCheck}
                    >
                        {userInfos?.body?.map((item) => (<Option key={item.userId} value={item.userId}>
                            {item?.userPersonalInfo?.fullName}
                        </Option>))}
                    </Select>
                );
            },
        }, {
            title: "Chú ý đặc biệt", width: 250, render: (_, record) => {
                return (
                    <Input
                        placeholder="Chú ý"
                        value={record?.note}
                        onChange={(e) => handleChangePCItem(record, "note", e.target.value)}
                        size={"large"}
                        readOnly={pageDetailCheck}
                    />

                );
            },
        }, {
            title: " ", align: 'center', fixed: "right", render: (_, record) => {
                return (
                    pageDetailCheck ? null :
                        (projectCategoriesInfo.length > 1 ?
                            <FaDeleteLeft className="pointer" size={20}
                                          onClick={() => handleDeletePCItem(record)}/> : null)
                );
            },
        }];

    const handleAddContentDif = () => {
        const initialOtherInfo = {
            title: "",
            value: ""
        }
        setOtherInfo((prev) => {

            if (prev?.length === 0 || prev?.length === undefined) {
                return [{key: 1, ...initialOtherInfo}]
            } else {
                const data = [...prev, initialOtherInfo]
                return data?.map((item, index) => (
                    {
                        key: index + 1,
                        ...item
                    }
                ))
            }
        })

    }
    const handleDeleteOIItem = (key) => {
        setOtherInfo((prev) => {
            const data = prev.filter((item) => item?.key !== key)
            return data?.map((item, index) => (
                {
                    ...item,
                    key: index + 1
                }
            ))
        })
    }

    return (
        <div className={"py-3"}>
            <div className={"flex items-center"}><GrFormPrevious className={"pointer text-red-700"} size={30}
                                                                 onClick={() => nav(routes.PROJECT)}/> <span
                className={"text-lg font-bold text-red-700"}> {code ? "Cập nhật" : "Tạo mới"} công trình</span></div>
            <div className="bg-red-700 h-[2px] w-full my-3"/>
            <Form name="validateOnly" layout="vertical" autoComplete="off">
                <div className="p-2 border-[1px] border-gray-200 rounded-md">
                    <div className={"h-[35px] bg-gray-200 flex items-center pl-3 text-16 font-bold mb-3"}>Thông tin
                        khách
                        hàng
                    </div>
                    <div
                        style={{
                            display: "grid", gridTemplateColumns: "22% 22% 22% 22%", gap: "4%",
                        }}
                    >
                        <Form.Item
                            label="Mã khách hàng"
                            validateStatus={formErrors["customerCode"] ? "error" : ""}
                            help={formErrors["customerCode"] || ""}
                        >
                            <Select
                                placeholder="Chọn khách hàng"
                                size={"large"}
                                className="custom-select"
                                value={formCreate["customerCode"] || ""}
                                onChange={(value) => changeFormRequest("customerCode", value)}
                                disabled={pageDetailCheck}
                            >
                                {customers?.body?.filter(item => item?.type?.includes("CUSTOMER"))?.map((item) => (
                                    <Option key={item.code} value={item.code}>
                                        {item.code}
                                    </Option>))}
                            </Select>
                        </Form.Item>
                        <Form.Item
                            label="Khách hàng"
                            validateStatus={formErrors["customerCode"] ? "error" : ""}
                            help={formErrors["customerCode"] || ""}
                        >
                            <Select
                                placeholder="Chọn khách hàng"
                                size={"large"}
                                className="custom-select"
                                value={formCreate["customerCode"] || ""}
                                onChange={(value) => changeFormRequest("customerCode", value)}
                                disabled={pageDetailCheck}
                            >
                                {customers?.body?.filter(item => item?.type?.includes("CUSTOMER"))?.map((item) => (
                                    <Option key={item.code} value={item.code}>
                                        {item.name}
                                    </Option>))}
                            </Select>
                        </Form.Item>
                        {/*<Form.Item*/}
                        {/*    label="Tên khách hàng"*/}
                        {/*>*/}
                        {/*    <Input*/}
                        {/*        disabled={true}*/}
                        {/*        placeholder="Tên khách hàng"*/}
                        {/*        value={formCreate?.customerName}*/}
                        {/*        size={"large"}*/}
                        {/*    />*/}
                        {/*</Form.Item>*/}
                        <Form.Item
                            label="SDT khách hàng"
                        >
                            <Input
                                disabled={true}
                                placeholder="SDT khách hàng"
                                value={formCreate?.customerPhone}
                                size={"large"}
                            />
                        </Form.Item>
                        {/* <Form.Item
                            label="Tỉnh/Thành phố"
                        >
                            <Input
                                disabled={true}
                                placeholder="Tỉnh/Thành phố"
                                value={formCreate?.customerProvinceName}
                                size={"large"}/>
                        </Form.Item>
                        <Form.Item
                            label="Huyện/Thị trấn"
                        >
                            <Input
                                disabled={true}
                                placeholder="Huyện/Thị trấn"
                                value={formCreate?.customerDistrictName}
                                size={"large"}/>
                        </Form.Item> */}
                    </div>
                    <div
                        style={{
                            display: "grid", gridTemplateColumns: "22% 22% 48%", gap: "4%",
                        }}
                    >
                        <Form.Item
                            label="Tỉnh/Thành phố"
                        >
                            <Input
                                disabled={true}
                                placeholder="Tỉnh/Thành phố"
                                value={formCreate?.customerProvinceName}
                                size={"large"}/>
                        </Form.Item>
                        <Form.Item
                            label="Huyện/Thị trấn"
                        >
                            <Input
                                disabled={true}
                                placeholder="Huyện/Thị trấn"
                                value={formCreate?.customerDistrictName}
                                size={"large"}/>
                        </Form.Item>
                        <Form.Item label="Địa chỉ cụ thể"
                        >
                            <Input
                                disabled={true}
                                placeholder="Địa chỉ cụ thể"
                                value={formCreate?.customerAddDetail}
                                size={"large"}/>
                        </Form.Item>

                    </div>
                </div>

                <div className="p-2 border-[1px] border-gray-200 rounded-md mt-5">
                    <div className={"h-[35px] bg-gray-200 flex items-center pl-3 text-16 font-bold mb-3"}>Thông tin
                        công
                        trình
                    </div>
                    <div
                        style={{
                            display: "grid", gridTemplateColumns: "22% 22% 22% 22%", gap: "4%",
                        }}
                    >

                        <Form.Item label="Mã công trình"
                                   validateStatus={formErrors["code"] ? "error" : ""}
                                   help={formErrors["code"] || ""}
                        >
                            <Input
                                placeholder="Mã công trình"
                                value={formCreate?.code}
                                onChange={(e) => changeFormRequest("code", e.target.value)}
                                size={"large"}
                                readOnly={pageDetailCheck}
                            />
                        </Form.Item>
                        <Form.Item label="Tên công trình"
                                   validateStatus={formErrors["name"] ? "error" : ""}
                                   help={formErrors["name"] || ""}
                        >
                            <Input
                                placeholder="Tên công trình"
                                value={formCreate?.name}
                                onChange={(e) => changeFormRequest("name", e.target.value)}
                                size={"large"}
                                readOnly={pageDetailCheck}
                            />
                        </Form.Item>
                        <Form.Item label="Ngày bắt đầu"
                                   validateStatus={formErrors["startDate"] ? "error" : ""}
                                   help={formErrors["startDate"] || ""}
                        >
                            <DatePicker
                                className="w-full" size={"large"}
                                value={formCreate?.startDate ? dayjs(formCreate?.startDate) : null}
                                onChange={(value) => changeFormRequest("startDate", dayjs(value).format("DD-MM-YYYY"))}
                                disabled={pageDetailCheck}
                            />
                        </Form.Item>
                        <Form.Item label="Ngày dự kiến kết thúc"
                                   validateStatus={formErrors["endDate"] ? "error" : ""}
                                   help={formErrors["endDate"] || ""}
                        >
                            <DatePicker
                                className="w-full" size={"large"}
                                value={formCreate?.endDate ? dayjs(formCreate?.endDate) : null}
                                onChange={(value) => changeFormRequest("endDate", dayjs(value).format("DD-MM-YYYY"))}
                                disabled={pageDetailCheck}
                            />
                        </Form.Item>
                    </div>
                    {/*dia chi cong trinh*/}
                    <div
                        style={{
                            display: "grid", gridTemplateColumns: "22% 22% 22% 22%", gap: "4%",
                        }}
                    >
                        <Form.Item
                            label="Loại công trình"
                            validateStatus={formErrors["projectTypeCode"] ? "error" : ""}
                            help={formErrors["projectTypeCode"] || ""}
                        >
                            <Select
                                placeholder="Chọn loại công trình"
                                size={"large"}
                                className="custom-select"
                                value={formCreate["projectTypeCode"] || ""}
                                onChange={(value) => changeFormRequest("projectTypeCode", value)}
                                disabled={pageDetailCheck}
                            >
                                {projectTypes?.body?.map((item) => (<Option key={item.code} value={item.code}>
                                    {item.name}
                                </Option>))}
                            </Select>
                        </Form.Item>
                        <Form.Item
                            label="Tỉnh/Thành phố"
                            validateStatus={formErrors["provinceCode"] ? "error" : ""}
                            help={formErrors["provinceCode"] || ""}
                        >
                            <Select
                                placeholder="Chọn tỉnh/thành phố"
                                size={"large"}
                                className="custom-select"
                                value={formCreate?.provinceCode}
                                onChange={(value) => changeFormRequest("provinceCode", value)}
                                disabled={pageDetailCheck}
                            >
                                {provinces?.map((item) => (<Option key={item.code} value={item.code}>
                                    {item.name}
                                </Option>))}
                            </Select>
                        </Form.Item>
                        <Form.Item
                            label="Huyện/Thị trấn"
                            validateStatus={formErrors["districtCode"] ? "error" : ""}
                            help={formErrors["districtCode"] || ""}
                        >
                            <Select
                                placeholder="Chọn huyện/thị trấn"
                                size={"large"}
                                className="custom-select"
                                value={formCreate?.districtCode}
                                onChange={(value) => changeFormRequest("districtCode", value)}
                                disabled={pageDetailCheck}
                            >
                                {districts?.map((item) => (<Option key={item.code} value={item.code}>
                                    {item.name}
                                </Option>))}
                            </Select>
                        </Form.Item>
                        <Form.Item label="Địa chỉ cụ thể"
                                   validateStatus={formErrors["addressDetail"] ? "error" : ""}
                                   help={formErrors["addressDetail"] || ""}
                        >
                            <Input
                                placeholder="Địa chỉ cụ thể"
                                value={formCreate?.addressDetail}
                                onChange={(e) => changeFormRequest("addressDetail", e.target.value)}
                                size={"large"}
                                readOnly={pageDetailCheck}
                            />
                        </Form.Item>

                    </div>

                    {/*giam sat*/}
                    <div
                        style={{
                            display: "grid", gridTemplateColumns: "22% 22% 22% 22%", gap: "4%",
                        }}
                    >
                        <Form.Item
                            label="Người giám sát"
                            validateStatus={formErrors["supervisorCode"] ? "error" : ""}
                            help={formErrors["supervisorCode"] || ""}
                        >
                            <Input
                                placeholder="Người giám sát"
                                value={formCreate?.supervisorCode}
                                onChange={(e) => changeFormRequest("supervisorCode", e.target.value)}
                                size={"large"}
                                readOnly={pageDetailCheck}
                            />
                        </Form.Item>
                        <Form.Item label="SDT giám sát"
                                   validateStatus={formErrors["supervisorPhone"] ? "error" : ""}
                                   help={formErrors["supervisorPhone"] || ""}
                        >
                            <Input
                                placeholder="SDT giám sát"
                                value={formCreate?.supervisorPhone}
                                onChange={(e) => changeFormRequest("supervisorPhone", e.target.value)}
                                size={"large"}
                                readOnly={pageDetailCheck}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Kỹ thuật"
                            validateStatus={formErrors["technicianCode"] ? "error" : ""}
                            help={formErrors["technicianCode"] || ""}
                        >
                            <Select
                                placeholder="Chọn kỹ thuật viên"
                                size={"large"}
                                className="custom-select"
                                value={formCreate?.technicianCode}
                                onChange={(value) => changeFormRequest("technicianCode", value)}
                                disabled={pageDetailCheck}
                            >
                                {userInfos?.body?.map((item) => (
                                    <Option key={item?.userId} value={item?.userId}>
                                        {item?.userPersonalInfo?.fullName}
                                    </Option>))}
                            </Select>
                        </Form.Item>
                        <Form.Item label="SDT kỹ thuật viên"
                                   validateStatus={formErrors["technicianPhone"] ? "error" : ""}
                                   help={formErrors["technicianPhone"] || ""}
                        >
                            <Input
                                placeholder="SDT kỹ thuật viên"
                                value={formCreate?.technicianPhone}
                                onChange={(e) => changeFormRequest("technicianPhone", e.target.value)}
                                size={"large"}
                                readOnly={pageDetailCheck}
                            />
                        </Form.Item>

                    </div>
                </div>

                {/*Thông tin khác*/}

                <div className="p-2 border-[1px] border-gray-200 rounded-md mt-5">
                    <div className={"h-[35px] bg-gray-200 flex items-center pl-3 text-16 font-bold mb-3"}>Thông tin
                        khác
                    </div>
                    {otherInfo?.length > 0 ? (
                        <Form name="validateOnly" layout="vertical" autoComplete="off">
                            <div style={{display: "grid", gridTemplateColumns: "48% 48%", gap: "4%"}}>
                                {otherInfo?.map((item) => (
                                    <div style={{display: "grid", gridTemplateColumns: "30% 66% ", gap: "4%"}}>
                                        <Form.Item label={`Yêu cầu ${item?.key}`}>
                                            <Input
                                                value={item?.title}
                                                size="large"
                                                onChange={(e) => handleChangeOIItem(item, "title", e.target.value)}
                                                readOnly={pageDetailCheck}
                                            />
                                        </Form.Item>
                                        <Form.Item label={`Mô tả ${item?.key}`}>
                                            <div className={"flex gap-1 items-center"}>
                                                <Input
                                                    value={item?.value}
                                                    size="large"
                                                    onChange={(e) => handleChangeOIItem(item, "value", e.target.value)}
                                                    readOnly={pageDetailCheck}
                                                />
                                                {
                                                    pageDetailCheck ? null : <TiDeleteOutline size={25}
                                                                                              onClick={() => handleDeleteOIItem(item?.key)}
                                                                                              color={"red"}
                                                                                              className={"pointer"}/>
                                                }

                                            </div>
                                        </Form.Item>
                                    </div>
                                ))}
                            </div>
                        </Form>
                    ) : "Chưa có thông tin!"}

                    {
                        pageDetailCheck ? null : <AppCreateButton className="mt-4" text={"Thêm nội dung"}
                                                                  onClick={handleAddContentDif}/>
                    }

                </div>

                {/*Thông tin danh mục*/}

                <div className="p-2 border-[1px] border-gray-200 rounded-md my-5">
                    <div className={"h-[35px] bg-gray-200 flex items-center pl-3 text-16 font-bold mb-3"}>Thông tin
                        danh mục
                    </div>
                    {projectCategoriesInfo?.length > 0 ?

                        <Table className={styles.customTable} pagination={false} columns={columnCategory}
                               dataSource={projectCategoriesInfo} scroll={{x: 'max-content'}}/> :
                        <div>Không có dữ liệu</div>}
                    {
                        pageDetailCheck ? null : <AppCreateButton className="mt-4" text={"Thêm hạng mục"}
                                                                  onClick={handleAddProjectCategory}/>
                    }

                </div>
                <Form.Item label="Ghi chú"
                           validateStatus={formErrors["note"] ? "error" : ""}
                           help={formErrors["note"] || ""}
                >
                    <TextArea
                        placeholder="Ghi chú"
                        value={formCreate?.note}
                        onChange={(e) => changeFormRequest("note", e.target.value)}
                        size={"large"}
                        readOnly={pageDetailCheck}
                    />
                </Form.Item>

                <div className="bg-red-700 h-[2px] w-full my-5"/>

                {/*<AppUploadFile onChange={(file) => handleChooseFile(file)}*/}
                {/*               title={"Đính kèm ảnh"} name={formCreate?.attachments?.name}/>*/}
                <AppUploadImage onChange={(file, fileUrl) => handleChooseFile(file, fileUrl)}
                                path={formCreate?.urlImage ? formCreate?.urlImage : formCreate?.attachments ? process.env.VITE_URL_MINIO + formCreate?.attachments : null}
                                disabled={pageDetailCheck}
                />
                <Form.Item>
                    <div style={{display: "flex", marginTop: 20}}>
                        <Button
                            style={{marginLeft: "auto", marginRight: 10}}
                            key="submit"
                            title="Thêm"
                            onClick={() => nav(routes.PROJECT)}
                        >
                            <AiOutlineClose/> Hủy
                        </Button>
                        {!pageDetailCheck && (
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
        </div>
    );
}

import {AppNotification} from "../../../components/Notification/AppNotification";
import {Button, Form, Input, InputNumber, Modal, Select, Table, Tag} from "antd";
import React, {useEffect, useState} from "react";

import {AiOutlineClose} from "react-icons/ai";
import {RiSaveLine} from "react-icons/ri";
import {
    convertCurrencyToWords,
    formatCurrency,
    handleFormUpdate,
    handleLogMessageError,
    useHandleAddress,
    useStyle
} from "../../../utils/AppUtil";
import {GrFormPrevious} from "react-icons/gr";
import {errorTexts, routes, statusUtils} from "../../../utils/common";
import {useNavigate, useParams} from "react-router-dom";
import {ObjectApi} from "../../../apis/Object.api";
import {MaterialApi} from "../../../apis/Material.api";
import {ExchangeRateApi} from "../../../apis/ExchangeRate.api";
import {OrderApi} from "../../../apis/Order.api";

const {Option} = Select;

export default function DetailOrder() {
    const nav = useNavigate();
    const {code} = useParams();
    const {styles} = useStyle();
    const formSearch = {
        page: 1,
        limit: 1000,
        status: "",
        searchText: "",
        keyword: "",
        pageSize: 1000,
        pageNumber: 0,
    };
    const initialFormCreate = {
        status: "ACTIVE",
        exchangeRateCode: "VND"
    };
    const [formCreate, setFormCreate] = useState({...initialFormCreate});
    const [formErrors, setFormErrors] = useState({})
    const [detailMaterial, setDetailMaterial] = useState([]);
    const {data: provinces} = useHandleAddress()

    const {data: customers} = ObjectApi.useGetObjects({page: 1, limit: 100000, status: statusUtils.ACTIVE})
    const {data: resExchangeRates} = ExchangeRateApi.useGetList({...formSearch, status: 'ACTIVE'}, {
        staleTime: 0,
        cacheTime: 0,
    })
    const {data: materials} = MaterialApi.useGetList({page: 1, limit: 10000000, status: statusUtils.ACTIVE}, {
        staleTime: 0,
        cacheTime: 0,
    })
    useEffect(() => {
        if (code && resExchangeRates && customers?.body && provinces?.length) {
            OrderApi.detail({code: code})
                .then((res) => {
                    const customerCode = res?.body?.order?.customerCode;
                    const customerInfo = customers.body.find((item) => item.code === customerCode);

                    setFormCreate({
                        ...res?.body?.order,
                        exchangeRate: resExchangeRates?.body?.find(item => item.code === res?.body?.order?.exchangeRateCode),
                        customerName: customerInfo?.name,
                        customerCode: customerInfo?.code,
                        customerPhone: customerInfo?.phoneNumber,
                        customerProvinceName: provinces.find(item => item.code === customerInfo?.provinceCode)?.name,
                        customerDistrictName: provinces
                            .find(item => item.code === customerInfo?.provinceCode)
                            ?.districts.find(item => item.code === customerInfo?.districtCode)?.name,
                        customerAddDetail: customerInfo?.addressDetail,
                    });

                    const materialOrders = res?.body?.materialOrders?.map((item, index) => {
                        const discount = handelDiscount(item?.discountMaterialModel?.value || 0, item?.price || 0);
                        return {
                            key: index + 1,
                            code: item?.code,
                            name: item?.name,
                            materialType: item?.materialType,
                            unit: item?.unit,
                            specifications: item?.specifications,
                            discountMaterialModel: item?.discountMaterialModel,
                            price: item?.price || 0,
                            quantity: item?.quantity || 0,
                            discountAmt: discount,
                            totalPrice: ((item?.quantity || 0) * (item?.price - discount))
                        }
                    });

                    setTotalAmount(res?.body?.order?.total)

                    setDetailMaterial(materialOrders);
                })
                .catch((err) => {
                    handleLogMessageError(err);
                });
        }
    }, [code, resExchangeRates, customers, provinces]);

    // handel fill value customer
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


    const handelDiscount = (e, priceList) => {
        console.log("record in handelDiscount = ", e)
        console.log("record in priceList = ", priceList)
        let price = 0;
        if (e.valueType === "NUMBER") {
            price = priceList - e.value;
        } else if (e.valueType === "PERCENT") {
            price = priceList - ((priceList / 100) * e.value);
        }

        if (price < 0) {
            price = 0
        }
        return price

    }
    const handleValidation = () => {
        const isValid = formCreate.customerCode && formCreate.customerType && formCreate.orderType
            && formCreate.deliveryMethod && formCreate.exchangeRateCode;

        if (!isValid) {
            const errors = {
                customerCode: !formCreate.customerCode ? errorTexts.REQUIRE_FIELD : "",
                customerType: !formCreate.customerType ? errorTexts.REQUIRE_FIELD : "",
                orderType: !formCreate.orderType ? errorTexts.REQUIRE_FIELD : "",
                deliveryMethod: !formCreate.deliveryMethod ? errorTexts.REQUIRE_FIELD : "",
                exchangeRateCode: !formCreate.exchangeRateCode ? errorTexts.REQUIRE_FIELD : "",
            }
            setFormErrors(errors);
            AppNotification.error("Điền đầy đủ các thông tin các trường")
            return;
        }

        if (detailMaterial?.length <= 0) {
            AppNotification.error("Chọn sản phẩm cho đơn hàng")
            return;
        }
        const checkQuantity = detailMaterial?.filter((item) => item.quantity === 0)
        if (checkQuantity?.length > 0) {
            AppNotification.error("Chọn đầy đủ số lượng cho sản phẩm")
            return;
        }
        handleSubmit()
    }
    const handleSubmit = () => {
        const reqBody = {...formCreate, materialOrders: detailMaterial}
        if (code) {
            OrderApi.update(reqBody).then((res) => {
                AppNotification.success("Cập nhật đơn hàng thành công")
                nav(routes.ORDER_MANAGEMENT)
            }).catch((error) => {
                handleLogMessageError(error);
            })
        } else {
            OrderApi.create(reqBody).then((res) => {
                AppNotification.success("Thêm mới đơn hàng thành công")
                nav(routes.ORDER_MANAGEMENT)
            }).catch((error) => {
                handleLogMessageError(error);
            })
        }
    }

    const changeFormRequest = (name, value) => {
        handleFormUpdate(setFormCreate, setFormErrors, name, value)
    }

    const columns = [
        {
            title: 'STT',
            dataIndex: 'key',
            key: 'key',
            width: 60,
            fixed: "left"
        },

        {
            title: 'Mã sản phẩm',
            dataIndex: 'code',
            key: 'code',
            width: 150,
            fixed: "left",
        },
        {
            title: 'Tên sản phẩm',
            dataIndex: 'name',
            key: 'name',
            width: 200,
            fixed: "left",

        },
        {
            title: 'Loại sản phẩm',
            dataIndex: 'materialType',
            key: 'materialType',
            width: 150,
        },
        {
            title: 'Đơn vị tính',
            dataIndex: 'unit',
            key: 'unit',
            width: 150,
        },
        {
            title: 'Số lượng',
            render: (_, record) => {
                return (
                    <InputNumber
                        size={"large"}
                        min={1}
                        value={record?.quantity}
                        disabled
                    />
                )
            }
        },
        {
            title: 'Thông số',
            dataIndex: 'specifications',
            key: 'specifications',
            width: 200,
            render: (_, record) => {
                const selectedMaterial = materials?.body.find(item => item?.code === record?.code);
                if (!selectedMaterial?.parameterModels) return null;
                if (Array.isArray(selectedMaterial?.parameterModels)) {
                    return (
                        <div>
                            {selectedMaterial.parameterModels.map((param, index) => (
                                <div key={index}>
                                    {param.parameterTypeName}: {param.parameterValue}
                                </div>
                            ))}
                        </div>
                    );
                }
                return selectedMaterial.parameterModels;
            }
        },
        {
            title: "Đơn giá",
            render: (_, record) => formatCurrency(record?.price) || 0
        },
        {
            title: 'Đơn giá CK',
            width: 150,
            render: (_, record) => formatCurrency(record?.discountAmt)
        },
        {
            title: 'Thành tiền',
            width: 150,
            render: (_, record) => formatCurrency(record?.totalPrice || 0)
        }
    ];


    const [totalAmount, setTotalAmount] = useState({})
    const totalAmountChange = formCreate?.exchangeRate?.code === "VND" || !formCreate?.exchangeRateCode || formCreate?.exchangeRateCode === "VND" ? totalAmount : totalAmount / formCreate?.exchangeRate?.value;
    const handleStatusBill = (status) => {
        if (status === "CREATED") {
            return <Tag color={"green"}>Mới</Tag>
        } else if (status === "REVIEWING") {
            return <Tag color="yellow">Chờ duyệt</Tag>
        } else if (status === "REFUSED") {
            return <Tag color="#f50">Đã từ chối</Tag>
        } else if (status === "CANCELED") {
            return <Tag color={"red"}>Đã hủy</Tag>
        } else {
            return <Tag color={"#87d068"}>Hoàn thành</Tag>
        }
    }

    const [reason, setReason] = useState();
    const [statusModalReason, setStatusModalReason] = useState(false);
    const handleOpenReject = () => setStatusModalReason(true);

    const handleApproval = (status, orderCode) => {
        const data = {
            reason: reason,
            status: status,
            orderCode: orderCode
        }

        OrderApi.approval(data)
            .then((res) => {
                AppNotification.success("phê duyệt/từ chối đơn hàng thành công")
                nav(routes.ORDER_MANAGEMENT);
            })
            .catch((e) => {
                AppNotification.error("Xuất hiện lỗi " + e)
            })
        console.log("data: ", data)
    }
    return (
        <div className={"py-3"}>
            <div className={"flex items-center"}><GrFormPrevious className={"pointer text-red-700"} size={30}
                                                                 onClick={() => nav(routes.ORDER_MANAGEMENT)}/> <span
                className={"text-lg font-bold text-red-700"}> {code ? "Cập nhật" : "Tạo mới"} đơn hàng</span></div>
            <div className="bg-red-700 h-[2px] w-full my-3"/>
            <Form name="validateOnly" layout="vertical" autoComplete="off">
                {/**/}
                <div className="p-2 border-[1px] border-gray-200 rounded-md mb-3">
                    <div className={"h-[35px] bg-gray-200 flex items-center pl-3 text-16 font-bold mb-3"}>
                        Trạng thái đơn hàng
                    </div>
                    <div className="flex items-center" style={{
                        gap: 40
                    }}>
                        {
                            handleStatusBill(formCreate?.status)
                        }

                        {
                            formCreate?.status === "REFUSED" && (
                                <>
                                    <div className="text-base font-bold">Lý do từ chối:</div>
                                    <div>{formCreate?.reason}</div>
                                </>
                            )
                        }
                    </div>
                    <div>
                    </div>

                </div>
                <div className="p-2 border-[1px] border-gray-200 rounded-md mb-3">
                    {/*  */}
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
                                disabled
                                className="custom-select"
                                value={formCreate["customerCode"] || ""}
                                onChange={(value) => changeFormRequest("customerCode", value)}
                            >
                                {customers?.body?.filter(item => item?.type?.includes("CUSTOMER"))?.map((item) => (
                                    <Option key={item.code} value={item.code}>
                                        {item.code}
                                    </Option>))}
                            </Select>
                        </Form.Item>
                        <Form.Item
                            label="Tên khách hàng"
                        >
                            <Input
                                disabled={true}
                                placeholder="Tên khách hàng"
                                value={formCreate?.customerName}
                                size={"large"}
                            />
                        </Form.Item>
                        <Form.Item
                            label="SDT khách hàng"
                        >
                            <Input
                                disabled={true}
                                placeholder="SDT khách hàng"
                                value={formCreate?.customerPhone}
                                size={"large"}/>
                        </Form.Item>
                        <Form.Item
                            label="Loại khách hàng"
                            validateStatus={formErrors["customerType"] ? "error" : ""}
                            help={formErrors["customerType"] || ""}
                        >
                            <Select
                                placeholder="Chọn loại khách hàng"
                                size={"large"}
                                disabled
                                className="custom-select"
                                value={formCreate["customerType"] || ""}
                                onChange={(value) => changeFormRequest("customerType", value)}
                                options={[
                                    {
                                        label: "Cấp 1",
                                        value: "LEVEL_1"
                                    },
                                    {
                                        label: "Cấp 2",
                                        value: "LEVEL_2"
                                    },
                                    {
                                        label: "Cấp 3",
                                        value: "LEVEL_3"
                                    },
                                    {
                                        label: "Cấp 4",
                                        value: "LEVEL_4"
                                    },
                                    {
                                        label: "Cấp 5",
                                        value: "LEVEL_5"
                                    },
                                ]}
                            />
                        </Form.Item>
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
                {/**/}
                <div className="p-2 border-[1px] border-gray-200 rounded-md mb-3">
                    <div className={"h-[35px] bg-gray-200 flex items-center pl-3 text-16 font-bold mb-3"}>Thông tin
                        đơn hàng
                    </div>
                    <div
                        style={{
                            display: "grid", gridTemplateColumns: "22% 22% 22% 22%", gap: "4%",
                        }}
                    >
                        <Form.Item label="Loại đơn hàng"
                                   validateStatus={formErrors["orderType"] ? "error" : ""}
                                   help={formErrors["orderType"] || ""}
                        >
                            <Select placeholder={"Chọn loại đơn hàng"}
                                    value={formCreate?.orderType}
                                    disabled
                                    onChange={(value) => changeFormRequest("orderType", value)}
                                    style={{width: "100%"}} size={"large"} options={[
                                {
                                    value: 'SELL',
                                    label: 'Bán hàng'
                                },
                                {
                                    value: 'ESTIMATE',
                                    label: "Báo giá"
                                },
                                {
                                    value: 'CONSTRUCTION',
                                    label: "Thi công"
                                },
                                {
                                    value: 'WARRANTY',
                                    label: 'Bảo hành'
                                },
                                {
                                    value: 'MAINTENANCE',
                                    label: 'Bảo trì'
                                }
                            ]}/>
                        </Form.Item>

                        <Form.Item label="Hình thức giao hàng"
                                   validateStatus={formErrors["deliveryMethod"] ? "error" : ""}
                                   help={formErrors["deliveryMethod"] || ""}
                        >
                            <Select placeholder={"Chọn hình thúc giao hàng"}
                                    value={formCreate?.deliveryMethod}
                                    disabled
                                    onChange={(value) => changeFormRequest("deliveryMethod", value)}
                                    style={{width: "100%"}} size={"large"} options={[
                                {
                                    value: 'DELIVERY_STORE',
                                    label: 'Giao tại cửa hàng'
                                },
                                {
                                    value: 'DELIVERY_ONLINE',
                                    label: 'Giao hàng Online'
                                }
                            ]}/>

                        </Form.Item>
                    </div>
                </div>
                {/**/}
                <div className="p-2 border-[1px] border-gray-200 rounded-md mb-3">
                    <div className={"h-[35px] bg-gray-200 flex items-center pl-3 text-16 font-bold mb-3"}>Thông tin
                        đơn hàng
                    </div>
                    <div>
                        <Table
                            className={styles.customTable}
                            columns={columns}
                            dataSource={detailMaterial}
                            pagination={false}
                            scroll={{
                                y: 400,
                                x: 'max-content'
                            }}
                        />
                        {/* <AppCreateButton className="mt-4" text={"Thêm hàng"}
                                         onClick={() => setModalGetMaterial({...modalGetMaterial, status: true})}/> */}
                    </div>
                </div>
                {/**/}
                <div className="p-2 border-[1px] border-gray-200 rounded-md mb-3">
                    <div className={"h-[35px] bg-gray-200 flex items-center pl-3 text-16 font-bold mb-3"}>Thông tin
                        giá
                    </div>
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "20% 75%",
                        gap: "5%",
                        marginTop: 20
                    }}>
                        <Form.Item label="Tỷ giá"
                                   validateStatus={formErrors["exchangeRateCode"] ? "error" : ""}
                                   help={formErrors["exchangeRateCode"] || ""}
                        >
                            <Select
                                size={"large"}
                                disabled
                                className="custom-select"
                                placeholder="Chọn tỷ giá"
                                value={formCreate?.exchangeRateCode}
                                onChange={(value) => {
                                    handleFormUpdate(setFormCreate, setFormErrors, "exchangeRateCode", value)
                                    const exchangeRate = resExchangeRates?.body?.find(item => item.code === value)
                                    handleFormUpdate(setFormCreate, setFormErrors, "exchangeRate", exchangeRate)
                                }}
                            >
                                {resExchangeRates?.body?.map((type) => (<Option key={type.id} value={type.code}>
                                    {type.name}
                                </Option>))}
                            </Select>
                        </Form.Item>
                        <Form.Item label="">
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "20% 75%",
                                gap: "5%",
                                marginTop: 20,
                                marginBottom: 10
                            }}>
                                <div className="text-base font-bold">Tổng số tiền bằng số:</div>
                                <div>{formatCurrency(totalAmountChange, formCreate?.exchangeRateCode)}</div>
                            </div>
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "20% 75%",
                                gap: "5%",
                            }}>
                                <div className="text-base font-bold">Tổng số tiền bằng chữ:</div>
                                <div>{convertCurrencyToWords(totalAmountChange, formCreate?.exchangeRateCode)}</div>
                            </div>
                        </Form.Item>
                    </div>

                </div>

                <div className="bg-red-700 h-[2px] w-full"/>
                {/* Phê duyệt  */}
                {
                    formCreate?.status === "REVIEWING" && (<Form.Item>
                        <div style={{display: "flex", marginTop: 20}}>
                            <Button
                                style={{marginLeft: "auto", marginRight: 10}}
                                key="reject"
                                title="Thêm"
                                onClick={handleOpenReject}
                            >
                                <AiOutlineClose/> Từ chối
                            </Button>
                            <Button
                                className="button-add-promotion bg-red-700 text-[white]"
                                key="approve"
                                title="Thêm"
                                onClick={() => handleApproval("APPROVAL", formCreate?.code)}
                            >
                                <RiSaveLine/> Phê duyệt
                            </Button>
                        </div>
                    </Form.Item>)
                }

            </Form>

            <Modal
                title="Nhập lý do từ chối"
                open={statusModalReason}
                onCancel={() => setStatusModalReason(false)}
                okButtonProps={{style: {display: "none"}}}
                cancelButtonProps={{style: {display: "none"}}}
            >
                <Form name="validateOnly" layout="vertical" autoComplete="off">
                    {/* <Form.Item label="Địa chỉ cụ thể"> */}
                    <Input
                        // disabled={true}
                        placeholder="Lý do từ chối"
                        onChange={(e) => setReason(e.target.value)}
                        // value={formCreate?.customerAddDetail}
                        size={"large"}/>
                    {/* </Form.Item> */}
                    <Form.Item>
                        <div style={{display: "flex", marginTop: 20}}>
                            <Button
                                style={{marginLeft: "auto", marginRight: 10}}
                                key="cancle"
                                title="Hủy"
                                onClick={() => setStatusModalReason(false)}
                            >
                                <AiOutlineClose/> Hủy
                            </Button>
                            <Button
                                className="button-add-promotion bg-red-700 text-[white]"
                                key="submit"
                                title="Xác nhận"
                                onClick={() => handleApproval("REJECT", formCreate?.code)}
                            >
                                <RiSaveLine/> Xác nhận
                            </Button>
                            {/* </Popconfirm> */}
                        </div>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}




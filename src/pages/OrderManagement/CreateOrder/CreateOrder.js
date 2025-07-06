import {AppNotification} from "../../../components/Notification/AppNotification";
import {Button, DatePicker, Form, Input, InputNumber, Select, Table} from "antd";
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
import AppCreateButton from "../../../components/AppButton/AppCreateButton";
import {FaDeleteLeft} from "react-icons/fa6";
import {MaterialApi} from "../../../apis/Material.api";
import {ExchangeRateApi} from "../../../apis/ExchangeRate.api";
import {OrderApi} from "../../../apis/Order.api";
import TextArea from "antd/es/input/TextArea";
import {WarehouseApi} from "apis/Warehouse.api";
import dayjs from "dayjs";

const {Option} = Select;

export default function CreateOrder() {
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
    const [modalGetMaterial, setModalGetMaterial] = useState({
        status: false,
        positionCode: "JP-001",
        materialTypeCode: "",
        material: {}
    })
    const [detailMaterial, setDetailMaterial] = useState([]);
    const {data: provinces} = useHandleAddress()
    const [wareHouseListName, setWareHouseListName] = useState([]);

    const {data: customers} = ObjectApi.useGetObjects({page: 1, limit: 100000, status: statusUtils.ACTIVE})
    const {data: resExchangeRates} = ExchangeRateApi.useGetList({...formSearch, status: 'ACTIVE'}, {
        staleTime: 0,
        cacheTime: 0,
    })
    const {data: materials} = MaterialApi.useGetList({
        page: 1,
        limit: 10000000,
        whCode: formCreate?.whExport,
        status: statusUtils.ACTIVE
    }, {
        staleTime: 0,
        cacheTime: 0,
    })
    const [formSearchWareHouse] = useState({
        keyword: "",
        pageNumber: "",
        pageSize: "",
        status: "",
    });
    const {data: wareHouseSelect} =
        WarehouseApi.useGetList(formSearchWareHouse);
    useEffect(() => {
        console.log("wareHouseSelect?.searchWareHouseModelList: ", wareHouseSelect?.searchWareHouseModelList)
        setWareHouseListName(wareHouseSelect?.searchWareHouseModelList);
    }, [wareHouseSelect]);

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
                    console.log("formCreate customer", formCreate);

                    const materialOrders = res?.body?.materialOrders?.map((item, index) => ({
                        key: index + 1,
                        code: item?.code,
                        name: item?.name,
                        price: item?.price,
                        quantity: item?.quantity,
                    }));
                    setDetailMaterial(materialOrders);
                })
                .catch((err) => {
                    handleLogMessageError(err);
                });
        }
    }, [code, resExchangeRates, customers, provinces]);

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


    const handleValidation = () => {
        console.log("reqBody", formCreate)
        const isValid = formCreate.customerCode && formCreate.customerType && formCreate.orderType
            && formCreate.deliveryMethod && formCreate.exchangeRateCode && formCreate.whExport
            && formCreate.paidMethod;

        if (!isValid) {
            const errors = {
                customerCode: !formCreate.customerCode ? errorTexts.REQUIRE_FIELD : "",
                customerType: !formCreate.customerType ? errorTexts.REQUIRE_FIELD : "",
                orderType: !formCreate.orderType ? errorTexts.REQUIRE_FIELD : "",
                deliveryMethod: !formCreate.deliveryMethod ? errorTexts.REQUIRE_FIELD : "",
                exchangeRateCode: !formCreate.exchangeRateCode ? errorTexts.REQUIRE_FIELD : "",
                whExport: !formCreate.whExport ? errorTexts.REQUIRE_FIELD : "",
                paidMethod: !formCreate.paidMethod ? errorTexts.REQUIRE_FIELD : "",
                // customerDiscount: !formCreate.customerDiscount ? errorTexts.REQUIRE_FIELD : "",

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
        console.log("reqBody", reqBody)
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
    const changeMaterialDetail = (material, name, value) => {
        setDetailMaterial((prev) => {
            const newPrev = [...prev];
            const index = newPrev.findIndex(item => item.key === material.key);

            if (index !== -1) {
                newPrev[index] = {
                    ...newPrev[index],
                    [name]: value,
                    totalTempAmount: name === "quantity" ? value * (newPrev[index]?.price - discountPrice) : 0
                };
            }
            console.log(newPrev)
            return newPrev;
        })
    }

    const [discountPrice, setDiscountPrice] = useState(0);

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
            render: (_, record, index) => {
                return (
                    <Select
                        size={"large"}
                        placeholder="Chọn sản phẩm"
                        value={record.code}
                        onChange={(value) => {
                            const selectedMaterial = materials?.body.find(item => item.code === value);
                            if (selectedMaterial) {
                                changeMaterialDetail(record, "code", selectedMaterial.code);
                                changeMaterialDetail(record, "name", selectedMaterial.name);
                                changeMaterialDetail(record, "materialType", selectedMaterial.materialType);
                                changeMaterialDetail(record, "price", selectedMaterial.listPrice);
                                changeMaterialDetail(record, "unit", selectedMaterial.unit);
                                // Pass the entire parameterModels array as specifications
                                changeMaterialDetail(record, "specifications", selectedMaterial.parameterModels);
                                changeMaterialDetail(record, "discountMaterialModel", selectedMaterial.discountMaterialModel)
                                setDiscountPrice(handelDiscount(selectedMaterial.discountMaterialModel, selectedMaterial.listPrice))
                            }
                        }}
                    >
                        {materials.body?.map((material) => (
                            <Option key={material.code} value={material.code}>
                                {`${material.name}`}
                            </Option>
                        ))}
                    </Select>
                );
            }
        },
        {
            title: 'Loại sản phẩm',
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
                        onChange={(value) => changeMaterialDetail(record, "quantity", value)}
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
                if (!record.specifications) return null;
                if (Array.isArray(record.specifications)) {
                    return (
                        <div>
                            {record.specifications.map((param, index) => (
                                <div key={index}>
                                    {param.parameterTypeName}: {param.parameterValue}
                                </div>
                            ))}
                        </div>
                    );
                }
                return record.specifications;
            }
        },
        {
            title: "Đơn giá",
            width: 150,
            render: (_, record) => formatCurrency(record?.price) || 0
        },
        {
            title: 'Đơn giá CK',
            width: 150,
            render: (_, record) => formatCurrency(discountPrice) || 0

        },
        {
            title: 'Thành tiền',
            width: 150,
            render: (_, record) => formatCurrency(record?.totalTempAmount) || 0
        },
        {
            title: 'Tác vụ',
            align: 'center',
            fixed: "right",
            width: 100,
            render: (_, record) => {
                return (
                    <div className={"flex items-center justify-center cursor-pointer"}>
                        <FaDeleteLeft size={25} onClick={() =>
                            setDetailMaterial(detailMaterial?.filter(item => item.key !== record.key))
                        }/>
                    </div>
                )
            }
        }
    ];
    const closeModalGetMaterial = () => {
        setModalGetMaterial({
            status: false,
            positionCode: "JP-001",
            materialTypeCode: "",
            material: {}
        })
    }
    const newDetailImMaterial = (newMaterial) => {
        setDetailMaterial((prev) => {
                if (!prev) {
                    return [newMaterial];
                } else {
                    const itemDuplicate = prev?.find(item => item.materialCode === newMaterial.materialCode && item.price === newMaterial.price);
                    if (itemDuplicate) {
                        AppNotification.error("Vật tư đã có trong phiếu")
                        return prev;
                    } else {
                        return [...prev, newMaterial];
                    }
                }
            }
        );
    }
    const handleGetMaterial = () => {
        const newMaterial = {
            key: detailMaterial?.length + 1 || 1,
            code: modalGetMaterial?.material?.code,
            name: modalGetMaterial?.material?.name,
            price: modalGetMaterial?.material?.listPrice || 0,
            quantity: 0,
            materialType: modalGetMaterial?.material?.materialType,
            unit: modalGetMaterial?.material?.unit,
            specifications: modalGetMaterial?.material?.parameterModels,
            total: modalGetMaterial?.material?.total || 0
        };
        newDetailImMaterial(newMaterial);
        closeModalGetMaterial()
    }
    const changeWareHouseCode = (record) => {
        return handleFormUpdate(setFormCreate, setFormErrors, "whExport", record);
    };
    //const totalPrice = detailMaterial ? detailMaterial?.reduce((acc, item) => acc + item?.quantity * item.price, 0) : 0;
    const totalPrice = detailMaterial ? detailMaterial?.reduce((acc, item) => acc + item?.total, 0) : 0;
    const totalPriceChange = formCreate?.exchangeRate?.code === "VND" || !formCreate?.exchangeRateCode ||
    formCreate?.exchangeRateCode === "VND" ? totalPrice : totalPrice / formCreate?.exchangeRate?.value;

    const calculateDiscountAmount = (totalPrice, discountRate) => {
        if (!discountRate || discountRate <= 0) return 0;
        return totalPrice * (discountRate / 100);
    };
    useEffect(() => {
        const discountAmount = calculateDiscountAmount(totalPriceChange, formCreate.discountRate);
        const totalAfterDiscount = totalPriceChange - discountAmount;
        const taxAmount = calculateTaxAmount(totalAfterDiscount, formCreate.tax);
        const totalAfterTax = totalAfterDiscount + taxAmount;
        const remainingPayment = totalAfterTax - (formCreate?.advanceAmount || 0);

        setFormCreate((prev) => ({
            ...prev,
            discountAmount: discountAmount,
            totalAfterDiscount: totalAfterDiscount,
            taxAmount: taxAmount,
            totalAfterTax: totalAfterTax,
            totalPayment: remainingPayment
        }));
    }, [formCreate.discountRate, formCreate.tax, formCreate.advanceAmount, totalPriceChange]);

    const totalAfterDiscount = totalPriceChange - (formCreate?.discountAmount || 0);
    const calculateTaxAmount = (totalAfterDiscount, taxRate) => {
        if (!taxRate || taxRate <= 0) return 0;
        return totalAfterDiscount * (taxRate / 100);
    };

    const formatNumberWithCommas = (value) => {
        if (isNaN(value) || value === null || value === undefined) return "";
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const parseNumberFromFormattedString = (formattedValue) => {
        return Number(formattedValue.replace(/\./g, ""));
    };

    return (
        <div className={"py-3"}>
            <div className={"flex items-center"}><GrFormPrevious className={"pointer text-red-700"} size={30}
                                                                 onClick={() => nav(routes.ORDER_MANAGEMENT)}/> <span
                className={"text-lg font-bold text-red-700"}> {code ? "Cập nhật" : "Tạo mới"} đơn hàng</span></div>
            <div className="bg-red-700 h-[2px] w-full my-3"/>
            <Form name="validateOnly" layout="vertical" autoComplete="off">
                <div className="p-2 border-[1px] border-gray-200 rounded-md mb-3">
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

                        <Form.Item
                            label="Kho xuất"
                            validateStatus={formErrors["whExport"] ? "error" : ""}
                            help={formErrors["whExport"] || ""}
                        >
                            <Select
                                placeholder="Chọn kho xuất"
                                size={"large"}
                                className="custom-select"
                                // value={formCreate["whExport"] || ""}
                                value={formCreate?.whExport}
                                onChange={(value) => changeFormRequest("whExport", value)}

                            >
                                {Array.isArray(wareHouseListName) &&
                                    wareHouseListName.length > 0 &&
                                    wareHouseListName.map((item) => (
                                        <Option key={item.whCode} value={item.whCode}>
                                            {item.whName}
                                        </Option>
                                    ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="Hình thức thanh toán"
                            validateStatus={formErrors["paidMethod"] ? "error" : ""}
                            help={formErrors["paidMethod"] || ""}
                        >
                            <Select
                                placeholder="Chọn hình thức thanh toán"
                                size={"large"}
                                value={formCreate?.paidMethod}
                                onChange={(value) => changeFormRequest("paidMethod", value)}
                                className="custom-select"
                                options={[
                                    {
                                        value: 'BANKING',
                                        label: 'Chuyển khoản'
                                    },
                                    {
                                        value: 'CASH',
                                        label: 'Tiền mặt'
                                    }
                                ]}
                            />
                        </Form.Item>
                    </div>
                    <Form.Item label="Ghi chú">
                        <TextArea
                            value={formCreate?.note}
                            onChange={(e) => handleFormUpdate(setFormCreate, setFormErrors, "note", e.target.value)}
                            size={"large"}
                        />
                    </Form.Item>
                </div>

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
                        <AppCreateButton className="mt-4" text={"Thêm hàng"}
                                         onClick={() => handleGetMaterial()}/>
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
                                <div>{formatCurrency(totalPriceChange, formCreate?.exchangeRateCode)}</div>
                            </div>
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "20% 75%",
                                gap: "5%",
                            }}>
                                <div className="text-base font-bold">Tổng số tiền bằng chữ:</div>
                                <div>{convertCurrencyToWords(totalPriceChange, formCreate?.exchangeRateCode)}</div>
                            </div>
                        </Form.Item>
                    </div>
                    <div
                        style={{
                            display: "grid", gridTemplateColumns: "22% 22% 22% 22%", gap: "4%",
                        }}
                    >
                        <Form.Item label="Tỷ lệ chiết khấu %">
                            <Input
                                type="number"
                                min={1}
                                value={formCreate?.discountRate || ""}
                                validateStatus={formErrors["discountRate"] ? "error" : ""}
                                help={formErrors["discountRate"] || ""}
                                onChange={(e) => handleFormUpdate(setFormCreate, setFormErrors, "discountRate", e.target.value)}
                                size={"large"}

                            />
                        </Form.Item>
                        <Form.Item label="Thuế suất / thuế GTGT (%)">
                            <Input
                                type="number"
                                min={1}
                                value={formCreate?.tax || ""}
                                onChange={(e) => handleFormUpdate(setFormCreate, setFormErrors, "tax", e.target.value)}
                                size={"large"}
                            />
                        </Form.Item>
                        <Form.Item label="Ngày tạm ứng">
                            <DatePicker
                                format="DD/MM/YYYY"
                                // disabled={modalCreate.type == "detail_ex"}
                                value={
                                    formCreate?.advanceDate
                                        ? dayjs(formCreate?.advanceDate, "DD/MM/YYYY")
                                        : null
                                }
                                className="w-full"
                                size={"large"}
                                onCalendarChange={(date) =>
                                    handleFormUpdate(
                                        setFormCreate,
                                        setFormErrors,
                                        "advanceDate",
                                        date.format("DD/MM/YYYY")
                                    )
                                }
                            />
                        </Form.Item>
                        <Form.Item label="Số tiền chiết khấu">
                            <Input size={"large"}
                                   value={formatCurrency(formCreate?.discountAmount || 0)}
                                   disabled
                            />
                        </Form.Item>
                        <Form.Item label="Cộng tiền hàng (Trừ CK)">
                            <Input size={"large"}
                                   value={formatCurrency(formCreate?.totalAfterDiscount || 0)}
                                   disabled
                            />
                        </Form.Item>
                        <Form.Item label="Tổng tiền sau thuế GTGT">
                            <Input size={"large"}
                                   value={formatCurrency(formCreate?.totalAfterTax || 0)}
                                   disabled
                            />
                        </Form.Item>
                        <Form.Item label="Số tiền đã tạm ứng">
                            <Input size={"large"}
                                   value={formatNumberWithCommas(formCreate?.advanceAmount)}
                                   onChange={(e) => {
                                       const rawValue = parseNumberFromFormattedString(e.target.value);
                                       handleFormUpdate(setFormCreate, setFormErrors, "advanceAmount", rawValue);
                                   }}
                            />
                        </Form.Item>
                        <Form.Item label="Số còn phải thanh toán">
                            <Input size={"large"}
                                   value={formatCurrency(formCreate?.totalPayment || 0)}
                                   disabled
                            />
                        </Form.Item>
                    </div>
                </div>

                {/**/}
                <div className="bg-red-700 h-[2px] w-full"/>
                <Form.Item>
                    <div style={{display: "flex", marginTop: 20}}>
                        <Button
                            style={{marginLeft: "auto", marginRight: 10}}
                            key="cancle"
                            title="Thêm"
                            onClick={() => nav(routes.PARTNER)}
                        >
                            <AiOutlineClose/> Hủy
                        </Button>
                        {"detail" && (
                            <Button
                                className="button-add-promotion bg-red-700 text-[white]"
                                key="save"
                                title="Thêm"
                                onClick={
                                    handleValidation
                                }
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




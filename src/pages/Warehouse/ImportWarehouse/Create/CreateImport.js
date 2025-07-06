import {Button, DatePicker, Form, Input, InputNumber, Modal, Popconfirm, Select, Table,} from "antd";
import React, {useEffect, useState} from "react";
import {RiSaveLine} from "react-icons/ri";
import {AiOutlineClose} from "react-icons/ai";
import {AppNotification} from "../../../../components/Notification/AppNotification";
import AppCreateButton from "../../../../components/AppButton/AppCreateButton";
import {convertCurrencyToWords, formatCurrency, handleFormUpdate, useStyle} from "../../../../utils/AppUtil";
import {errorCodes, errorTexts, routes} from "../../../../utils/common";
import {ExchangeRateApi} from "../../../../apis/ExchangeRate.api";
import {ProviderApi} from "../../../../apis/Provider.api";
import {FaDeleteLeft} from "react-icons/fa6";
import {MaterialTypeApi} from "../../../../apis/MaterialType.api";
import {MaterialApi} from "../../../../apis/Material.api";
import {ImportBillApi} from "../../../../apis/ImportBill.api";
import dayjs from "dayjs";
import {WarehouseApi} from "../../../../apis/Warehouse.api";
import {useNavigate, useParams} from "react-router-dom";
import {GrFormPrevious} from "react-icons/gr";
import {ObjectApi} from "../../../../apis/Object.api";

const {Option} = Select
const {TextArea} = Input;
export default function CreateImport() {
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
        pageNumber: 1,
    };
    const [detailImMaterial, setDetailImMaterial] = useState([]);
    const [formCreate, setFormCreate] = useState({
        exchangeRateCode: "VND",
    });
    const [formErrors, setFormErrors] = useState({})
    const [modalGetMaterial, setModalGetMaterial] = useState({
        status: false,
        positionCode: "JP-001",
        materialTypeCode: "",
        material: {}
    })
    const [materials, setMaterials] = useState([]);
    const {data: resExchangeRates} = ExchangeRateApi.useGetList({...formSearch, status: 'ACTIVE'}, {
        staleTime: 0,
        cacheTime: 0,
    })
    const {data: resProviders} = ObjectApi.useGetObjects({...formSearch, status: 'ACTIVE', type: "PROVIDER"}, {
        staleTime: 0,
        cacheTime: 0,
    })
    const {data: resMaterialTypes} = MaterialTypeApi.useGetMaterialTypes({
        ...formSearch,
        status: 'ACTIVE'
    }, {staleTime: 0, cacheTime: 0})
    const {data: resWarehouses} = WarehouseApi.useGetList({...formSearch, status: 'ACTIVE'}, {
        staleTime: 0,
        cacheTime: 0,
    })
    const {data: resDetailImport} = ImportBillApi.useGetDetail({code: code}, {
        staleTime: 0,
        cacheTime: 0,
    })

    useEffect(() => {
        if (resDetailImport) {
            setFormCreate(resDetailImport)
            const dataDetailImport = resDetailImport?.detailImportMaterials?.map((item, index) => (
                {
                    key: index + 1,
                    ...item
                }
            ))
            setDetailImMaterial(dataDetailImport)
        }
    }, [resDetailImport]);


    useEffect(() => {
        if (modalGetMaterial.materialTypeCode) {
            MaterialApi.fetchByCondition(modalGetMaterial).then((res) => {
                setMaterials(res.body)
            }).catch((error) => {
                console.log(error);
            })
        }
    }, [modalGetMaterial.materialTypeCode]);


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
            dataIndex: 'materialCode',
            key: 'materialCode',
            width: 150,
            fixed: "left"
        },
        {
            title: 'Tên sản phẩm',
            dataIndex: 'materialName',
            key: 'materialName',
            width: 150,
            fixed: "left"
        },
        {
            title: 'Loại sản phẩm',
            dataIndex: 'materialTypeName',
            key: 'materialTypeName',
            width: 150,
        },
        {
            title: 'Thông số',
            dataIndex: 'parameter',
            width: 150,
        },
        {
            title: 'Đơn vị tính',
            dataIndex: 'unitTypeName',
            key: 'unitTypeName',
        },
        {
            title: 'Số lượng',
            children: [
                {
                    title: 'Chứng từ',
                    dataIndex: 'expectedQuantity',
                    render: (_, record) => {
                        return (
                            <InputNumber
                                size={"large"}
                                min={1}
                                value={record?.expectedQuantity}
                                onChange={(value) => changeMaterialDetail(record, "expectedQuantity", value)}
                            />
                        )
                    }
                },
                {
                    title: 'Thực nhập',
                    dataIndex: 'realQuantity',
                    render: (_, record) => {
                        return (
                            <InputNumber
                                size={"large"}
                                min={1}
                                value={record?.realQuantity}
                                onChange={(value) => changeMaterialDetail(record, "realQuantity", value)}
                            />
                        )
                    }
                },
            ],
        },
        {
            title: 'Giá bán',
            children: [
                {
                    title: "Đơn giá",
                    render: (_, record) => formatCurrency(record?.price) || 0
                },
                {
                    title: 'Thành tiền',
                    width: 150,
                    render: (_, record) => formatCurrency(record?.realQuantity * record?.price) || 0
                },
            ],
        },
        {
            title: 'Tác vụ',
            align: 'center',
            width: 80,
            fixed: "right",
            render: (_, record) => {
                return (
                    <div className={"flex items-center justify-center cursor-pointer"}>
                        <FaDeleteLeft size={25} onClick={() =>
                            setDetailImMaterial(detailImMaterial?.filter(item => item.key !== record.key))
                        }/>
                    </div>
                )
            }
        }
    ];

    const changeMaterialDetail = (material, name, value) => {
        setDetailImMaterial((prev) => {
            const newPrev = [...prev];
            const index = newPrev.findIndex(item => item.key === material.key);

            if (index !== -1) {
                newPrev[index] = {
                    ...newPrev[index],
                    [name]: value
                };
            }

            return newPrev;
        })
    }

    const handleSubmit = () => {
        const isValid = formCreate?.code && formCreate?.orderCode && formCreate?.importDate
            && formCreate?.orderDate && formCreate?.importContent && formCreate?.providerCode
            && formCreate?.exchangeRateCode && formCreate?.deliveryMethod && formCreate?.warehouseCode;
        if (!isValid) {
            const errors = {
                code: !formCreate?.code ? errorTexts.REQUIRE_FIELD : "",
                orderCode: !formCreate?.orderCode ? errorTexts.REQUIRE_FIELD : "",
                importDate: !formCreate?.importDate ? errorTexts.REQUIRE_FIELD : "",
                orderDate: !formCreate?.orderDate ? errorTexts.REQUIRE_FIELD : "",
                importContent: !formCreate?.importContent ? errorTexts.REQUIRE_FIELD : "",
                providerCode: !formCreate?.providerCode ? errorTexts.REQUIRE_FIELD : "",
                exchangeRateCode: !formCreate?.exchangeRateCode ? errorTexts.REQUIRE_FIELD : "",
                deliveryMethod: !formCreate?.deliveryMethod ? errorTexts.REQUIRE_FIELD : "",
                warehouseCode: !formCreate?.warehouseCode ? errorTexts.REQUIRE_FIELD : ""
            }
            setFormErrors(errors);
            return
        }
        if (detailImMaterial.length === 0) {
            AppNotification.error("Chọn vật tư cho phiếu nhập");
            return;
        }

        const request = {
            ...formCreate,
            // importDate: dayjs(formCreate?.importDate).format('DD/MM/YYYY'),
            // orderDate: dayjs(formCreate?.orderDate).format('DD/MM/YYYY'),
            detailImportMaterials: detailImMaterial
        }
        if (code) {
            ImportBillApi.update(request).then((res) => {
                nav(routes.IM_WAREHOUSE)
                AppNotification.success("Cập nhật phiếu nhập kho thành công");
            }).catch((error) => {
                const errorCode = error.errorCode;
                if (errorCode?.includes(errorCodes.CODE_EXIST)) {
                    setFormErrors({...formErrors, code: errorTexts.DATA_EXIST})
                }
            })
        } else {
            ImportBillApi.create(request).then((res) => {
                nav(routes.IM_WAREHOUSE)
                AppNotification.success("Tạo phiếu nhập kho thành công");
            }).catch((error) => {
                const errorCode = error.errorCode;
                if (errorCode?.includes(errorCodes.CODE_EXIST)) {
                    setFormErrors({...formErrors, code: errorTexts.DATA_EXIST})
                }
            })
        }


    }
    const handleGetMaterial = () => {
        const newMaterial = {
            key: detailImMaterial?.length + 1 || 1,
            materialCode: modalGetMaterial.material.code,
            materialName: modalGetMaterial.material.name,
            materialTypeCode: modalGetMaterial.material.materialTypeCode,
            materialTypeName: modalGetMaterial.material.materialTypeName,
            unitTypeCode: modalGetMaterial.material.unitTypeCode,
            unitTypeName: modalGetMaterial.material.unitTypeName,
            expectedQuantity: "",
            realQuantity: "",
            price: modalGetMaterial.material.price,
            parameter: modalGetMaterial.material.parameter,
            total: ""
        };


        // setDetailImMaterial((prev) => (prev?.length === 0 ? [newMaterial] : [...prev, newMaterial]));
        newDetailImMaterial(newMaterial);
        closeModalGetMaterial()
    }
    const newDetailImMaterial = (newMaterial) => {
        setDetailImMaterial((prev) => {
                if (!prev) {
                    return [newMaterial];
                } else {
                    const itemDuplicate = prev?.find(item => item.materialCode === newMaterial.materialCode && item.price === newMaterial.price);
                    if (itemDuplicate) {
                        AppNotification.error("Vật tư đã có trong phiếu")
                        return prev;
                        // return prev.map(item =>
                        //     item === itemDuplicate
                        //         ? { ...item, quantity: item.quantity + newMaterial.quantity }
                        //         : item
                        // );
                    } else {
                        return [...prev, newMaterial];
                    }
                }
            }
        );
    }


    const closeModalGetMaterial = () => {
        setModalGetMaterial({
            status: false,
            positionCode: "JP-001",
            materialTypeCode: "",
            material: {}
        })
        setMaterials([])
    }
    const totalPrice = detailImMaterial ? detailImMaterial?.reduce((acc, item) => acc + item.realQuantity * item.price, 0) : 0;
    const totalPriceChange = formCreate?.exchangeRate?.code === "VND" || !formCreate?.exchangeRateCode ||
    formCreate?.exchangeRateCode === "VND" ? totalPrice : totalPrice / formCreate?.exchangeRate?.value;

    return (
        <div className={"py-3"}>
            <div className={"flex items-center justify-between sticky top-0 bg-white z-10 p-2"}>
                <div className="flex items-center">
                    <GrFormPrevious className={"pointer text-red-700"} size={30}
                                    onClick={() => nav(routes.IM_WAREHOUSE)}/>
                    <span className={"text-lg font-bold text-red-700"}>
                        {code ? "Cập nhật" : "Tạo mới"} phiếu nhập
                    </span>
                </div>
                <Form.Item>
                    <div style={{display: "flex"}}>
                        <Button
                            style={{marginRight: 10}}
                            key="submit"
                            title="Thêm"
                            onClick={() => nav(routes.IM_WAREHOUSE)}
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
            </div>
            <div className="bg-red-700 h-[2px] w-full my-3"/>
            <Form name="validateOnly" layout="vertical" autoComplete="off">
                <div className="p-2 border-[1px] border-gray-200 rounded-md my-3">
                    <div className={"h-[35px] bg-gray-200 flex items-center pl-3 text-16 font-bold mb-3"}>Thông tin
                        phiếu
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "22% 22% 22% 22%",
                            gap: "4%",
                        }}
                    >
                        <Form.Item label="Mã phiếu nhập"
                                   validateStatus={formErrors["code"] ? "error" : ""}
                                   help={formErrors["code"] || ""}
                        >
                            <Input
                                value={formCreate?.code || ""}
                                onChange={(e) => handleFormUpdate(setFormCreate, setFormErrors, "code", e.target.value)}
                                size={"large"}

                            />
                        </Form.Item>
                        <Form.Item label="Ngày nhập hàng"
                                   validateStatus={formErrors["importDate"] ? "error" : ""}
                                   help={formErrors["importDate"] || ""}
                        >
                            <DatePicker className="w-full" size={"large"}
                                        format="DD/MM/YYYY"
                                        value={formCreate?.importDate ? dayjs(formCreate?.importDate) : null}
                                        onChange={(value) => handleFormUpdate(setFormCreate, setFormErrors, "importDate", dayjs(value).format('DD/MM/YYYY'))}
                            />
                        </Form.Item>
                        <Form.Item label="Nội dung nhập kho"
                                   validateStatus={formErrors["importContent"] ? "error" : ""}
                                   help={formErrors["importContent"] || ""}
                        >
                            <Input size={"large"}
                                   value={formCreate?.importContent}
                                   onChange={(e) => handleFormUpdate(setFormCreate, setFormErrors, "importContent", e.target.value)}
                            />
                        </Form.Item>
                        <Form.Item label="Kho nhập"
                                   validateStatus={formErrors["warehouseCode"] ? "error" : ""}
                                   help={formErrors["warehouseCode"] || ""}
                        >
                            <Select
                                size={"large"}
                                className="custom-select"
                                placeholder="Chọn kho nhập"
                                value={formCreate?.warehouseCode}
                                onChange={(value) => handleFormUpdate(setFormCreate, setFormErrors, "warehouseCode", value)}
                            >
                                {resWarehouses?.searchWareHouseModelList?.map((type) => (
                                    <Option key={type?.whCode} value={type?.whCode}>
                                        {type?.whName}
                                    </Option>))}
                            </Select>
                        </Form.Item>
                    </div>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "22% 22% 22% 22%",
                            gap: "4%",
                        }}
                    >
                        <Form.Item label="Số hoá đơn/ chứng từ"
                                   validateStatus={formErrors["orderCode"] ? "error" : ""}
                                   help={formErrors["orderCode"] || ""}
                        >
                            <Input
                                value={formCreate?.orderCode}
                                onChange={(e) => handleFormUpdate(setFormCreate, setFormErrors, "orderCode", e.target.value)}
                                size={"large"}

                            />
                        </Form.Item>
                        <Form.Item label="Ngày hóa đơn"
                                   validateStatus={formErrors["orderDate"] ? "error" : ""}
                                   help={formErrors["orderDate"] || ""}
                        >
                            <DatePicker className="w-full" size={"large"}
                                        format="DD/MM/YYYY"
                                        value={formCreate?.orderDate ? dayjs(formCreate?.orderDate) : null}
                                        onChange={(value) => handleFormUpdate(setFormCreate, setFormErrors, "orderDate", dayjs(value).format('DD/MM/YYYY'))}/>
                        </Form.Item>
                        <Form.Item label="Nhà cung cấp"
                                   validateStatus={formErrors["providerCode"] ? "error" : ""}
                                   help={formErrors["providerCode"] || ""}
                        >
                            <Select
                                size={"large"}
                                className="custom-select"
                                placeholder="Chọn nhà cung cấp"
                                value={formCreate?.providerCode}
                                onChange={(value) => handleFormUpdate(setFormCreate, setFormErrors, "providerCode", value)}
                            >
                                {resProviders?.body?.map((type) => (<Option key={type.id} value={type.code}>
                                    {type.name}
                                </Option>))}
                            </Select>
                        </Form.Item>
                        <Form.Item label="Hình thức vận chuyển"
                                   validateStatus={formErrors["deliveryMethod"] ? "error" : ""}
                                   help={formErrors["deliveryMethod"] || ""}
                        >
                            <Input size={"large"}
                                   value={formCreate?.deliveryMethod || ""}
                                   onChange={(e) => handleFormUpdate(setFormCreate, setFormErrors, "deliveryMethod", e.target.value)}
                            />
                        </Form.Item>
                    </div>
                </div>
                <div className="rounded border-[1px] border-b-neutral-950 p-4">
                    <div className="w-full bg-red-700 text-center py-2 text-xl text-white font-bold">Thông tin hàng
                        nhập
                    </div>
                    <Table
                        className={styles?.customTable}
                        pagination={false}
                        columns={columns}
                        dataSource={detailImMaterial}
                        scroll={{
                            x: 'max-content'
                        }}
                    />
                    <AppCreateButton className="mt-4" text={"Thêm hàng"}
                                     onClick={() => setModalGetMaterial({...modalGetMaterial, status: true})}/>
                </div>
                <div className="p-2 border-[1px] border-gray-200 rounded-md my-3">
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
                                value={formCreate?.exchangeRateCode || "VND"}
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
                </div>
                <Form.Item label="Ghi chú">
                    <TextArea
                        value={formCreate?.description}
                        onChange={(e) => handleFormUpdate(setFormCreate, setFormErrors, "description", e.target.value)}
                        size={"large"}
                    />
                </Form.Item>
                {/* <div className="bg-red-700 h-[2px] w-full my-3"/> */}

            </Form>
            <Modal
                title="Chọn sản phẩm"
                open={modalGetMaterial.status}
                onCancel={() => setModalGetMaterial({...modalGetMaterial, status: false})}
                okButtonProps={{style: {display: "none"}}}
                cancelButtonProps={{style: {display: "none"}}}
            >
                <Form name="validateOnly" layout="vertical" autoComplete="off">
                    <Form.Item label="Loại vật tư">
                        <Select
                            size={"large"}
                            placeholder="Chọn loại vật tư"
                            value={modalGetMaterial?.materialTypeCode}
                            onChange={(value) => setModalGetMaterial({
                                ...modalGetMaterial,
                                materialTypeCode: value
                            })}
                        >
                            {resMaterialTypes?.body?.map((type) => (<Option key={type.id} value={type.code}>
                                {type.name}
                            </Option>))}
                        </Select>
                    </Form.Item>
                    <Form.Item label="Vật tư">
                        <Select
                            size={"large"}
                            placeholder="Chọn vật tư"
                            value={modalGetMaterial?.material?.code}
                            onChange={(value) => setModalGetMaterial({
                                ...modalGetMaterial,
                                material: materials.find(item => item.code === value)
                            })}
                        >
                            {materials?.map((type) => (<Option key={type.id} value={type.code}>
                                {type.name}
                            </Option>))}
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <div style={{display: "flex", marginTop: 20}}>
                            <Button
                                style={{marginLeft: "auto", marginRight: 10}}
                                key="submit"
                                title="Hủy"
                                onClick={closeModalGetMaterial}
                            >
                                <AiOutlineClose/> Hủy
                            </Button>
                            {/* <Popconfirm
                                title="Thông báo"
                                description="Bạn có chắc chắn muốn thêm không ?"
                                onConfirm={() => {
                                    handleGetMaterial();
                                }}
                                okText="Có"
                                cancelText="Không"
                            > */}
                            <Button
                                className="button-add-promotion bg-red-700 text-[white]"
                                key="submit"
                                title="Xác nhận"
                                onClick={() => {
                                    handleGetMaterial();
                                }}
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

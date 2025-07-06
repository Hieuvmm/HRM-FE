import {
    Button,
    DatePicker,
    Form,
    Input,
    InputNumber,
    Modal,
    Popconfirm,
    Select,
    Tabs,
    Tag,
} from "antd";
import {UserApi} from "apis/User.api";
import dayjs from "dayjs";
import {produce} from "immer";
import React, {useEffect, useMemo, useState} from "react";
import {AiOutlineClose} from "react-icons/ai";
import {FaTrash} from "react-icons/fa";
import {RiSaveLine} from "react-icons/ri";
import {ExchangeRateApi} from "../../../../apis/ExchangeRate.api";
import {ExportBillWarehouse} from "../../../../apis/ExportBillWarehouse.api";
import {
    WarehouseApi,
    WarehouseMaterialDetailApi,
} from "../../../../apis/Warehouse.api";
import AppCreateButton from "../../../../components/AppButton/AppCreateButton";
import AppTabs from "../../../../components/AppTabs/AppTabsEx";
import {AppNotification} from "../../../../components/Notification/AppNotification";
import {
    convertCurrencyToWords,
    formatCurrency,
    handleFormSearch,
    handleFormUpdate,
} from "../../../../utils/AppUtil";

const {Option} = Select;
const {TextArea} = Input;
const {TabPane} = Tabs;

function calculateTotalPrice(items) {
    return items.reduce((total, item) => {
        return total + (parseFloat(item.totalPrice) || 0);
    }, 0);
}

function updateMaterialsEx(
    dataObject,
    time,
    materialsExIndex,
    updatedMaterial,
    checkDuplicate = false
) {
    // Sử dụng Immer để cập nhật dataObject một cách bất biến
    return produce(dataObject, (draft) => {
        // Kiểm tra nếu productEx là một mảng
        if (!Array.isArray(draft.productEx)) {
            throw new Error("productEx is not an array.");
        }

        // Tìm phần tử productEx theo time
        const product = draft.productEx.find((product) => product.time === time);

        if (!product) {
            throw new Error(`No productEx found with time: ${time}`);
        }

        // Kiểm tra nếu materialsEx tồn tại và là một mảng
        if (!Array.isArray(product.materialsEx)) {
            throw new Error("materialsEx is not an array.");
        }

        // Kiểm tra nếu materialsExIndex hợp lệ
        if (
            materialsExIndex < 0 ||
            materialsExIndex >= product.materialsEx.length
        ) {
            throw new Error("materialsExIndex is out of bounds.");
        }

        if (
            checkDuplicate &&
            product.materialsEx
                .map((item) => item.materialCode)
                .includes(updatedMaterial.materialCode)
        ) {
            AppNotification.error("Vật tư trùng lặp");
            return;
        }

        // Cập nhật phần tử trong materialsEx
        product.materialsEx[materialsExIndex] = updatedMaterial;
    });
}

function addMaterialToMaterialsEx(dataObject, time, newMaterial) {
    // Sử dụng Immer để cập nhật dataObject một cách bất biến
    return produce(dataObject, (draft) => {
        // Kiểm tra nếu productEx là một mảng
        if (!Array.isArray(draft.productEx)) {
            throw new Error("productEx is not an array.");
        }

        // Tìm phần tử productEx theo time
        let product = draft.productEx.find((product) => product.time === time);

        // Nếu không tìm thấy, tạo mới productEx với time
        if (!product) {
            product = {time, materialsEx: []};
            draft.productEx.push(product);
        }

        // Thêm phần tử mới vào mảng materialsEx
        product.materialsEx.push(newMaterial);
    });
}

function deleteMaterialToMaterialsEx(dataObject, time, materialsExIndex) {
    // Sử dụng Immer để cập nhật dataObject một cách bất biến
    return produce(dataObject, (draft) => {
        // Kiểm tra nếu productEx là một mảng
        if (!Array.isArray(draft.productEx)) {
            throw new Error("productEx is not an array.");
        }
        const product = draft.productEx.find((p) => p.time === time);

        if (product && product.materialsEx[materialsExIndex]) {
            product.materialsEx.splice(materialsExIndex, 1);
        }
    });
}

function deleteProductExByTime(dataObject, time) {
    // Sử dụng Immer để cập nhật dataObject một cách bất biến
    return produce(dataObject, (draft) => {
        // Lọc ra các phần tử có time khác với timeToRemove
        draft.productEx = draft.productEx.filter(
            (product) => product.time !== time
        );

        // Cập nhật lại time theo thứ tự tăng dần bắt đầu từ 1
        draft.productEx.forEach((product, index) => {
            product.time = (index + 1).toString();
        });
    });
}

function calculateFinalTotalPrice(data) {
    return data.reduce((total, item) => {
        const materialsTotal = item.materialsEx.reduce((subTotal, material) => {
            return subTotal + parseFloat(material.totalPrice);
        }, 0);
        return total + materialsTotal;
    }, 0);
}

const transformDataToRequest = (input) => {
    const transformMaterials = (materials) => {
        return materials.map((material) => ({
            materialCode: material.materialCode,
            expQuantity: material.expQuantity,
            realQuantity: material.realQuantity,
            totalPrice: material.totalPrice,
            unit: material.unit,
        }));
    };

    const transformProductEx = (products) => {
        return products.map((product) => ({
            time: product.time,
            materialsEx: transformMaterials(product.materialsEx),
        }));
    };

    const transformApprovalFollow = (list) => {
        if (list == null || list == "") {
            list = [];
        }
        return list.filter((item) => item); // Loại bỏ các phần tử rỗng
    };

    const transformExchangeRate = () => {
        const total = calculateFinalTotalPrice(input.productEx);
        const totalPriceChange =
            input?.exchangeRateData?.code === "VND" ||
            !input?.ccy ||
            input?.ccy === "VND"
                ? total
                : total / input?.exchangeRateData?.value;

        return {
            ccy: input.ccy,
            totalMoney: String(totalPriceChange)
                .replace(/[^\d,.-]/g, "")
                .replace(/\./g, "")
                .replace(/,/g, "."),
            // totalMoney: String(total),
            totalPriceBC: convertCurrencyToWords(total, input.ccy),
        };
    };

    // Chuyển đổi dữ liệu
    const transformed = {
        typeEx: input.typeEx,
        orderNumber: input.orderNumber,
        exCode: input.exCode,
        dateBill: input.dateBill,
        // customer: JSON.stringify(input.customer),
        customer: input.customer,
        dateEx: input.dateEx,
        desc: input.desc,
        whCode: input.whCode,
        productEx: transformProductEx(input.productEx),
        ...transformExchangeRate(),
        approvalBy: transformApprovalFollow(input.approvalBy),
        followBy: transformApprovalFollow(input.followBy),
        destination: input.destination
    };

    return transformed;
};

function transformResToData(input, resExchangeRatesChange) {
    const total = Number(input.totalMoney);
    const template = {
        typeEx: input.typeEx || null,
        orderNumber: input.orderNumber || null,
        exCode: input.exCode || null,
        dateBill: input.dateBill || null,
        customer: input.customer || null,
        dateEx: input.dateEx || null,
        desc: input.desc || null,
        whName: input.whName || null,
        whCode: input.whCode || null,
        destination: input.destination || null,
        productEx: input.productEx.map((product) => ({
            id: product.id || null,
            materialsEx: product.materialsEx.map((material) => ({
                materialType: material.materialType || null,
                materialCode: material.materialCode || null,
                materialName: material.materialName || null,
                parameter: material.parameter || null,
                unit: material.unit || null,
                expQuantity: material.expQuantity || null,
                realQuantity: material.realQuantity || null,
                price: material.price || null,
                totalPrice: material.totalPrice || null,
            })),
            time: product.time || null,
        })),
        totalMoney: String(total),
        totalPriceBC: convertCurrencyToWords(total, input.ccy),
        ccy: input.ccy || null,
        approvalBy: input.approvalBy || [],
        followBy: input.followBy || [],
        status: input.status || null,
        exchangeRateData: resExchangeRatesChange?.body?.find(
            (item) => item.code === input.ccy
        ),
    };
    return template;
}

export default function ModalCreateExport({modalCreate, setModalCreate}) {
    const [formSearch, setFormSearch] = useState({
        page: 1,
        limit: 10,
        status: "",
        searchText: "",
    });
    const [formSearchWareHouse] = useState({
        keyword: "",
        pageNumber: "",
        pageSize: "",
        status: "",
    });

    const initialFormCreate = {
        typeEx: "",
        orderNumber: "",
        exCode: "",
        dateBill: "",
        customer: "",
        dateEx: "",
        desc: "",
        whName: "",
        whCode: "",
        productEx: [],
        totalMoney: "",
        ccy: "VND",
        totalPriceBC: "",
        approvalBy: "",
        followBy: "",
        status: "CREATED",
        destination: "",
        type: modalCreate.type
    };
    const [formCreate, setFormCreate] = useState(initialFormCreate);
    const [formErrors, setFormErrors] = useState({});
    const [selectedTabKey, setSelectedTabKey] = useState("0");
    const [reason, setReason] = useState();

    const {data: resExchangeRatesChange} = ExchangeRateApi.useGetList(
        {...formSearch, status: "ACTIVE"},
        {
            staleTime: 0,
            cacheTime: 0,
            enabled: modalCreate.status,
        }
    );

    const [wareHouseList, setWareHouseList] = useState([]);
    const [wareHouseListName, setWareHouseListName] = useState([]);

    useEffect(() => {
        if (modalCreate.exCode) {
            ExportBillWarehouse.detail({exCode: modalCreate.exCode})
                .then((res) => {
                    setFormCreate(transformResToData(res.body, resExchangeRatesChange));
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    }, [modalCreate.exCode, resExchangeRatesChange]);

    const formatDataForTable = (data) => {
        let globalIndex = 0;
        return data.reduce((acc, item, index) => {
            const formattedMaterials = item.materialsEx.map((material, index) => {
                globalIndex += 1;
                return {
                    time: item.time,
                    index: globalIndex,
                    timeIndex: index,
                    ...material,
                };
            });

            return [...acc, ...formattedMaterials];
        }, []);
    };

    const filterDataByTime = (time) => {
        if (!formCreate.productEx || formCreate.productEx.length === 0) {
            return [];
        }

        if (time === "0") {
            return formatDataForTable(formCreate.productEx);
        }

        // Lọc theo time
        const filteredData = formCreate.productEx.filter(
            (item) => item.time === time
        );

        return formatDataForTable(filteredData);
    };

    const filteredData = useMemo(() => {
        if (formCreate.productEx) {
            return filterDataByTime(selectedTabKey);
        }
        return [];
    }, [selectedTabKey, formCreate.productEx]);

    const {data: wareHouse} = WarehouseMaterialDetailApi.useGetList(
        {whCode: formCreate.whCode},
        {}
    );

    useEffect(() => {
        if (wareHouse?.detailMaterial !== wareHouseList) {
            setWareHouseList(wareHouse?.detailMaterial);
        }
    }, [wareHouse, wareHouseList]);

    //Check status hiển thị trạng thái phê duyệt
    const getStatusProps = (status) => {
        switch (status) {
            case "CREATED":
                return {color: "gold", text: "Đang chờ duyệt"};
            case "REJECT":
                return {color: "red", text: "Đã từ chối"};
            case "APPROVAL":
                return {color: "green", text: "Đã duyệt"};
            default:
                return {color: "default", text: "Không xác định"};
        }
    };

    const {color, text} = getStatusProps(formCreate?.status);

    const columns = [
        {
            title: "STT",
            dataIndex: "index",
            key: "index",
        },
        {
            title: "Loại sản phẩm",
            dataIndex: "materialType",
            key: "materialType",
        },
        {
            title: "Mã sản phẩm",
            dataIndex: "materialCode",
            key: "materialCode",
        },
        {
            title: "Tên sản phẩm",
            dataIndex: "materialName",
            key: "materialName",
            render: (_, record, index) => {
                return (
                    <Select
                        disabled={modalCreate.type == "detail_ex"}
                        size={"large"}
                        style={{width: "100%"}}
                        className="custom-select"
                        placeholder="Chọn loại xuất"
                        value={record.materialCode || ""}
                        onChange={(value) => {
                            setFormCreate((prevFormCreate) => {
                                return updateMaterialsEx(
                                    prevFormCreate,
                                    record.time,
                                    record.timeIndex,
                                    wareHouseList?.find((item) => item.materialCode === value),
                                    true
                                );
                            });
                        }}
                    >
                        {wareHouseList?.map((item, index) => (
                            <Option key={index} value={item.materialCode}>
                                {item.materialName}
                            </Option>
                        ))}
                    </Select>
                );
            },
        },
        {
            title: "Đơn vị tính",
            dataIndex: "unit",
            key: "unit",
        },
        {
            title: "Số lượng",
            children: [
                {
                    title: "Chứng từ",
                    dataIndex: "expQuantity",
                    key: "expQuantity",
                    render: (_, record, index) => {
                        return (
                            <InputNumber
                                size={"large"}
                                readOnly={modalCreate.type == "detail_ex"}
                                min={1}
                                value={record?.expQuantity}
                                onChange={(value) => {
                                    setFormCreate((prevFormCreate) => {
                                        return updateMaterialsEx(
                                            prevFormCreate,
                                            record.time,
                                            record.timeIndex,
                                            {...record, expQuantity: String(value)}
                                        );
                                    });
                                }}
                            />
                        );
                    },
                },
                {
                    title: "Thực xuất",
                    dataIndex: "realQuantity",
                    key: "realQuantity",
                    render: (_, record, index) => {
                        return (
                            <InputNumber
                                size={"large"}
                                min={1}
                                readOnly={modalCreate.type == "detail_ex"}
                                value={record?.realQuantity}
                                onChange={(value) => {
                                    setFormCreate((prevFormCreate) => {
                                        return updateMaterialsEx(
                                            prevFormCreate,
                                            record.time,
                                            record.timeIndex,
                                            {
                                                ...record,
                                                realQuantity: String(value),
                                                totalPrice: String(value * Number(record.price) || 0),
                                            }
                                        );
                                    });
                                }}
                            />
                        );
                    },
                },
            ],
        },
        {
            title: "Giá bán",
            children: [
                {
                    title: "Đơn giá",
                    dataIndex: "price",
                    key: "price",
                },
                {
                    title: "Thành tiền",
                    dataIndex: "totalPrice",
                    key: "totalPrice",
                },
            ],
        },
        {
            title: "",
            key: "actions",
            render: (_, record, index) => {
                return (
                    <Button
                        disabled={modalCreate.type == "detail_ex"}
                        type="primary"
                        danger
                        onClick={() => handleDeleteProductEx(record, index)}
                    >
                        <FaTrash/>
                    </Button>
                );
            },
        },
    ];

    const closeModal = () => {
        setModalCreate({});
        setFormCreate(initialFormCreate);
    };
    const changeFormSearch = (name, value) => {
        handleFormSearch(setFormSearch, name, value);
    };

    const {data: wareHouseSelect} =
        WarehouseApi.useGetList(formSearchWareHouse);
    useEffect(() => {
        setWareHouseListName(wareHouseSelect?.searchWareHouseModelList);
    }, [wareHouseSelect]);

    const handleAddProductEx = (record) => {
        setFormCreate((prevFormCreate) =>
            addMaterialToMaterialsEx(prevFormCreate, selectedTabKey, {})
        );
    };

    const handleDeleteProductEx = (record, index) => {
        setFormCreate((prevFormCreate) => {
            return deleteMaterialToMaterialsEx(
                prevFormCreate,
                record.time,
                record.timeIndex
            );
        });
    };

    const handleDeleteTime = (time) => {
        setFormCreate((prevFormCreate) => {
            return deleteProductExByTime(prevFormCreate, time);
        });
    };

    const changeWareHouseCode = (record) => {
        return handleFormUpdate(setFormCreate, setFormErrors, "whCode", record);
    };

    const changeDestinationCode = (record) => {
        return handleFormUpdate(setFormCreate, setFormErrors, "destination", record);
    };

    // Hàm gọi API tạo mới
    const createNewProduct = () => {
        ExportBillWarehouse.create(transformDataToRequest(formCreate))
            .then((response) => {
                AppNotification.success("Đã tạo mới thành công");
                closeModal();
                // if (response && response.message === "SUCCESS") {
                //   AppNotification.success("Đã tạo mới thành công");
                //   closeModal();
                // } else {
                //   AppNotification.error("Có lỗi trong quá trình tạo mới");
                // }
            })
            .catch((error) => {
                console.error("Error creating new product:", error);
                AppNotification.error("Có lỗi trong quá trình tạo mới");
            });
    };

    const submitApproval = (e) => {
        ExportBillWarehouse.submitApproval({
            exCode: formCreate.exCode,
            status: e,
            reason: reason,
        })
            .then((r) => {
                AppNotification.success(
                    "Phê duyệt/từ chối thành công phiếu xuất ",
                    formCreate.exCode
                );
                closeModal();
            })
            .catch((error) => {
                console.error("submitApproval eror:", error);
                AppNotification.error(error.message);
            });
    };

    const handleSubmit = async () => {
        const requestBody = transformDataToRequest(formCreate);

        const response = await ExportBillWarehouse.update(requestBody)
            .then((res) => {
                AppNotification.success("Đã lưu thành công");
                closeModal();
            })
            .catch((e) => {
                AppNotification.error("Có lỗi trong quá trình chỉnh sửa");
            });

        // if (response && response.message === "SUCCESS") {
        //   AppNotification.success("Đã lưu thành công");
        //   closeModal();
        // } else {
        //   AppNotification.error("Có lỗi trong quá trình chỉnh sửa");
        // }
    };

    const totalOptions = 10;
    const typeExList = [
        {
            name: "Bán hàng",
        },
        {
            name: "Thi công",
        },
        {
            name: "Bảo hành",
        },
        {
            name: "Bảo trì",
        },
    ];

    const isCreateModal =
        modalCreate.type === "create" || formCreate.status !== "CREATED";
    const isEditExBill = formCreate.status !== "CREATED";
    const {data: userList} = UserApi.getUserByRole({role: ""});

    // Tính giá và chuyển đổi giá
    const totalPriceChange =
        formCreate?.exchangeRateData?.code === "VND" ||
        !formCreate?.ccy ||
        formCreate?.ccy === "VND"
            ? calculateTotalPrice(filteredData)
            : calculateTotalPrice(filteredData) / formCreate?.exchangeRateData?.value;

    return (
        <React.Fragment>
            <Modal
                title="Thông tin phiếu xuất"
                open={modalCreate.status}
                onCancel={closeModal}
                okButtonProps={{style: {display: "none"}}}
                cancelButtonProps={{style: {display: "none"}}}
                width="90%"
            >
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "70% 28%",
                        gap: "2%",
                    }}
                >
                    <Form name="validateOnly" layout="vertical" autoComplete="off">
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "22% 22% 22% 22%",
                                gap: "4%",
                            }}
                        >
                            {/* Start chọn xuất đến kho */}
                            <Form.Item
                                label="Xuất đến kho"
                                validateStatus={formErrors["destination"] ? "error" : ""}
                                help={formErrors["destination"] || ""}
                            >
                                <Select
                                    size={"large"}
                                    className="custom-select"
                                    placeholder="Chọn kho đến"
                                    disabled={modalCreate.type == "detail_ex"}
                                    value={formCreate["destination"] || ""}
                                    onChange={(value) => changeDestinationCode(value)}
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
                            {/* End xuất đến kho */}
                            <Form.Item
                                label="Mã phiếu xuất"
                                validateStatus={formErrors["exCode"] ? "error" : ""}
                                help={formErrors["exCode"] || ""}
                            >
                                <Input
                                    size={"large"}
                                    value={formCreate.exCode || ""}
                                    disabled={modalCreate.type == "detail_ex"}
                                    onChange={(e) =>
                                        handleFormUpdate(
                                            setFormCreate,
                                            setFormErrors,
                                            "exCode",
                                            e.target.value
                                        )
                                    }
                                />
                            </Form.Item>
                            {/*bo sung them thong tin khach hang*/}
                            <Form.Item
                                label="Thông tin khách hàng"
                                validateStatus={formErrors["customer"] ? "error" : ""}
                                help={formErrors["customer"] || ""}
                            >
                                <Input
                                    size={"large"}
                                    value={formCreate.customer || ""}
                                    disabled={modalCreate.type == "detail_ex"}
                                    onChange={(e) =>
                                        handleFormUpdate(
                                            setFormCreate,
                                            setFormErrors,
                                            "customer",
                                            e.target.value
                                        )
                                    }
                                />
                            </Form.Item>
                            {/*ket thuc bo sung*/}
                            {/*<Form.Item*/}
                            {/*  label="Khách hàng"*/}
                            {/*  validateStatus={formErrors["customer"] ? "error" : ""}*/}
                            {/*  help={formErrors["customer"] || ""}*/}
                            {/*>*/}
                            {/*          <Input*/}
                            {/*    size={"large"}*/}
                            {/*    // className="custom-select"*/}
                            {/*    placeholder="Nhập tên khách hàng"*/}
                            {/*    value={formCreate["customer"] || ""}*/}
                            {/*    onChange={(value) =>*/}
                            {/*      handleFormUpdate(*/}
                            {/*        setFormCreate,*/}
                            {/*        setFormErrors,*/}
                            {/*        "customer",*/}
                            {/*        value.target.value*/}
                            {/*      )*/}
                            {/*    }*/}
                            {/*  />*/}

                            {/* </Select> */}
                            {/* <Select
                  size={"large"}
                  className="custom-select"
                  placeholder="Chọn khách hàng"
                  value={formCreate["customer"] || ""}
                  onChange={(value) =>
                    handleFormUpdate(
                      setFormCreate,
                      setFormErrors,
                      "customer",
                      value
                    )
                  }
                >
                  {Array.from({ length: totalOptions }, (_, index) => (
                    <Option key={index + 1} value={index + 1}>
                      {"Nguyễn Văn " + index + 1}
                    </Option>
                  ))}
                </Select> */}
                            {/*</Form.Item>*/}
                            <Form.Item
                                label="Nội dung xuất kho"
                                validateStatus={formErrors["desc"] ? "error" : ""}
                                help={formErrors["desc"] || ""}
                            >
                                <Input
                                    size={"large"}
                                    disabled={modalCreate.type == "detail_ex"}
                                    value={formCreate.desc || ""}
                                    onChange={(e) =>
                                        handleFormUpdate(
                                            setFormCreate,
                                            setFormErrors,
                                            "desc",
                                            e.target.value
                                        )
                                    }
                                />
                            </Form.Item>
                        </div>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "22% 22% 22% 22%",
                                gap: "4%",
                            }}
                        >
                            <Form.Item
                                label="Số hoá đơn"
                                validateStatus={formErrors["orderNumber"] ? "error" : ""}
                                help={formErrors["orderNumber"] || ""}
                            >
                                <Input
                                    value={formCreate.orderNumber || ""}
                                    disabled={modalCreate.type == "detail_ex"}
                                    onChange={(e) =>
                                        handleFormUpdate(
                                            setFormCreate,
                                            setFormErrors,
                                            "orderNumber",
                                            e.target.value
                                        )
                                    }
                                    size={"large"}
                                />
                            </Form.Item>
                            <Form.Item
                                label="Ngày hóa đơn"
                                validateStatus={formErrors["dateBill"] ? "error" : ""}
                                help={formErrors["dateBill"] || ""}
                            >
                                <DatePicker
                                    disabled={modalCreate.type == "detail_ex"}
                                    className="w-full"
                                    size={"large"}
                                    format="DD/MM/YYYY"
                                    value={
                                        formCreate?.dateBill
                                            ? dayjs(formCreate?.dateBill, "DD/MM/YYYY")
                                            : null
                                    }
                                    onCalendarChange={(date) =>
                                        handleFormUpdate(
                                            setFormCreate,
                                            setFormErrors,
                                            "dateBill",
                                            date.format("DD/MM/YYYY")
                                        )
                                    }
                                />
                            </Form.Item>
                            <Form.Item
                                label="Ngày xuất hàng"
                                validateStatus={formErrors["dateEx"] ? "error" : ""}
                                help={formErrors["dateEx"] || ""}
                            >
                                <DatePicker
                                    format="DD/MM/YYYY"
                                    disabled={modalCreate.type == "detail_ex"}
                                    value={
                                        formCreate?.dateEx
                                            ? dayjs(formCreate?.dateEx, "DD/MM/YYYY")
                                            : null
                                    }
                                    className="w-full"
                                    size={"large"}
                                    onCalendarChange={(date) =>
                                        handleFormUpdate(
                                            setFormCreate,
                                            setFormErrors,
                                            "dateEx",
                                            date.format("DD/MM/YYYY")
                                            // date.format("DD/MM/YYYY")
                                        )
                                    }
                                />
                            </Form.Item>
                            <Form.Item
                                label="Xuất tại kho"
                                validateStatus={formErrors["whCode"] ? "error" : ""}
                                help={formErrors["whCode"] || ""}
                            >
                                <Select
                                    size={"large"}
                                    disabled={modalCreate.type == "detail_ex"}
                                    className="custom-select"
                                    placeholder="Chọn đơn kho"
                                    value={formCreate["whCode"] || ""}
                                    onChange={(value) => changeWareHouseCode(value)}
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
                        </div>
                        <div>
                            <AppTabs
                                disabled={modalCreate.type == "detail_ex"}
                                selectedTabKey={selectedTabKey}
                                setSelectedTabKey={setSelectedTabKey}
                                columns={columns}
                                detailImMaterial={filteredData || []}
                                handleDeleteTime={handleDeleteTime}
                                formCreate={formCreate}
                            />

                            <AppCreateButton
                                disabled={selectedTabKey === "0" || modalCreate.type == "detail_ex"}
                                className="mt-4"
                                text={"Thêm hàng"}
                                onClick={(values) => {
                                    handleAddProductEx(values);
                                }}
                            >
                                Thêm hàng
                            </AppCreateButton>
                        </div>
                        <div className="flex items-center p-2 bg-gray-200 mt-4">
                            <div className="mr-10 text-base font-bold">Tỷ giá</div>
                            {/*<div className="mr-10 flex items-center">*/}
                            {/*  <div className="mr-4">Chiết khấu</div>*/}
                            {/*  <InputNumber min={1} type={"number"} />*/}
                            {/*</div>*/}
                            {/*<div className="mr-10 flex items-center">*/}
                            {/*  <div className="mr-4">Chi nhánh</div>*/}
                            {/*  <Switch defaultChecked />*/}
                            {/*</div>*/}
                            {/*<div className=" flex items-center">*/}
                            {/*  <div className="mr-4">Nhân viên</div>*/}
                            {/*  <Switch defaultChecked />*/}
                            {/*</div>*/}
                        </div>

                        {/*Tính số tiền theo tỷ giá*/}
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "20% 75%",
                                gap: "5%",
                                marginTop: 20,
                            }}
                        >
                            <Form.Item
                                // label="Tỷ giá"
                                validateStatus={formErrors["ccy"] ? "error" : ""}
                                help={formErrors["ccy"] || ""}
                            >
                                <Select
                                    size={"large"}
                                    className="custom-select"
                                    disabled={modalCreate.type == "detail_ex"}
                                    placeholder="Chọn tỷ giá"
                                    value={formCreate?.ccy || "VND"}
                                    onChange={(value) => {
                                        handleFormUpdate(
                                            setFormCreate,
                                            setFormErrors,
                                            "ccy",
                                            value
                                        );
                                        const exchangeRateData = resExchangeRatesChange?.body?.find(
                                            (item) => item.code === value
                                        );
                                        handleFormUpdate(
                                            setFormCreate,
                                            setFormErrors,
                                            "exchangeRateData",
                                            exchangeRateData
                                        );
                                    }}
                                >
                                    {resExchangeRatesChange?.body?.map((type) => (
                                        <Option key={type.id} value={type.code}>
                                            {type.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item label="">
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "20% 80%",
                                        gap: "5%",
                                        marginTop: 20,
                                        marginBottom: 10,
                                    }}
                                >
                                    <div className="text-base font-bold">
                                        Tổng số tiền bằng số:
                                    </div>
                                    <div
                                        onChange={(e) =>
                                            handleFormUpdate(
                                                setFormCreate,
                                                setFormErrors,
                                                "totalMoney",
                                                e.target.value
                                            )
                                        }
                                    >
                                        {formatCurrency(totalPriceChange, formCreate?.ccy || "VND")}
                                    </div>
                                </div>
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "20% 80%",
                                        gap: "5%",
                                    }}
                                >
                                    <div className="text-base font-bold">
                                        Tổng số tiền bằng chữ:
                                    </div>
                                    <div>
                                        {convertCurrencyToWords(
                                            totalPriceChange || 0,
                                            formCreate?.ccy || "VND"
                                        )}
                                    </div>
                                </div>
                            </Form.Item>
                        </div>
                        {/*Kết thúc tính tiền theo tỷ giá*/}

                        <Form.Item label="Ghi chú">
                            <TextArea
                                value={formCreate["description"] || ""}
                                onChange={(e) =>
                                    handleFormUpdate(
                                        setFormCreate,
                                        setFormErrors,
                                        "description",
                                        e.target.value
                                    )
                                }
                                size={"large"}
                            />
                        </Form.Item>
                        {/* Thông tin phê duyệt */}
                        {/* Kết thúc phê duyệt */}
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
                                {modalCreate.type != "detail_ex" && (
                                    <Popconfirm
                                        title="Thông báo"
                                        description="Bạn có chắc chắn muốn thêm không ?"
                                        onConfirm={
                                            modalCreate.type === "detail"
                                                ? handleSubmit
                                                : createNewProduct
                                        }
                                        okText="Có"
                                        cancelText="Không"
                                    >
                                        <Button
                                            className="button-add-promotion bg-red-700 text-[white]"
                                            key="submit"
                                            title="Thêm"
                                            disabled={isEditExBill}
                                        >
                                            <RiSaveLine/>
                                            Lưu lại
                                        </Button>
                                    </Popconfirm>
                                )}
                            </div>
                        </Form.Item>
                    </Form>

                    {/* start thông tin phê duyệt */}
                    <div
                        style={{
                            background: "#f9f9f9",
                            padding: "16px",
                            border: "1px solid #ddd",
                            borderRadius: "8px",
                        }}
                    >
                        <Tabs defaultActiveKey="1">
                            <Tabs.TabPane tab="Thông tin chung" key="1">
                                <Form layout="vertical">
                                    <Form.Item label="Trạng thái đơn">
                                        <Tag color={color} style={{fontSize: "14px"}}>
                                            {text}
                                        </Tag>
                                    </Form.Item>
                                    {/*Bắt đầu người phê duyệt*/}
                                    {/*<Form.Item label="Người duyệt">*/}
                                    {/*  <Select*/}
                                    {/*  className="custom-select"*/}
                                    {/*    mode="multiple"*/}
                                    {/*    placeholder="Chọn người duyệt"*/}
                                    {/*    style={{ width: "100%" }}*/}
                                    {/*    value={formCreate.approvalBy || null}*/}
                                    {/*    onChange={(e) =>*/}
                                    {/*      handleFormUpdate(*/}
                                    {/*        setFormCreate,*/}
                                    {/*        setFormErrors,*/}
                                    {/*        "approvalBy",*/}
                                    {/*        e*/}
                                    {/*      )*/}
                                    {/*    }*/}
                                    {/*  >*/}
                                    {/*    {userList?.map((item) => (*/}
                                    {/*      <Option key={item.userId} value={item.userCode}>*/}
                                    {/*           {item.fullName}*/}
                                    {/*       </Option>))}*/}
                                    {/*  </Select>*/}
                                    {/*</Form.Item>*/}
                                    <Form.Item label="Người duyệt">
                                        <Select
                                            mode="multiple"
                                            disabled={modalCreate.type == "detail_ex"}
                                            placeholder="Chọn người Người duyệt"
                                            style={{width: "100%"}}
                                            labelInValue={true} // Hiển thị fullName thay vì userCode
                                            value={
                                                formCreate.approvalBy
                                                    ? formCreate.approvalBy
                                                        .map((code) => code.trim()) // Chuẩn hóa dữ liệu
                                                        .map((code) => {
                                                            const user = userList.find(
                                                                (user) => user.userCode === code
                                                            );
                                                            return user
                                                                ? {
                                                                    value: user.userCode,
                                                                    label: user.fullName,
                                                                }
                                                                : null;
                                                        })
                                                        .filter(Boolean) // Loại bỏ null nếu không tìm thấy user
                                                    : []
                                            }
                                            onChange={(values) =>
                                                handleFormUpdate(
                                                    setFormCreate,
                                                    setFormErrors,
                                                    "approvalBy",
                                                    values.map((v) => v.value) // Chỉ lưu userCode
                                                )
                                            }
                                        >
                                            {userList?.map((item) => (
                                                <Option key={item.userId} value={item.userCode}>
                                                    {item.fullName}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                    {/*End người phê duyệt*/}
                                    <Form.Item label="Người theo dõi">
                                        <Select
                                            disabled={modalCreate.type == "detail_ex"}
                                            mode="multiple"
                                            placeholder="Chọn người theo dõi"
                                            style={{width: "100%"}}
                                            labelInValue={true} // Hiển thị fullName thay vì userCode
                                            value={
                                                formCreate.followBy
                                                    ? formCreate.followBy
                                                        .map((code) => code.trim()) // Chuẩn hóa dữ liệu
                                                        .map((code) => {
                                                            const user = userList.find(
                                                                (user) => user.userCode === code
                                                            );
                                                            return user
                                                                ? {
                                                                    value: user.userCode,
                                                                    label: user.fullName,
                                                                }
                                                                : null;
                                                        })
                                                        .filter(Boolean) // Loại bỏ null nếu không tìm thấy user
                                                    : []
                                            }
                                            onChange={(values) =>
                                                handleFormUpdate(
                                                    setFormCreate,
                                                    setFormErrors,
                                                    "followBy",
                                                    values.map((v) => v.value) // Chỉ lưu userCode
                                                )
                                            }
                                        >
                                            {userList?.map((item) => (
                                                <Option key={item.userId} value={item.userCode}>
                                                    {item.fullName}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                    {/*End người theo dõi*/}
                                    {modalCreate?.type == "detail_ex" && (
                                        <Form.Item label="Ý kiến">
                                            <Input.TextArea
                                                rows={5}
                                                placeholder="Nhập ý kiến"
                                                onChange={(e) => setReason(e.target.value)}
                                            />
                                        </Form.Item>)}

                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "flex-end",
                                            gap: "2%",
                                        }}
                                    >

                                        {modalCreate?.type == "detail_ex" && (
                                            <>
                                                <Button
                                                    style={{
                                                        background: "#E5E5E5",
                                                        border: "none",
                                                        color: "#333",
                                                    }}
                                                    disabled={isCreateModal}
                                                    onClick={() => submitApproval("REJECT")}
                                                >
                                                    Từ chối
                                                </Button>
                                                <Button
                                                    type="primary"
                                                    danger
                                                    onClick={() => submitApproval("APPROVAL")}
                                                    disabled={isCreateModal}
                                                >
                                                    Phê duyệt
                                                </Button>

                                            </>
                                        )
                                        }
                                    </div>
                                </Form>
                            </Tabs.TabPane>
                            {/*<Tabs.TabPane tab="Lịch sử hoạt động" key="2">*/}
                            {/*  <p>Lịch sử hoạt động sẽ hiển thị ở đây.</p>*/}
                            {/*</Tabs.TabPane>*/}
                        </Tabs>
                    </div>
                    {/* end thông tin phê duyệt */}
                </div>
            </Modal>
        </React.Fragment>
    );
}

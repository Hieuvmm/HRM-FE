import {Button, DatePicker, Form, Input, InputNumber, Popconfirm, Select, Table, Tag,} from "antd";
import React, {useEffect, useState} from "react";
import {AiOutlineClose} from "react-icons/ai";
import {AppNotification} from "../../../../components/Notification/AppNotification";
import {convertCurrencyToWords, formatCurrency, handlePermissionApprove, useStyle} from "../../../../utils/AppUtil";
import {ExchangeRateApi} from "../../../../apis/ExchangeRate.api";
import {ProviderApi} from "../../../../apis/Provider.api";
import {ImportBillApi} from "../../../../apis/ImportBill.api";
import dayjs from "dayjs";
import {WarehouseApi} from "../../../../apis/Warehouse.api";
import AppSaveButton from "../../../../components/AppButton/AppSaveButton";
import AppCancelButton from "../../../../components/AppButton/AppCancelButton";
import {useUserStore} from "../../../../store/storeUser";
import {useNavigate, useParams} from "react-router-dom";
import {routes} from "../../../../utils/common";
import {GrFormPrevious} from "react-icons/gr";
import {IoArrowBackCircleOutline, IoArrowForwardCircleOutline} from "react-icons/io5";

const {Option} = Select
const {TextArea} = Input;
export default function DetailImport() {
    const {styles} = useStyle();
    const nav = useNavigate();
    const {code} = useParams();
    const formSearch = {
        page: 1,
        limit: 1000,
        status: "",
        searchText: "",
        keyword: "",
        pageSize: 100000,
        pageNumber: 1,
    };
    const [tabTitle, setTabTitle] = useState("info");
    const [formCreate, setFormCreate] = useState({
        exchangeRateCode: "VND",
        note: ''
    });
    const [showDetail, setShowDetail] = useState(true)
    const [detailImMaterial, setDetailImMaterial] = useState([]);
    const {data: resExchangeRates} = ExchangeRateApi.useGetList({...formSearch, status: 'ACTIVE'}, {
        staleTime: 0,
        cacheTime: 0,
    })
    const {data: resProviders} = ProviderApi.useGetList({...formSearch, status: 'ACTIVE'}, {
        staleTime: 0,
        cacheTime: 0,
    })
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
            setFormCreate({
                ...resDetailImport,
                exchangeRate: resExchangeRates?.body?.find(item => item.code === resDetailImport.exchangeRateCode)
            })
            const dataDetailImport = resDetailImport?.detailImportMaterials?.map((item, index) => (
                {
                    key: index + 1,
                    ...item
                }
            ))
            setDetailImMaterial(dataDetailImport)
        }
    }, [resDetailImport]);

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
            key: 'parameter',
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
                                readOnly={true}
                                size={"large"}
                                min={1}
                                value={record?.expectedQuantity}
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
                                readOnly={true}
                                size={"large"}
                                min={1}
                                value={record?.realQuantity}
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
                    render: (_, record) => formatCurrency(record?.realQuantity * record?.price) || 0
                },
            ],
        }
    ];

    const totalPrice = detailImMaterial?.length === 0 ? 0 : detailImMaterial?.reduce((acc, item) => acc + item.realQuantity * item.price, 0)
    const totalPriceChange = formCreate?.exchangeRateCode === "VND" ? totalPrice : totalPrice / formCreate?.exchangeRate?.value;

    const [data] = useUserStore((state) => [state.data]);
    const handleApprove = (status) => {
        if (status === 'REFUSED' && !formCreate?.note) {
            setFormCreate({...formCreate, noteValid: "Vui lòng điền lý do từ chối cho phiếu"})
            return
        }
        const approveReq = {
            status: status,
            note: formCreate?.note,
            importBillCode: formCreate.code,
            userId: data?.userId
        }
        ImportBillApi.approve(approveReq).then((res) => {
            AppNotification.success(status === "REFUSED" ? "Từ chối phiếu nhập thành công" : "Duyệt phiếu nhập thành công")
        }).catch((err) => {
            AppNotification.error(err?.message)
        })

    }
    return (
        <div className={"py-3"}>
            <div className={"flex items-center"}><GrFormPrevious className={"pointer text-red-700"} size={30}
                                                                 onClick={() => nav(routes.IM_WAREHOUSE)}/> <span
                className={"text-lg font-bold text-red-700"}> Chi tiết phiếu nhập</span></div>
            <div className="bg-red-700 h-[2px] w-full my-3"/>
            <div style={{
                display: "grid",
                gridTemplateColumns: showDetail ? "74% 25%" : "96% 3%",
                gap: "1%",
            }}>
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
                            <Form.Item label="Mã phiếu nhập">
                                <Input
                                    readOnly={true}
                                    value={formCreate?.code || ""}
                                    size={"large"}
                                />
                            </Form.Item>
                            <Form.Item label="Ngày nhập hàng"
                            >
                                <DatePicker disabled={true} className="w-full" size={"large"}
                                            value={dayjs(formCreate?.importDate) || null}
                                />
                            </Form.Item>
                            <Form.Item label="Nội dung nhập kho"
                            >
                                <Input size={"large"}
                                       readOnly={true}
                                       value={formCreate?.importContent}
                                />
                            </Form.Item>
                            <Form.Item label="Kho nhập"
                            >
                                <Select
                                    disabled={true}
                                    size={"large"}
                                    className="custom-select"
                                    placeholder="Chọn kho nhập"
                                    value={formCreate?.warehouseCode}
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
                            >
                                <Input
                                    value={formCreate?.orderCode}
                                    readOnly={true}
                                    size={"large"}

                                />
                            </Form.Item>
                            <Form.Item label="Ngày hóa đơn"
                            >
                                <DatePicker disabled={true} className="w-full" size={"large"}
                                            value={dayjs(formCreate?.orderDate) || null}
                                />
                            </Form.Item>
                            <Form.Item label="Nhà cung cấp"
                            >
                                <Select
                                    disabled={true}
                                    size={"large"}
                                    className="custom-select"
                                    placeholder="Chọn nhà cung cấp"
                                    value={formCreate?.providerCode}
                                >
                                    {resProviders?.body?.map((type) => (<Option key={type.id} value={type.code}>
                                        {type.name}
                                    </Option>))}
                                </Select>
                            </Form.Item>
                            <Form.Item label="Hình thức vận chuyển"
                            >
                                <Input size={"large"}
                                       readOnly={true}
                                       value={formCreate?.deliveryMethod || ""}
                                />
                            </Form.Item>
                        </div>
                    </div>
                    <div className="rounded border-[1px] border-b-neutral-950 p-4">
                        <div className="w-full bg-red-700 text-center py-2 text-xl text-white font-bold">Thông tin
                            hàng
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
                            >
                                <Select
                                    disabled={true}
                                    size={"large"}
                                    className="custom-select"
                                    placeholder="Chọn tỷ giá"
                                    value={formCreate?.exchangeRateCode}
                                >
                                    {resExchangeRates?.body?.map((type) => (<Option key={type.id} value={type.code}>
                                        {type.name}
                                    </Option>))}
                                </Select>
                            </Form.Item>
                            <Form.Item label="">
                                <div style={{
                                    display: "grid",
                                    gridTemplateColumns: "30% 65%",
                                    gap: "5%",
                                    marginTop: 20,
                                    marginBottom: 10
                                }}>
                                    <div className="text-base font-bold">Tổng số tiền bằng số:</div>
                                    <div>{formatCurrency(totalPriceChange, formCreate?.exchangeRate?.name)}</div>
                                </div>
                                <div style={{
                                    display: "grid",
                                    gridTemplateColumns: "30% 65%",
                                    gap: "5%",
                                }}>
                                    <div className="text-base font-bold">Tổng số tiền bằng chữ:</div>
                                    <div>{convertCurrencyToWords(totalPriceChange, formCreate?.exchangeRate?.name)}</div>
                                </div>
                            </Form.Item>
                        </div>
                    </div>
                    <Form.Item label="Ghi chú">
                        <TextArea
                            value={formCreate?.description}
                            size={"large"}
                        />
                    </Form.Item>
                    <div className="bg-red-700 h-[2px] w-full my-3"/>
                    <Form.Item>
                        <div style={{display: "flex", marginTop: 20}}>
                            <Button
                                style={{marginLeft: "auto", marginRight: 10}}
                                key="submit"
                                title="Thêm"
                                onClick={() => nav(routes.IM_WAREHOUSE)}
                            >
                                <AiOutlineClose/> Hủy
                            </Button>

                        </div>
                    </Form.Item>
                </Form>
                {/* info detail*/}
                {showDetail ? (
                    <div
                        // className={"border-l-gray-300 border-l-[1px] pl-2"}
                    >
                        <IoArrowForwardCircleOutline className={"pointer mb-1"} size={25}
                                                     onClick={() => setShowDetail(false)} title={"Thu gọn"}/>
                        <div className="flex mb-3 border-b-gray-300 border-b-[0.5px]">
                            <div
                                className={`${tabTitle === "info" ? "border-b-red-700 border-b-[2px] text-red-700" : null} text-[16px] pointer px-2`}
                                onClick={() => setTabTitle("info")}>Thông tin chung
                            </div>
                            <div
                                className={`${tabTitle === "action" ? "border-b-red-700 border-b-[2px] text-red-700" : null} px-2 text-[16px] pointer`}
                                onClick={() => setTabTitle("action")}>Lịch sử hoạt động
                            </div>
                        </div>
                        {tabTitle === "info" ? (
                            <div>
                                <div className="mb-5">
                                    <span className="font-bold mr-3">Trạng thái đơn</span>
                                    <span>
                                    {formCreate?.status === "NEW" ? (
                                        <Tag color={"green"}>Mới </Tag>
                                    ) : formCreate?.status === "REFUSED" ? (
                                        <Tag color="#f50">Đã từ chối</Tag>
                                    ) : formCreate?.status === "DONE" ? (
                                        <Tag color={"yellow"}>Hoàn thành</Tag>
                                    ) : formCreate?.status === "CANCELED" ? (
                                        <Tag color={"red"}>Đã hủy</Tag>
                                    ) : formCreate?.status === "REVIEWING" ? (
                                        <Tag color="#87d068">Đang duyệt</Tag>
                                    ) : null}
                                         </span>
                                </div>
                                <div className="mb-3">
                                    <div className="font-bold">Người duyệt</div>
                                    <div>{formCreate?.approvals ? formCreate?.approvals?.map(item => item?.fullName).join(", ") : "Chưa có dữ liệu"} </div>
                                </div>
                                <div className="mb-3">
                                    <div className="font-bold">Người theo dõi</div>
                                    <div> {formCreate?.follows ? formCreate?.follows?.map(item => item?.fullName).join(", ") : "Chưa có dữ liệu"}</div>
                                </div>
                                <div>
                                    <Form name="validateOnly" layout="vertical" autoComplete="off">
                                        <Form.Item label={"Ý kiến"}
                                                   validateStatus={formCreate["noteValid"] ? "error" : ""}
                                                   help={formCreate["noteValid"] || ""}
                                        >
                                            <TextArea value={formCreate?.note}
                                                      size={"large"}
                                                      readOnly={true}
                                            />
                                        </Form.Item>
                                    </Form>

                                </div>
                                <div className="flex justify-around mt-[40px]">
                                    {handlePermissionApprove(formCreate) === true ? (
                                        <>
                                            <Popconfirm
                                                title="Thông báo"
                                                description="Bạn có chắc chắn muốn từ chối không ?"
                                                onConfirm={() => handleApprove("REFUSED")}
                                                okText="Có"
                                                cancelText="Không"
                                            >
                                                <AppCancelButton className="w-[100px]" title="Từ chối"/>
                                            </Popconfirm>
                                            <AppSaveButton className="w-[100px]" title="Phê duyệt"
                                                           onClick={() => handleApprove("APPROVED")}/>
                                        </>) : null}
                                </div>
                            </div>
                        ) : (
                            <div>
                                {formCreate?.approvedDetail ? (
                                    formCreate?.approvedDetail?.map(item => (
                                        <div className="border-l-4 border-red-700 pl-5 mb-3">
                                            <div className={"text-red-700"}>{item?.approveTime}</div>
                                            <div>{item?.userName} {item?.status === "NEW" ? "đã tạo phiếu" : (item?.status === "ASSIGN_APPR0VAL" ? "đã gán người phê duyệt cho phiếu" : "đã duyệt phiếu")}</div>
                                        </div>
                                    ))
                                ) : "Chưa có dữ liệu"
                                }

                            </div>
                        )}
                    </div>
                ) : (
                    <div>
                        <IoArrowBackCircleOutline className={"pointer hover:text-red-700"}
                                                  title={"Click để xem thông tin"} size={25}
                                                  onClick={() => setShowDetail(true)}/>
                    </div>
                )}
            </div>
        </div>
    );
}

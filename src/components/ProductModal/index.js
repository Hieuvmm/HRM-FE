import React, {useState, useEffect} from "react";
import {Modal, Form, Input, Select, Button} from "antd";
import {ExchangeRateApi} from "../../apis/ExchangeRate.api";
import {MaterialApi} from "../../apis/Material.api";

const {Option} = Select;

const ProductModal = ({totalTab, modalCreate, visible, onCancel, onOk, data, wareHouseList}) => {
    const [form] = Form.useForm();
    const [selectedTime, setSelectedTime] = useState("Tất cả");
    const [currentMaterial, setCurrentMaterial] = useState({});
    const [listMaterial, setListMaterial] = useState([]);
    const [realQuantity, setRealQuantity] = useState("");  // Số lượng thực
    const [price, setPrice] = useState("");

    useEffect(() => {
        if (selectedTime === "Tất cả") {
            setCurrentMaterial({
                materialCode: "",
                expQuantity: "",
                realQuantity: "",
                totalMoney: "",
                unit: "",
                exCode: "",
                materialType: "",
                name: "",
                price: "",
                totalPrice: ""
            });
            form.resetFields();
        } else if (selectedTime) {
            const product = data.productEx.find((item) => item.time === selectedTime);
            if (product && product.materialsEx.length > 0) {
                setCurrentMaterial(product.materialsEx[0]);
                form.setFieldsValue(product.materialsEx[0]);
            } else {
                setCurrentMaterial({
                    materialCode: "",
                    expQuantity: "",
                    realQuantity: "",
                    totalMoney: "",
                    unit: "",
                    exCode: "",
                    materialType: "",
                    name: "",
                    price: "",
                    totalPrice: ""
                });
                form.resetFields();
            }
        }
    }, [selectedTime, data, form]);

    const handleTimeChange = (value) => {
        setSelectedTime(value);
    };

    const handleSubmit = () => {
        form.validateFields()
            .then((values) => {
                onOk(values);
            })
            .catch((info) => {
                console.error("Validation failed:", info);
            });
    };

    const handleMaterialCodeChange = (value) => {
        setCurrentMaterial((prev) => ({
            ...prev,
            materialCode: value,
        }));
    };

    useEffect(() => {
        if (currentMaterial.materialCode) {
            MaterialApi.detail({"codeList": [currentMaterial.materialCode]})
                .then(response => {
                    setListMaterial(response.body)
                })
                .catch(error => {
                    console.error("Lỗi khi gọi MaterialApi:", error);
                });
        }
    }, [currentMaterial.materialCode]);

    useEffect(() => {
        if (realQuantity && price) {
            const totalMoney = parseFloat(realQuantity) * parseFloat(price);
            form.setFieldsValue({totalPrice: totalMoney});
        }
    }, [realQuantity, price, form]);

    const handleRealQuantityChange = (e) => {
        setRealQuantity(e.target.value);
    };

    const handlePriceChange = (value) => {
        setPrice(value);
    };

    return (
        <Modal
            title="Thông tin thêm hàng"
            visible={visible}
            onCancel={onCancel}
            footer={[
                <Button key="cancel" onClick={onCancel}>
                    Hủy
                </Button>,
                <Button key="submit" type="primary" onClick={handleSubmit}>
                    Lưu
                </Button>,
            ]}
        >
            <Form form={form} layout="vertical">
                <Form.Item label="Lần xuất" name="time">
                    <Select placeholder="Chọn lần xuất" onChange={handleTimeChange} defaultValue="Tất cả">
                        <Option key="all" value="Tất cả">
                            Tất cả
                        </Option>
                        {modalCreate.type === 'detail' ? (
                            data?.productEx &&
                            [...new Set(data.productEx.map((item) => item.time))].map((time) => (
                                <Option key={time} value={time}>
                                    {time}
                                </Option>
                            ))
                        ) : (
                            totalTab.map((time, index) => (
                                <Option key={`Lần xuất ${index}`} value={time}>
                                    {`Lần xuất ${time}`}
                                </Option>
                            ))
                        )}
                    </Select>
                </Form.Item>

                <Form.Item label="Mã sản phẩm" name="materialCode">
                    <Select placeholder="Chọn mã sản phẩm" onChange={handleMaterialCodeChange}>
                        <Option value="">Không có mã</Option>
                        {modalCreate.type === 'detail' ? (
                            <Option value={currentMaterial.materialCode}>
                                {currentMaterial.materialCode || "Không có mã"}
                            </Option>
                        ) : (
                            wareHouseList && wareHouseList.map((value) => (
                                <Option key={value.productCode} value={value.productCode}>
                                    {value.productCode}
                                </Option>
                            ))
                        )}
                    </Select>
                </Form.Item>
                <Form.Item label="Số lượng theo chứng từ" name="expQuantity">
                    <Input placeholder="Nhập số lượng chứng từ"/>
                </Form.Item>
                <Form.Item label="Số lượng thực" name="realQuantity">
                    <Input placeholder="Nhập số lượng thực nhập" value={realQuantity}
                           onChange={handleRealQuantityChange}/>
                </Form.Item>
                <Form.Item label="Thành tiền" name="totalMoney">
                    <Input placeholder="Nhập thành tiền"/>
                </Form.Item>
                <Form.Item label="Đơn vị" name="unit">
                    <Input placeholder="Nhập đơn vị" value={currentMaterial.unit ?? ""}/>
                </Form.Item>
                <Form.Item label="Tên sản phẩm" name="name">
                    <Input placeholder="Nhập tên sản phẩm" value={currentMaterial.name ?? ""}/>
                </Form.Item>
                <Form.Item label="Loại sản phẩm" name="materialType">
                    <Select placeholder="Chọn đơn vị">
                        <Option value="">Không có đơn vị</Option>
                        {listMaterial.map(item => (
                            <Option value={item.materialTypeCode}>
                                {item.materialTypeCode || ""}
                            </Option>))
                        }
                    </Select>
                </Form.Item>
                <Form.Item label="Đơn giá" name="price">
                    <Select placeholder="Chọn đơn giá" onChange={handlePriceChange}>
                        <Option value="">Không có đơn giá</Option>
                        {listMaterial.map(item => (
                            <Option value={item.listPrice}>
                                {item.listPrice || ""}
                            </Option>))
                        }
                    </Select>
                </Form.Item>
                <Form.Item label="Thành tiền" name="totalPrice">
                    <Input placeholder="Thành tiền" value={form.getFieldValue("totalPrice")} disabled/>
                </Form.Item>
            </Form>
        </Modal>
    );
};


export default ProductModal;
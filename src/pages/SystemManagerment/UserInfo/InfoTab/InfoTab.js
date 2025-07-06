import TextArea from "antd/es/input/TextArea";
import "./index.scss"
import React from "react";
import dayjs from "dayjs";
import {DatePicker, Form, Input, Radio, Select} from "antd";

function InfoTab({formUpdate, changeFormUpdate, formError}) {
    return (
        <>
            <Form name="validateOnly" layout="vertical" autoComplete="off">
                <div style={{display: "grid", gridTemplateColumns: "48% 48%", gap: "4%"}}>
                    <Form.Item label="Họ và tên"
                               validateStatus={formError["fullName"] ? "error" : ""}
                               help={formError["fullName"] || ""}
                    >
                        <Input
                            value={formUpdate?.fullName || ""}
                            onChange={(e) => changeFormUpdate("fullName", e.target.value)}
                            className="input-create"
                            size="large"
                        />

                    </Form.Item>
                    {/**/}
                    <Form.Item label="Ngày sinh"
                               validateStatus={formError["birthday"] ? "error" : ""}
                               help={formError["birthday"] || ""}
                    >

                        <DatePicker
                            label="Ngày sinh"
                            format="DD-MM-YYYY"
                            value={
                                formUpdate.birthday
                                    ? dayjs(formUpdate.birthday, "DD-MM-YYYY")
                                    : null
                            }
                            onChange={(value) => {
                                const formattedDate = value
                                    ? value.format("DD-MM-YYYY")
                                    : "";
                                changeFormUpdate("birthday", formattedDate);
                            }}
                            className="input-create"
                            size="large"
                        />
                    </Form.Item>
                </div>
                <div style={{display: "grid", gridTemplateColumns: "48% 48%", gap: "4%"}}>
                    <Form.Item
                        label="Giới tính"
                        validateStatus={formError["gender"] ? "error" : ""}
                        help={formError["gender"] || ""}
                    >
                        <Select
                            value={formUpdate?.gender}
                            onChange={(e) => changeFormUpdate("gender", e)}
                            className="input-create"
                            size="large"
                            options={[
                                {value: "MALE", label: "Nam"},
                                {value: "FEMALE", label: "Nữ"},
                            ]}

                        />
                    </Form.Item>
                    {/**/}
                    <Form.Item
                        label="Tình trạng hôn nhân"
                        validateStatus={formError["marriage"] ? "error" : ""}
                        help={formError["marriage"] || ""}
                    >
                        <Select
                            label="Tình trạng hôn nhân"
                            value={formUpdate?.marriage}
                            onChange={(e) => changeFormUpdate("marriage", e)}
                            className="input-create"
                            size="large"
                            options={[
                                {value: "độc thân", label: "Độc thân"},
                                {value: "ly hôn", label: "Ly hôn"},
                                {value: "đã kết hôn", label: "Đã kết hôn"}
                            ]}

                        />
                    </Form.Item>
                </div>
                {/**/}
                <div style={{display: "grid", gridTemplateColumns: "48% 48%", gap: "4%"}}>
                    <Form.Item
                        label="Địa chỉ"
                        validateStatus={formError["address"] ? "error" : ""}
                        help={formError["address"] || ""}
                    >
                        <Input

                            value={formUpdate?.address || ""}
                            onChange={(e) => changeFormUpdate("address", e.target.value)}
                            className="input-create"
                            size="large"
                        />
                    </Form.Item>
                    {/**/}
                    <Form.Item
                        label="Số điện thoại"
                        validateStatus={formError["phone"] ? "error" : ""}
                        help={formError["phone"] || ""}
                    >
                        <Input
                            value={formUpdate?.phone || ""}
                            onChange={(e) => changeFormUpdate("phone", e.target.value)}
                            className="input-create"
                            size={"large"}
                        />
                    </Form.Item>
                </div>
                {/**/}
                <div style={{display: "grid", gridTemplateColumns: "48% 48%", gap: "4%"}}>
                    <Form.Item
                        label="Email cá nhân"
                        validateStatus={formError["personalEmail"] ? "error" : ""}
                        help={formError["personalEmail"] || ""}
                    >
                        <Input
                            value={formUpdate?.personalEmail}
                            onChange={(e) => {
                                changeFormUpdate("personalEmail", e.target.value);
                            }}
                            className="input-create"
                            size={"large"}
                        />
                    </Form.Item>
                    {/**/}
                    <Form.Item
                        label="CMT/CCCD/Hộ Chiếu"
                        validateStatus={formError["cardNumber"] ? "error" : ""}
                        help={formError["cardNumber"] || ""}
                    >
                        <Input
                            value={formUpdate?.cardNumber || ""}
                            onChange={(e) => changeFormUpdate("cardNumber", e.target.value)}
                            className="input-create"
                            size={"large"}
                        />
                    </Form.Item>
                </div>
                {/**/}
                <div style={{display: "grid", gridTemplateColumns: "48% 48%", gap: "4%"}}>
                    <Form.Item
                        label="Ngày cấp"
                        validateStatus={formError["issueDate"] ? "error" : ""}
                        help={formError["issueDate"] || ""}
                    >
                        <DatePicker

                            format="DD-MM-YYYY"
                            value={
                                formUpdate.issueDate
                                    ? dayjs(formUpdate.issueDate, "DD-MM-YYYY")
                                    : null
                            }
                            onChange={(value) => {
                                const formattedDate = value
                                    ? value.format("DD-MM-YYYY")
                                    : "";
                                changeFormUpdate("issueDate", formattedDate);
                            }}
                            className="input-create"
                            size={"large"}
                        />

                    </Form.Item>
                    {/**/}
                    <Form.Item
                        label="Nơi cấp"
                        validateStatus={formError["issuePlace"] ? "error" : ""}
                        help={formError["issuePlace"] || ""}
                    >
                        <Input
                            value={formUpdate?.issuePlace || ""}
                            onChange={(e) => changeFormUpdate("issuePlace", e.target.value)}
                            className="input-create"
                            size={"large"}
                        />
                    </Form.Item>
                </div>
            </Form>
        </>
    );
}

export default InfoTab;

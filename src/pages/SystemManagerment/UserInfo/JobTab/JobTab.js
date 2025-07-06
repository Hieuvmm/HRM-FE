import {DatePicker, Form, Input, Radio, Select} from "antd";

import React, {useEffect, useState} from "react";
import "../JobTab/index.scss";
import dayjs from "dayjs";
import {JobTitleApi} from "../../../../apis/JobTitle.api";
import {DepartmentApi} from "../../../../apis/Department.api";
import {JobPositionApi} from "../../../../apis/JobPosition.api";


function JobTab({formUpdate, changeFormUpdate, formError, typeUpdate}) {
    const {data: jobTitles} = JobTitleApi.useGetList({status: "ACTIVE"}, {
        staleTime: 0,
        cacheTime: 0,
        enabled: !!typeUpdate
    })
    const {data: departments} = DepartmentApi.useGetList({status: "ACTIVE"}, {
        staleTime: 0,
        cacheTime: 0,
        enabled: !!typeUpdate
    })
    const {data: jobPositions} = JobPositionApi.useGetList({status: "ACTIVE"}, {
        staleTime: 0,
        cacheTime: 0,
        enabled: !!typeUpdate
    })
    return (
        <>
            <Form name="validateOnly" layout="vertical" autoComplete="off">
                <div style={{display: "grid", gridTemplateColumns: "48% 48%", gap: "4%"}}>
                    <Form.Item label={"Mã nhân viên"}>
                        <Input
                            disabled={true}
                            className="input-create"
                            value={formUpdate?.userId || ""}
                            size="large"
                        />
                    </Form.Item>
                    <Form.Item label={"Mã chấm công"}
                               validateStatus={formError["timeKeepingCode"] ? "error" : ""}
                               help={formError["timeKeepingCode"] || ""}
                    >
                        <Input
                            className="input-create"
                            value={formUpdate?.timeKeepingCode || ""}
                            onChange={(e) => changeFormUpdate("timeKeepingCode", e.target.value)}
                            size="large"
                        />
                    </Form.Item>
                </div>
                <div style={{display: "grid", gridTemplateColumns: "48% 48%", gap: "4%"}}>
                    <Form.Item
                        label="Ngày vào công ty"
                        validateStatus={formError["jobOnboardDate"] ? "error" : ""}
                        help={formError["jobOnboardDate"] || ""}
                    >
                        <DatePicker
                            className="input-create"
                            value={
                                formUpdate["jobOnboardDate"]
                                    ? dayjs(formUpdate["jobOnboardDate"], "DD-MM-YYYY")
                                    : null
                            }
                            format="DD-MM-YYYY"
                            onChange={(value) => {
                                const formattedDate = value
                                    ? value.format("DD-MM-YYYY")
                                    : "";
                                changeFormUpdate("jobOnboardDate", formattedDate);
                            }}
                            size="large"
                        />
                    </Form.Item>
                    <Form.Item
                        label="Ngày kết thúc thử việc"
                        validateStatus={formError["jobOfficialDate"] ? "error" : ""}
                        help={formError["jobOfficialDate"] || ""}
                    >
                        <DatePicker
                            className="input-create"
                            label="Ngày kết thúc thử việc"
                            value={
                                formUpdate["jobOfficialDate"]
                                    ? dayjs(formUpdate["jobOfficialDate"], "DD-MM-YYYY")
                                    : null
                            }
                            format="DD-MM-YYYY"
                            onChange={(value) => {
                                const formattedDate = value ? value.format("DD-MM-YYYY") : "";
                                changeFormUpdate("jobOfficialDate", formattedDate);
                            }}
                            size="large"
                        />
                    </Form.Item>
                </div>
                <div style={{display: "grid", gridTemplateColumns: "48% 48%", gap: "4%"}}>
                    <Form.Item
                        label="Trạng thái"
                        validateStatus={formError["status"] ? "error" : ""}
                        help={formError["status"] || ""}
                    >

                        <div className="col-input-status">
                            <Radio.Group
                                style={{width: "100%", height: "100%"}}
                                onChange={(e) => changeFormUpdate("status", e)}
                                value={formUpdate.status || "ACTIVE"}
                            >
                                <div className="radio-status">
                                    <div style={{fontSize: 14}}>
                                        <Radio value="ACTIVE">Làm việc</Radio>
                                    </div>
                                    <div style={{fontSize: 14}}>
                                        <Radio value="INACTIVE">Nghỉ việc</Radio>
                                    </div>
                                    {/*<div style={{fontSize: 14}}>*/}
                                    {/*    <Radio value="PENDING">Đang chờ</Radio>*/}
                                    {/*</div>*/}
                                </div>
                            </Radio.Group>
                        </div>
                    </Form.Item>
                    <Form.Item
                        label="Phòng ban"
                        validateStatus={formError["jobDepartmentCode"] ? "error" : ""}
                        help={formError["jobDepartmentCode"] || ""}
                    > <Select

                        value={formUpdate?.jobDepartmentCode || ""}
                        onChange={(value) => changeFormUpdate("jobDepartmentCode", value)}
                        className="input-create"
                        size={"large"}
                        options={departments?.body?.map((item) => ({
                            value: item.code,
                            label: item.name
                        }))}

                    /></Form.Item>
                </div>

                <div style={{display: "grid", gridTemplateColumns: "48% 48%", gap: "4%"}}>
                    <Form.Item
                        label="Quản lý bởi"
                        validateStatus={formError["jobManager"] ? "error" : ""}
                        help={formError["jobManager"] || ""}
                    > <Input

                        value={formUpdate?.jobManager || ""}
                        onChange={(e) => changeFormUpdate("jobManager", e.target.value)}
                        className="input-create"
                        size={"large"}
                    /> </Form.Item>
                    <Form.Item
                        label="Chức vụ"
                        validateStatus={formError["jobPositionCode"] ? "error" : ""}
                        help={formError["jobPositionCode"] || ""}
                    > <Select
                        className="input-create"
                        size={"large"}
                        value={formUpdate?.jobPositionCode || ""}
                        onChange={(value) => changeFormUpdate("jobPositionCode", value)}
                        options={jobPositions?.body?.map((item) => ({
                            value: item.code,
                            label: item.name
                        }))}
                    />
                    </Form.Item>
                </div>
                <div style={{display: "grid", gridTemplateColumns: "48% 48%", gap: "4%"}}>
                    <Form.Item
                        label="Chức danh"
                        validateStatus={formError["jobTitleCode"] ? "error" : ""}
                        help={formError["jobTitleCode"] || ""}
                    >
                        <Select
                            value={formUpdate?.jobTitleCode || ""}
                            onChange={(value) => changeFormUpdate("jobTitleCode", value)}
                            className="input-create"
                            size={"large"}
                            options={jobTitles?.body?.map((item) => ({
                                value: item.code,
                                label: item.name
                            }))}
                        />
                    </Form.Item>
                    <Form.Item
                        label="Địa chỉ làm việc"
                        validateStatus={formError["jobAddress"] ? "error" : ""}
                        help={formError["jobAddress"] || ""}
                    >
                        <Input
                            value={formUpdate?.jobAddress || ""}
                            onChange={(e) => changeFormUpdate("jobAddress", e.target.value)}
                            className="input-create"
                            size={"large"}
                        />
                    </Form.Item>
                </div>
            </Form>
        </>
    )
}

export default JobTab;

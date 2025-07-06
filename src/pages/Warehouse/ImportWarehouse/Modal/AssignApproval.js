import {Button, Form, Modal, Popconfirm, Select,} from "antd";
import React, {useEffect, useState} from "react";
import {RiSaveLine} from "react-icons/ri";
import {AiOutlineClose} from "react-icons/ai";
import {AppNotification} from "../../../../components/Notification/AppNotification";
import {handleFormUpdate} from "../../../../utils/AppUtil";
import {errorTexts, statusUtils} from "../../../../utils/common";
import {ImportBillApi} from "../../../../apis/ImportBill.api";
import {UserApi} from "../../../../apis/User.api";

const {Option} = Select
export default function ModalAssignApproval({modalAssignApproval, setModalAssignApproval, refetch}) {

    const [formErrors, setFormErrors] = useState({});
    const initialFormCreate = {
        follows: "",
        approves: ""
    }

    useEffect(() => {
        if (modalAssignApproval.status) {
            console.log(modalAssignApproval)
        }
    }, [modalAssignApproval])
    const [formCreate, setFormCreate] = useState(initialFormCreate);

    const {data: resAccount} = UserApi.useSearch({
        status: statusUtils.ACTIVE,
    }, {staleTime: 0, cacheTime: 0, enabled: modalAssignApproval.status})
    const closeModal = () => {
        setModalAssignApproval({
            status: false,
            importBillIds: []
        })
        setFormCreate(initialFormCreate)
    }

    const handleAssignApproval = () => {
        const approveCount = formCreate?.approves?.length;
        const followCount = formCreate?.follows?.length;

        const isValid = approveCount > 0 && followCount > 0;

        if (!isValid) {
            const errors = {
                approves: approveCount === 0 ? errorTexts.REQUIRE_FIELD : "",
                follows: followCount === 0 ? errorTexts.REQUIRE_FIELD : "",
            }
            setFormErrors(errors);
            return;
        }
        const itemDuplicates = formCreate?.follows?.filter(item => formCreate?.approves?.includes(item))
        if (itemDuplicates.length > 0) {
            setFormErrors(
                {
                    ...formErrors,
                    follows: "Người duyệt đã trùng với người theo dõi"
                }
            )
            return;
        }
        ImportBillApi.assignApproval({
            ...formCreate,
            importBillCodes: modalAssignApproval?.importBillCodes
        }).then((res) => {
            refetch()
            AppNotification.success("Gán người duyệt thành công")
            closeModal()
        }).catch((errors) => {
            AppNotification.error(errors.message)
        })
    }
    return (
        <Modal
            title="Gửi phê duyệt"
            open={modalAssignApproval.status}
            onCancel={closeModal}
            okButtonProps={{style: {display: "none"}}}
            cancelButtonProps={{style: {display: "none"}}}
        >
            <Form name="validateOnly" layout="vertical" autoComplete="off">
                <Form.Item label="Người phê duyệt"
                           validateStatus={formErrors["approves"] ? "error" : ""}
                           help={formErrors["approves"] || ""}
                >
                    <Select
                        mode="multiple"
                        size={"large"}
                        className="custom-select"
                        placeholder="Chọn người phê duyệt"
                        value={!formCreate?.approves ? null : formCreate?.approves}
                        onChange={(value) => handleFormUpdate(setFormCreate, setFormErrors, "approves", value)}
                    >
                        {resAccount?.body?.map((item) => (
                            <Option key={item?.userId} value={item?.userId}>
                                {item?.userPersonalInfo?.fullName}
                            </Option>))}
                    </Select>
                </Form.Item>
                <Form.Item label="Người theo dõi"
                           validateStatus={formErrors["follows"] ? "error" : ""}
                           help={formErrors["follows"] || ""}
                >
                    <Select
                        mode="multiple"
                        size={"large"}
                        className="custom-select"
                        placeholder="Chọn người theo dõi"
                        value={!formCreate?.follows ? null : formCreate?.follows}
                        onChange={(value) => handleFormUpdate(setFormCreate, setFormErrors, "follows", value)}
                    >
                        {resAccount?.body?.map((item) => (
                            <Option key={item?.userId} value={item?.userId}>
                                {item?.userPersonalInfo?.fullName}
                            </Option>))}
                    </Select>
                </Form.Item>
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

                        {/* <Popconfirm
                            title="Thông báo"
                            description="Bạn có chắc chắn muốn thêm không ?"
                            onConfirm={() => {
                                handleAssignApproval();
                            }}
                            okText="Có"
                            cancelText="Không"
                        > */}
                        <Button
                            className="button-add-promotion bg-red-700 text-[white]"
                            key="submit"
                            title="Thêm"
                            onClick={() => {
                                handleAssignApproval();
                            }}
                        >
                            <RiSaveLine/> Gán
                        </Button>
                        {/* </Popconfirm> */}
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    );
}

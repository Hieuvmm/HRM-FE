import {Button, Form, Modal, Popconfirm, Select,} from "antd";
import React, {useState} from "react";
import {RiSaveLine} from "react-icons/ri";
import {AiOutlineClose} from "react-icons/ai";
import {AppNotification} from "../../../../components/Notification/AppNotification";
import {handleFormUpdate, updateItemToList} from "../../../../utils/AppUtil";
import {endpoints, errorTexts, statusUtils} from "../../../../utils/common";
import {UserApi} from "../../../../apis/User.api";
import {ProjectApi} from "../../../../apis/Project.api";
import {useQueryClient} from "@tanstack/react-query";

const {Option} = Select
export default function ModalAssignApproval({
                                                modalAssignApproval,
                                                setModalAssignApproval,
                                                formSearch,
                                                projects,
                                                setRowKey
                                            }) {
    const queryClient = useQueryClient();
    const [formErrors, setFormErrors] = useState({});
    const initialFormCreate = {
        approves: ""
    }
    const [formCreate, setFormCreate] = useState(initialFormCreate);

    const {data: resAccount} = UserApi.useSearch({
        status: statusUtils.ACTIVE,
    }, {staleTime: 0, cacheTime: 0, enabled: modalAssignApproval.status})
    const closeModal = () => {
        setModalAssignApproval({
            status: false,
            projectCodes: []
        })
        setFormCreate(initialFormCreate)
    }

    const handleAssignApproval = () => {

        if (formCreate?.approves?.length === 0) {
            const errors = {
                approves: errorTexts.REQUIRE_FIELD,
            }
            setFormErrors(errors);
            return;
        }

        ProjectApi.assignApproval({
            ...formCreate,
            projectCodes: modalAssignApproval?.projectCodes
        }).then(async (res) => {
            const updatedProjects = projects.filter((item) => modalAssignApproval?.projectCodes.includes(item.code)).map((item) => ({
                ...item,
                status: "REVIEWING",
                approvals: formCreate?.approves?.join(",")
            }));
            await Promise.all(
                updatedProjects.map(project =>
                    updateItemToList(project, endpoints.project.PATH_LIST_PROJECT, queryClient, formSearch)
                )
            );
            setRowKey([])
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
                        <Button
                            className="button-add-promotion bg-red-700 text-[white]"
                            key="submit"
                            title="Thêm"
                            onClick={handleAssignApproval}
                        >
                            <RiSaveLine/> Gán
                        </Button>

                        {/*<Popconfirm*/}
                        {/*    title="Thông báo"*/}
                        {/*    description="Bạn có chắc chắn muốn thêm không ?"*/}
                        {/*    onConfirm={() => {*/}
                        {/*        handleAssignApproval();*/}
                        {/*    }}*/}
                        {/*    okText="Có"*/}
                        {/*    cancelText="Không"*/}
                        {/*>*/}
                        {/*    <Button*/}
                        {/*        className="button-add-promotion bg-red-700 text-[white]"*/}
                        {/*        key="submit"*/}
                        {/*        title="Thêm"*/}
                        {/*        onConfirm={() => {*/}
                        {/*            handleAssignApproval();*/}
                        {/*        }}*/}
                        {/*    >*/}
                        {/*        <RiSaveLine/> Gán*/}
                        {/*    </Button>*/}
                        {/*</Popconfirm>*/}
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    );
}

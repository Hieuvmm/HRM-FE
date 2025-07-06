import React, { useState } from "react";
import { 
    Button, 
    Form, 
    Input, 
    Modal, 
    Popconfirm, 
    Select, 
    Switch, 
    Tag, 
    Card,
    Tooltip,
    Badge,
    Divider,
    Typography,
    Dropdown
} from "antd";
import { 
    PiUsersFour,
    PiShieldCheck,
    PiWarning 
} from "react-icons/pi";
import { RiSaveLine } from "react-icons/ri";
import AppTable from "../../../components/Table/AppTable";
import AppCreateButton from "../../../components/AppButton/AppCreateButton";
import AppFilter from "../../../components/AppFilter/AppFilter";
import { handleFormSearch, handleFormUpdate } from "../../../utils/AppUtil";
import { errorTexts } from "../../../utils/common";
import { AppNotification } from "../../../components/Notification/AppNotification";
import { 
    EyeOutlined, 
    EditOutlined, 
    DeleteOutlined, 
    MoreOutlined,
    ReloadOutlined
} from "@ant-design/icons";
import PropTypes from "prop-types";

const { Option } = Select;
const { Title, Text } = Typography;

// Mock Data
const mockData = [
    {
        roleCode: "ADMIN",
        roleName: "Quản trị viên",
        description: "Quản lý toàn bộ hệ thống",
        status: "ACTIVE",
        userCount: 3,
        permissions: [
            {
                moduleCode: "WH",
                moduleName: "Kho hàng",
                actions: ["VIEW", "CREATE", "UPDATE", "DELETE"]
            }
        ]
    },
    {
        roleCode: "MANAGER",
        roleName: "Quản lý",
        description: "Quản lý chung",
        status: "ACTIVE",
        userCount: 5,
        permissions: [
            {
                moduleCode: "WH",
                moduleName: "Kho hàng",
                actions: ["VIEW", "UPDATE"]
            }
        ]
    },
    {
        roleCode: "USER",
        roleName: "Người dùng",
        description: "Người dùng thông thường",
        status: "ACTIVE",
        userCount: 10,
        permissions: [
            {
                moduleCode: "WH",
                moduleName: "Kho hàng",
                actions: ["VIEW"]
            }
        ]
    }
];

const permissionModules = [
    {
        moduleCode: "WH",
        moduleName: "Kho hàng",
        actions: ["VIEW", "CREATE", "UPDATE", "DELETE"]
    },
    {
        moduleCode: "ORD",
        moduleName: "Đơn hàng",
        actions: ["VIEW", "CREATE", "UPDATE", "DELETE"]
    },
    {
        moduleCode: "USR",
        moduleName: "Người dùng",
        actions: ["VIEW", "CREATE", "UPDATE", "DELETE"]
    },
    {
        moduleCode: "ROLE",
        moduleName: "Phân quyền",
        actions: ["VIEW", "CREATE", "UPDATE", "DELETE"]
    }
];

function Permissions() {
    const [formSearch, setFormSearch] = useState({
        page: 1,
        limit: 10,
        status: "",
        searchText: "",
    });

    const initialModalCreate = {
        status: false,
        roleCode: "",
        typeUpdate: false,
        typeCreate: false
    };
    const [modalCreate, setModalCreate] = useState(initialModalCreate);

    const initialFormCreate = {
        status: "ACTIVE",
        permissions: []
    };
    const [formCreate, setFormCreate] = useState(initialFormCreate);
    const [formErrors, setFormErrors] = useState({});

    const validateForm = () => {
        const errors = {};
        if (!formCreate.roleName?.trim()) {
            errors.roleName = errorTexts.REQUIRE_FIELD;
        }
        if (!formCreate.description?.trim()) {
            errors.description = errorTexts.REQUIRE_FIELD;
        }
        if (!formCreate.permissions?.length) {
            errors.permissions = "Vui lòng chọn ít nhất một quyền";
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;
        
        AppNotification.success(
            formCreate.roleCode 
                ? "Cập nhật vai trò thành công" 
                : "Tạo vai trò thành công"
        );
        closeModal();
    };

    const handleDelete = (record) => {
        if (record.status === "ACTIVE") {
            AppNotification.error("Chỉ được xóa vai trò không hoạt động");
            return;
        }
        AppNotification.success("Xóa vai trò thành công");
    };

    const closeModal = () => {
        setModalCreate(initialModalCreate);
        setFormCreate(initialFormCreate);
        setFormErrors({});
    };

    const changeFormSearch = (name, value) => {
        handleFormSearch(setFormSearch, name, value);
    };

    const handleDetail = (record) => {
        setFormCreate({
            roleCode: record.roleCode,
            roleName: record.roleName,
            description: record.description,
            status: record.status,
            permissions: record.permissions || []
        });
        setModalCreate({ status: true, roleCode: record.roleCode, typeUpdate: true });
    };

    const columns = [
        {
            title: "STT",
            width: "5%",
            render: (_, __, index) => (
                <Text>
                    {(formSearch.page - 1) * formSearch.limit + index + 1}
                </Text>
            )
        },
        {
            title: "Mã vai trò",
            dataIndex: "roleCode",
            width: "15%",
            render: (text) => (
                <Text strong className="text-blue-600">
                    {text}
                </Text>
            )
        },
        {
            title: "Tên vai trò",
            dataIndex: "roleName",
            width: "20%",
            render: (text, record) => (
                <div className="flex items-center gap-2">
                    <PiShieldCheck 
                        className={`text-xl ${
                            record.status === "ACTIVE" 
                                ? "text-green-500" 
                                : "text-gray-400"
                        }`}
                    />
                    <Text strong>{text}</Text>
                </div>
            )
        },
        {
            title: "Mô tả",
            dataIndex: "description",
            width: "25%"
        },
        {
            title: "Người dùng",
            dataIndex: "userCount",
            width: "10%",
            align: "center",
            render: (userCount) => userCount
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            width: "10%",
            render: (status) => (
                <Tag 
                    color={status === "ACTIVE" ? "success" : "default"}
                    className="px-3 py-1"
                >
                    {status === "ACTIVE" ? "Hoạt động" : "Không hoạt động"}
                </Tag>
            )
        },
        {
            title: "Thao tác",
            width: "10%",
            render: (_, record) => (
                <Dropdown
                    trigger={["click"]}
                    menu={{
                        items: [
                            {
                                key: "detail",
                                label: "Chi tiết",
                                icon: <EyeOutlined />,
                                onClick: () => handleDetail(record)
                            },
                            {
                                key: "edit",
                                label: "Chỉnh sửa",
                                icon: <EditOutlined />,
                                onClick: () => handleDetail(record)
                            },
                            {
                                key: "delete",
                                label: (
                                    <Popconfirm
                                        title={
                                            <div>
                                                <Title level={5}>Xác nhận xóa</Title>
                                                <Text>Bạn có chắc chắn muốn xóa vai trò này?</Text>
                                            </div>
                                        }
                                        onConfirm={() => handleDelete(record)}
                                        okText="Xóa"
                                        cancelText="Hủy"
                                        icon={<PiWarning className="text-red-500" />}
                                    >
                                        <div className="text-red-500">Xóa</div>
                                    </Popconfirm>
                                ),
                                icon: <DeleteOutlined className="text-red-500" />,
                                danger: true
                            }
                        ]
                    }}
                >
                    <Button
                        type="text"
                        icon={<MoreOutlined />}
                        className="border-none shadow-none"
                        onClick={(e) => e.stopPropagation()}
                    />
                </Dropdown>
            )
        }
    ];

    return (
        <div className={"bg-white h-full"}>
            <Card>
                <div className="mb-4">
                <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center">
                            <Title level={5} className="!mb-0 mr-4 pointer text-red-700 font-bold">
                                Quản lý phân quyền
                            </Title>
                            <AppCreateButton 
                                onClick={() => setModalCreate({ 
                                    ...initialModalCreate, 
                                    status: true, 
                                    typeCreate: true 
                                })} 
                                text="Thêm mới"
                            />
                        </div>
                        <AppFilter>
                            <Select
                                placeholder="Trạng thái"
                                value={formSearch.status}
                                onChange={(value) => changeFormSearch("status", value)}
                                style={{ width: 180 }}
                                allowClear
                                options={[
                                    { value: "ACTIVE", label: "Hoạt động" },
                                    { value: "INACTIVE", label: "Không hoạt động" }
                                ]}
                            />
                            <Input.Search
                                placeholder="Tìm kiếm theo mã, tên vai trò"
                                value={formSearch.searchText}
                                onChange={(e) => changeFormSearch("searchText", e.target.value)}
                                style={{ width: 300 }}
                                allowClear
                            />
                            <Tooltip title="Làm mới">
                                <Button 
                                    icon={<ReloadOutlined />}
                                    onClick={() => {
                                        setFormSearch({
                                            page: 1,
                                            limit: 10,
                                            status: "",
                                            searchText: "",
                                        });
                                    }}
                                />
                            </Tooltip>
                        </AppFilter>
                    </div>
                </div>

                <AppTable
                    columns={columns}
                    dataSource={mockData}
                    formSearch={formSearch}
                    changeFormSearch={changeFormSearch}
                    totalPages={1}
                    totalElement={mockData.length}
                    handleClick={handleDetail}
                    rowKey="roleCode"
                    scroll={{ x: 1000 }}
                />
            </Card>

            <Modal
                title={
                    <div className="flex items-center gap-2">
                        <PiShieldCheck className="text-xl text-blue-500" />
                        <Text strong>
                            {modalCreate.typeUpdate ? "Cập nhật vai trò" : "Thêm vai trò mới"}
                        </Text>
                    </div>
                }
                open={modalCreate.status}
                onCancel={closeModal}
                footer={[
                    <Button key="cancel" onClick={closeModal}>
                        Hủy
                    </Button>,
                    <Button 
                        key="submit"
                        type="primary" 
                        icon={<RiSaveLine />}
                        onClick={handleSubmit}
                    >
                        {modalCreate.typeUpdate ? "Cập nhật" : "Thêm mới"}
                    </Button>
                ]}
                width={800}
            >
                <Form layout="vertical" className="mt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            label="Tên vai trò"
                            validateStatus={formErrors.roleName ? "error" : ""}
                            help={formErrors.roleName}
                            required
                        >
                            <Input
                                value={formCreate.roleName}
                                onChange={(e) => handleFormUpdate(
                                    setFormCreate, 
                                    setFormErrors, 
                                    "roleName", 
                                    e.target.value
                                )}
                                placeholder="Nhập tên vai trò"
                            />
                        </Form.Item>

                        <Form.Item label="Trạng thái">
                            <Switch
                                checked={formCreate.status === "ACTIVE"}
                                onChange={(checked) => handleFormUpdate(
                                    setFormCreate,
                                    setFormErrors,
                                    "status",
                                    checked ? "ACTIVE" : "INACTIVE"
                                )}
                                checkedChildren="Hoạt động"
                                unCheckedChildren="Không hoạt động"
                            />
                        </Form.Item>
                        </div>

                    <Form.Item
                        label="Mô tả"
                        validateStatus={formErrors.description ? "error" : ""}
                        help={formErrors.description}
                        required
                    >
                        <Input.TextArea
                            value={formCreate.description}
                            onChange={(e) => handleFormUpdate(
                                setFormCreate, 
                                setFormErrors, 
                                "description", 
                                e.target.value
                            )}
                            placeholder="Nhập mô tả"
                            rows={4}
                        />
                    </Form.Item>

                    <Divider orientation="left">
                        <Text strong>Phân quyền chức năng</Text>
                    </Divider>

                    {formErrors.permissions && (
                        <div className="mb-4 text-red-500">
                            {formErrors.permissions}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        {permissionModules.map(module => (
                                <Card 
                                key={module.moduleCode}
                                size="small"
                                title={
                                    <div className="flex items-center gap-2">
                                        <PiShieldCheck className="text-blue-500" />
                                        <Text strong>{module.moduleName}</Text>
                                    </div>
                                }
                                className="shadow-sm"
                            >
                                <div className="space-y-3">
                                    {module.actions.map(action => (
                                        <div 
                                            key={`${module.moduleCode}_${action}`}
                                            className="flex justify-between items-center"
                                        >
                                            <Text>
                                                {action === "VIEW" && "Xem"}
                                                {action === "CREATE" && "Thêm mới"}
                                                {action === "UPDATE" && "Cập nhật"}
                                                {action === "DELETE" && "Xóa"}
                                            </Text>
                                                <Switch 
                                                size="small"
                                                checked={formCreate.permissions
                                                    ?.find(p => p.moduleCode === module.moduleCode)
                                                    ?.actions.includes(action)}
                                                onChange={(checked) => {
                                                    const newPermissions = [...(formCreate.permissions || [])];
                                                    const moduleIndex = newPermissions
                                                        .findIndex(p => p.moduleCode === module.moduleCode);
                                                    
                                                    if (moduleIndex === -1) {
                                                        if (checked) {
                                                            newPermissions.push({
                                                                moduleCode: module.moduleCode,
                                                                moduleName: module.moduleName,
                                                                actions: [action]
                                                            });
                                                        }
                                                    } else {
                                                        if (checked) {
                                                            newPermissions[moduleIndex].actions
                                                                .push(action);
                                                        } else {
                                                            newPermissions[moduleIndex].actions = 
                                                                newPermissions[moduleIndex].actions
                                                                    .filter(a => a !== action);
                                                        }
                                                    }
                                                    
                                                    handleFormUpdate(
                                                        setFormCreate,
                                                        setFormErrors,
                                                        "permissions",
                                                        newPermissions
                                                    );
                                                }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            ))}
                        </div>
                </Form>
            </Modal>
        </div>
    );
}

Permissions.propTypes = {
    // Add any necessary prop types here
};

export default React.memo(Permissions);

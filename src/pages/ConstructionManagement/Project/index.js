import { Button, Popover, Radio, Space, Tag } from "antd";
import React, { useState } from "react";
import { PiDotsThreeOutlineVerticalFill } from "react-icons/pi";
import AppTable from "../../../components/Table/AppTable";
import AppCreateButton from "../../../components/AppButton/AppCreateButton";
import AppFilter from "../../../components/AppFilter/AppFilter";
import {
  dataSource,
  handleFormSearch,
  updateItemToList,
} from "../../../utils/AppUtil";
import { endpoints, routes } from "../../../utils/common";
import { AppNotification } from "../../../components/Notification/AppNotification";
import { useNavigate } from "react-router-dom";
import { ProjectApi } from "../../../apis/Project.api";
import { IoIosSend } from "react-icons/io";
import ModalAssignApproval from "../../ConstructionManagement/Project/AssignApproval/AssignApproval";
import { useUserStore } from "../../../store/storeUser";
import { useQueryClient } from "@tanstack/react-query";

export default function Project() {
  const nav = useNavigate();
  const queryClient = useQueryClient();
  const [data] = useUserStore((state) => [state.data]);
  const [formSearch, setFormSearch] = useState({
    page: 1,
    limit: 10,
    status: "",
    searchText: "",
  });
  const [rowKey, setRowKey] = useState([]);
  const { data: projectRes } = ProjectApi.useGetProjects(formSearch, {
    staleTime: 0,
    cacheTime: 0,
  });
  const [modalAssignApproval, setModalAssignApproval] = useState({
    status: false,
    projectCodes: [],
  });
  const content = (record) => {
    return (
      <div className="p-1 pointer">
        <div
          className="mb-0 p-2 pr-6 hover:bg-red-100"
          onClick={() => nav(routes.PROJECT_UPDATE + record?.code)}
        >
          Chỉnh sửa
        </div>

        {record?.status === "REVIEWING" &&
        record?.approvals?.includes(data?.userId) ? (
          <div
            className="mb-0 p-2 pr-6 hover:bg-red-100"
            onClick={() => handleApprove("APPROVED", record?.code)}
          >
            Duyệt
          </div>
        ) : null}

        {record?.status === "REVIEWING" &&
        record?.approvals?.includes(data?.userId) ? (
          <div
            className="mb-0 p-2 pr-6 hover:bg-red-100"
            onClick={() => handleApprove("REFUSED", record?.code)}
          >
            Từ chối
          </div>
        ) : null}
        {record?.status === "APPROVED" ? (
          <div
            className="mb-0 p-2 pr-6 hover:bg-red-100"
            onClick={() => handleApprove("HANDLING", record?.code)}
          >
            Bắt đầu thi công
          </div>
        ) : null}
        {record?.status === "PAUSED" ? (
          <div
            className="mb-0 p-2 pr-6 hover:bg-red-100"
            onClick={() => handleApprove("GO_ON", record?.code)}
          >
            Tiếp tục thi công
          </div>
        ) : null}
        {record?.status === "HANDLING" ? (
          <div
            className="mb-0 p-2 pr-6 hover:bg-red-100"
            onClick={() => handleApprove("PAUSED", record?.code)}
          >
            Dừng
          </div>
        ) : null}
        {record?.status === "HANDLING" ? (
          <div
            className="mb-0 p-2 pr-6 hover:bg-red-100"
            onClick={() => handleApprove("CANCELED", record?.code)}
          >
            Hủy
          </div>
        ) : null}
        {record?.status === "HANDLING" ? (
          <div
            className="mb-0 p-2 pr-6 hover:bg-red-100"
            onClick={() => handleApprove("DONE", record?.code)}
          >
            Kết thúc (Hoàn thành)
          </div>
        ) : null}
        {/*<Popconfirm*/}
        {/*    title="Thông báo"*/}
        {/*    description="Bạn có chắc chắn muốn xóa không ?"*/}
        {/*    onConfirm={() => {*/}
        {/*        handleDelete(record);*/}
        {/*    }}*/}
        {/*    okText="Có"*/}
        {/*    cancelText="Không"*/}
        {/*>*/}
        {/*    <div className="mb-0 p-2 pr-6 hover:bg-red-100"*/}
        {/*    >Xóa*/}
        {/*    </div>*/}
        {/*</Popconfirm>*/}
      </div>
    );
  };

  const changeFormSearch = (name, value) => {
    handleFormSearch(setFormSearch, name, value);
  };

  const handleDelete = (record) => {
    if (record.status === "ACTIVE") {
      AppNotification.error("Chỉ được xóa bản ghi không hoạt động");
      return;
    }
    AppNotification.success("Xóa dự án thành công");
  };
  const handleApprove = (status, projectCode) => {
    const approveReq = {
      status: status,
      userId: data?.userId,
      projectCode: projectCode,
      note: "",
    };
    const updateProjects = projectRes?.body?.find(
      (item) => item.code === projectCode
    );
    const statusText = (status) => {
      if (status === "APPROVED") {
        return "Duyệt dự án thành công";
      } else if (status === "REFUSED") {
        return "Từ chối dự án thành công";
      } else if (status === "CANCELED") {
        return "Hủy dự án thành công";
      } else if (status === "PAUSED") {
        return "Tạm dừng dự án thành công";
      } else if (status === "GO_ON" && updateProjects?.status === "PAUSED") {
        return "Tiếp tục dự án thành công";
      } else if (
        status === "HANDLING" &&
        updateProjects?.status === "APPROVED"
      ) {
        return "Bắt đầu dự án thành công";
      } else {
        return "Kết thúc (Hoàn thành dự án) dự án thành công";
      }
    };
    ProjectApi.approve(approveReq)
      .then((res) => {
        updateItemToList(
          {
            ...updateProjects,
            status: status === "GO_ON" ? "HANDLING" : status,
          },
          endpoints.project.PATH_LIST_PROJECT,
          queryClient,
          formSearch
        );
        AppNotification.success(statusText(status));
      })
      .catch((err) => {
        AppNotification.error(err?.message);
      });
  };
  const handleStatusProject = (status) => {
    if (status === "CREATED") {
      return <Tag color={"green"}>Mới</Tag>;
    } else if (status === "REVIEWING") {
      return <Tag color="yellow">Chờ duyệt</Tag>;
    } else if (status === "REFUSED") {
      return <Tag color="#f50">Đã từ chối</Tag>;
    } else if (status === "CANCELED") {
      return <Tag color={"red"}>Đã hủy</Tag>;
    } else if (status === "APPROVED") {
      return <Tag color={"volcano"}>Đã duyệt</Tag>;
    } else if (status === "HANDLING") {
      return <Tag color={"blue"}>Đang thi công</Tag>;
    } else if (status === "PAUSED") {
      return <Tag color={"gray"}>Tạm dừng</Tag>;
    } else {
      return <Tag color={"#87d068"}>Hoàn thành</Tag>;
    }
  };
  const columns = [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
    },
    {
      title: "Mã công trình",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Tên công trình",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Tên khách hàng",
      dataIndex: "customer_code",
      key: "customer_code",
      render: (text, record) => record.customer_code || "",
    },
    {
      title: "Địa chỉ công trình",
      dataIndex: "adress_detail",
      key: "adress_detail",
      render: (text, record) => record.adress_detail || "",
    },
    {
      title: "Hạng mục chính",
      dataIndex: "main_category",
      key: "main_category",
      render: (text, record) => record.main_category || "",
    },
    {
      title: "Khối lượng",
      dataIndex: "sub_items_count",
      key: "sub_items_count",
      render: (text, record) =>
        Array.isArray(record.sub_items) ? record.sub_items.length : 0,
    },
    {
      title: "Kỹ thuật phụ trách",
      dataIndex: "technician_code",
      key: "technician_code",
      render: (text, record) => record.technician_code || "",
    },
    {
      title: "Người duyệt",
      dataIndex: "approval",
      key: "approval",
      render: (text, record) => record.approval || "",
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
    },
    {
      title: "Ngày hoàn thành",
      dataIndex: "endDate",
      key: "endDate",
    },
    {
      title: "Người tạo",
      dataIndex: "supervisor",
      render: (text) => {
        return <div>{text?.fullName}</div>;
      },
    },
    {
      title: "Trạng Thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (text) => handleStatusProject(text),
    },
    {
      title: "Tác vụ",
      dataIndex: "tacVu",
      key: "tacVu",
      align: "center",
      render: (text, record) => (
        <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
          <Popover placement="top" title={text} content={() => content(record)}>
            <PiDotsThreeOutlineVerticalFill />
          </Popover>
        </div>
      ),
    },
  ];
  const onSelectChange = (newSelectedRowKeys) => {
    setRowKey(newSelectedRowKeys);
    console.log(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys: rowKey,
    onChange: onSelectChange,
  };
  const handleSendApproval = () => {
    if (rowKey.length === 0) {
      AppNotification.error("Vui lòng chọn dự án để gửi phê duyệt");
      return;
    }

    const projectCanSendCodes = new Set(
      projectRes?.body
        ?.filter((item) => item.status === "CREATED")
        .map((item) => item.code)
    );

    const projectNoSend = rowKey.filter(
      (item) => !projectCanSendCodes.has(item)
    );

    if (projectNoSend.length > 0) {
      AppNotification.error("Có dự án không thể gửi phê duyệt");
      return;
    }
    setModalAssignApproval({ projectCodes: rowKey, status: true });
  };
  const contentStatus = (
    <div>
      <Radio.Group
        onChange={(e) => changeFormSearch("status", e.target.value)}
        value={formSearch?.status}
      >
        <Space direction="vertical">
          <Radio value="">Tất cả</Radio>
          <Radio value="CREATED">Mới</Radio>
          <Radio value="REVIEWING">Chờ duyệt</Radio>
          <Radio value="APPROVED">Đã duyệt</Radio>
          <Radio value="HANDLING">Đang thi công</Radio>
          <Radio value="PAUSED">Đang tạm hoãn</Radio>
          <Radio value="CANCELED">Đã hủy</Radio>
          <Radio value="REFUSED">Đã từ chối</Radio>
          <Radio value="DONE">Hoàn thành</Radio>
        </Space>
      </Radio.Group>
    </div>
  );
  const handleDetail = (record) => {
    nav(routes.PROJECT_DETAIL + record?.code);
  };
  return (
    <React.Fragment>
      <div className="m-[20px] flex">
        <AppCreateButton
          text={"Thêm mới"}
          onClick={() => nav(routes.PROJECT_CREATE)}
        />
        <Button
          type="default"
          size="large"
          className="ml-4"
          onClick={handleSendApproval}
        >
          Gửi phê duyệt
          <Space>
            <IoIosSend style={{ marginLeft: 5 }} />
          </Space>
        </Button>

        <AppFilter
          placeholder={"Tìm kiếm theo mã hoặc tên"}
          className="w-[25%] ml-auto mr-5"
          status={formSearch.status}
          searchText={formSearch.searchText}
          changeFormSearch={changeFormSearch}
          contentStatus={contentStatus}
        />

        {/*<Space.Compact className="w-[25%] ml-auto mr-5">*/}
        {/*    <Input*/}
        {/*        size={"large"}*/}
        {/*        value={formSearch.searchText}*/}
        {/*        onChange={(e) => changeFormSearch("searchText", e.target.value)}*/}
        {/*        prefix={<IoSearchOutline color={'#000'}/>}*/}
        {/*        placeholder={"Tìm kiếm theo mã"}*/}
        {/*    />*/}
        {/*    <Popover content={contentStatus} trigger="click"*/}
        {/*             placement={"bottom"}*/}
        {/*             className="text-base  p-[6px] h-[40px]">*/}
        {/*        <Button className="p-[6px]" title={"Trạng thái"} icon={<FaSliders color={"#c02627"}/>}/>*/}
        {/*    </Popover>*/}
        {/*</Space.Compact>*/}
      </div>
      <div className={`pl-4 pr-4`}>
        <AppTable
          rowSelection={rowSelection}
          columns={columns}
          dataSource={dataSource(projectRes?.body, formSearch)}
          changeFormSearch={changeFormSearch}
          formSearch={formSearch}
          totalElement={projectRes?.total}
          totalPages={projectRes?.lastPage}
          onRow={(record) => ({
            onDoubleClick: () => handleDetail(record),
          })}
        />
        <ModalAssignApproval
          modalAssignApproval={modalAssignApproval}
          setModalAssignApproval={setModalAssignApproval}
          importBillCodes={rowKey}
          formSearch={formSearch}
          projects={projectRes?.body}
          setRowKey={setRowKey}
        />
      </div>
    </React.Fragment>
  );
}

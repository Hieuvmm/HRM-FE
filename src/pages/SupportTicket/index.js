import { Popconfirm, Popover, Tag } from "antd";
import React, { useState } from "react";
import { PiDotsThreeOutlineVerticalFill } from "react-icons/pi";
import { AppNotification } from "../../components/Notification/AppNotification";
import AppTable from "../../components/Table/AppTable";
import AppCreateButton from "../../components/AppButton/AppCreateButton";
import AppFilter from "../../components/AppFilter/AppFilter";
import AppFormPage from "../../components/AppFormPage/AppFormPage";
import {
  dataSource,
  handleFormSearch,
  handleLogMessageError,
  useHandleAddress,
} from "../../utils/AppUtil";
import { routes } from "../../utils/common";
import { useNavigate } from "react-router-dom";
import { ObjectApi } from "../../apis/Object.api";

export default function SupportTicket() {
  const nav = useNavigate();
  const [formSearch, setFormSearch] = useState({
    page: 1,
    limit: 10,
    status: "",
    searchText: "",
    // type:"CUSTOMER"
  });
  const { data: provinces } = useHandleAddress();
  const { data: customers, refetch } = ObjectApi.useGetObjects(formSearch, {
    staleTime: 0,
    cacheTime: 0,
  });

  const content = (record) => {
    return (
      <div className="p-1 pointer">
        <div
          className="mb-0 p-2 pr-6 hover:bg-red-100"
          onClick={() => nav(routes.TICKET_UPDATE + record?.code)}
        >
          Chỉnh sửa
        </div>
        <Popconfirm
          title="Thông báo"
          description="Bạn có chắc chắn muốn xóa không ?"
          onConfirm={() => {
            handleDelete(record);
          }}
          okText="Có"
          cancelText="Không"
        >
          <div className="mb-0 p-2 pr-6 hover:bg-red-100">Xóa</div>
        </Popconfirm>
      </div>
    );
  };

  const levelCustomer = [
    {
      value: "level1",
      label: "Cấp 1",
    },
    {
      value: "level2",
      label: "Cấp 2",
    },
    {
      value: "level3",
      label: "Cấp 3",
    },
    {
      value: "level4",
      label: "Cấp 4",
    },
  ];
  const columns = [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      align: "center",
      width: 60,
      fixed: "left",
    },
    {
      title: "Mã ticket",
      dataIndex: "code",
      key: "code",
      width: 150,
      fixed: "left",
    },
    
    {
      title: "Tiêu đề",
      dataIndex: "name",
      key: "name",
      width: 150,
      fixed: "left",
    },
       {
      title: "Người gửi",
      dataIndex: "code",
      key: "code",
      width: 150,
      fixed: "left",
    },
    // {
    //   title: "Loại",
    //   dataIndex: "type",
    //   key: "type",
    //   render: (text) => {
    //     return (
    //       <div>
    //         {text?.includes("CUSTOMER,PROVIDER")
    //           ? "Khách hàng, Nhà cung cấp"
    //           : text?.includes("CUSTOMER")
    //           ? "Khách hàng"
    //           : "Nhà cung cấp"}
    //       </div>
    //     );
    //   },
    // },
    // {
    //   title: "Cấp",
    //   dataIndex: "agentLevelCode",
    //   key: "agentLevelCode",
    //   render: (text) => {
    //     return (
    //       <div>{levelCustomer.find((item) => item.value == text).label}</div>
    //     );
    //   },
    // },
    // {
    //   title: "Tên khách hàng",
    //   dataIndex: "phoneNumber",
    //   key: "phoneNumber",
    // },
    // {
    //   title: "Điạ chỉ",
    //   render: (_, record) => {
    //     const province = provinces?.find(
    //       (item) => item.code === record?.provinceCode
    //     );
    //     const district = province?.districts?.find(
    //       (item) => item.code === record?.districtCode
    //     );
    //     return (
    //       <div>
    //         {record?.addressDetail}, {district?.name}, {province?.name}
    //       </div>
    //     );
    //   },
    // },
    {
      title: "Thời gian tạo",
      dataIndex: "createdDate",
      key: "createdDate",
    },
       {
      title: "Loại khiếu nại",
      dataIndex: "code",
      key: "code",
      width: 150,
      fixed: "left",
    },
    {
      title: "Trạng Thái sử lý",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (text) => {
        return (
          <Tag color={text === "ACTIVE" ? "green" : "red"}>
            {text === "ACTIVE" ? "Hoạt động" : "Không hoạt động"}
          </Tag>
        );
      },
    },
    ,
       {
      title: "Người xử lý",
      dataIndex: "code",
      key: "code",
      width: 150,
      fixed: "left",
    },
    {
      title: "Tác vụ",
      align: "center",
      width: 40,
      fixed: "right",
      render: (_, record) => (
        <Popover
          placement="top"
          content={() => content(record)}
          overlayInnerStyle={{ padding: 0 }}
        >
          <div className="flex justify-center w-full h-full">
            <PiDotsThreeOutlineVerticalFill />
          </div>
        </Popover>
      ),
    },
  ];

  const changeFormSearch = (name, value) => {
    handleFormSearch(setFormSearch, name, value);
  };

  const handleDelete = async (record) => {
    if (record.status === "ACTIVE") {
      AppNotification.error("Chỉ được xóa bản ghi không hoạt động");
      return;
    }
    await ObjectApi.delete({ code: record.code })
      .then((res) => {
        AppNotification.success("Xóa khách hàng thành công");
        refetch();
      })
      .catch((error) => {
        handleLogMessageError(error);
      });
  };
  return (
    // <React.Fragment>
    //     <div className={"mt-5"}>
    //         <span className={"text-xl font-bold text-red-700"}>Quản lý đối tượng</span>
    //     </div>
    //     <div className="bg-red-700 h-[2px] w-full my-3"/>
    //     <div className="m-[20px] flex">
    //         <AppCreateButton text={"Thêm mới"} onClick={() => nav(routes.PARTNER_CREATE)}/>
    //         <AppFilter placeholder={"Tìm kiếm theo mã hoặc tên"} className="w-[25%] ml-auto mr-5"
    //                    status={formSearch.status} searchText={formSearch.searchText}
    //                    changeFormSearch={changeFormSearch}/>
    //     </div>
    //     <AppTable
    //         columns={columns}
    //         dataSource={dataSource(customers?.body, formSearch)}
    //         changeFormSearch={changeFormSearch}
    //         formSearch={formSearch}
    //         totalElement={customers?.total}
    //         totalPages={customers?.lastPage}
    //     />
    // </React.Fragment>

    <AppFormPage title={"Quản lý khách hàng"}>
      <div className="m-[20px] flex">
        <AppCreateButton
          text={"Thêm mới"}
          onClick={() => nav(routes.TICKET_CREATE)}
        />
        <AppFilter
          placeholder={"Tìm kiếm theo mã hoặc tên"}
          className="w-[25%] ml-auto mr-5"
          status={formSearch.status}
          searchText={formSearch.searchText}
          changeFormSearch={changeFormSearch}
        />
      </div>
      <AppTable
        columns={columns}
        dataSource={dataSource(customers?.body, formSearch)}
        changeFormSearch={changeFormSearch}
        formSearch={formSearch}
        totalElement={customers?.total}
        totalPages={customers?.lastPage}
      />
    </AppFormPage>
  );
}

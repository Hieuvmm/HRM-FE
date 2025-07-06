import { Button, Popconfirm, Popover, Radio, Space, Tag } from "antd";
import React, { useEffect, useState } from "react";
import { PiDotsThreeOutlineVerticalFill } from "react-icons/pi";
import { AppNotification } from "../../components/Notification/AppNotification";
import AppTable from "../../components/Table/AppTable";
import AppCreateButton from "../../components/AppButton/AppCreateButton";
import {
  dataSource,
  formatCurrency,
  handleFormSearch,
} from "../../utils/AppUtil";
import { ImportBillApi } from "../../apis/ImportBill.api";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { routes } from "../../utils/common";
import { OrderApi } from "../../apis/Order.api";
import AppFilter from "../../components/AppFilter/AppFilter";
import { IoIosSend } from "react-icons/io";
import ModalAssignApprovalExportBill from "pages/Warehouse/ExportWarehouse/ModalCreateExport/AssignApprovalExportBill";
import ModalAssignApprovalOrder from "./AssignApprovalModal/AssignApprovalOrder";
import AppFormPage from "../../components/AppFormPage/AppFormPage";

export default function OrderManagement() {
  const nav = useNavigate();
  const [formSearch, setFormSearch] = useState({
    page: 1,
    limit: 10,
    status: "",
    searchText: "",
  });

  const { data: orderRes, refetch } = OrderApi.useGetOrders(formSearch, {
    staleTime: 0,
    cacheTime: 0,
  });
  const [listOrder, setListOrder] = useState(orderRes?.body);
  useEffect(() => {
    console.log("orderRes?.body", orderRes?.body);
    setListOrder(orderRes?.body);
  }, [orderRes]);

  const content = (record) => {
    return (
      <div className="p-1 pointer">
        <div
          className="mb-0 p-2 pr-6 hover:bg-red-100"
          onClick={() => {
            if (record?.status !== "CREATED") {
              AppNotification.error("Không thể chỉnh sửa phiếu này");
              return;
            }
            nav(routes.ORDER_UPDATE + record?.code);
          }}
        >
          Chỉnh sửa
        </div>
        <div
          className="mb-0 p-2 pr-6 hover:bg-red-100"
          onClick={() => {
            nav(routes.ORDER_DETAIL + record?.code);
          }}
        >
          Chi tiết
        </div>

        <Popconfirm
          title="Thông báo"
          description="Bạn có chắc chắn muốn hủy không ?"
          onConfirm={() => {
            handleCancel(record);
          }}
          okText="Có"
          cancelText="Không"
        >
          <div className="mb-0 p-2 pr-6 hover:bg-red-100">Hủy</div>
        </Popconfirm>

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
  const handleStatusBill = (status) => {
    if (status === "CREATED") {
      return <Tag color={"green"}>Mới</Tag>;
    } else if (status === "REVIEWING") {
      return <Tag color="yellow">Chờ duyệt</Tag>;
    } else if (status === "REFUSED") {
      return <Tag color="#f50">Đã từ chối</Tag>;
    } else if (status === "CANCELED") {
      return <Tag color={"red"}>Đã hủy</Tag>;
    } else {
      return <Tag color={"#87d068"}>Hoàn thành</Tag>;
    }
  };
  const columns = [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      align: "center",
    },
    {
      title: "Trạng thái đơn hàng",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (text) => handleStatusBill(text),
    },
    {
      title: "Mã đơn hàng",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Tên Khách hàng",
      dataIndex: "customerName",
      key: "customerName",
      render: (_, record) => record.object?.name || "",
    },
    {
      title: "Địa chỉ giao hàng",
      dataIndex: "adressDetail",
      key: "adressDetail",
      render: (_, record) => record.object?.adress_detail || "",
    },
    {
      title: "Giá trị đơn ",
      dataIndex: "total",
      key: "total",
      render: (text) => formatCurrency(text) || 0,
    },
    {
      title: "Loại đơn hàng ",
      dataIndex: "orderType",
      key: "orderType",
      render: (text) => orderType(text),
    },
    {
      title: "Người lập đơn",
      dataIndex: "createdBy",
      key: "createdBy",
    },
    {
      title: "Ngày lập đơn",
      dataIndex: "createdDate",
      key: "createdDate",
      render: (text) => dayjs(text).format("DD/MM/YYYY"),
    },
    {
      title: "Tác vụ",
      align: "center",
      render: (_, record) => (
        <Popover
          placement="left"
          content={() => content(record)}
          overlayInnerStyle={{ padding: 0 }}
        >
          <div className="flex justify-center w-full h-full pointer">
            <PiDotsThreeOutlineVerticalFill size={20} />
          </div>
        </Popover>
      ),
    },
  ];

  const orderTypeArr = [
    {
      value: "SELL",
      label: "Bán hàng",
    },
    {
      value: "ESTIMATE",
      label: "Báo giá",
    },
    {
      value: "CONSTRUCTION",
      label: "Thi công",
    },
    {
      value: "WARRANTY",
      label: "Bảo hành",
    },
    {
      value: "MAINTENANCE",
      label: "Bảo trì",
    },
  ];
  const orderType = (text) => {
    return orderTypeArr.find((item) => item.value === text).label;
  };

  const changeFormSearch = (name, value) => {
    handleFormSearch(setFormSearch, name, value);
  };

  const handleDelete = (record) => {
    if (record.status === "REVIEWING" || record.status === "NEW") {
      AppNotification.error("Không thể xóa phiếu nhập này");
      return;
    }
    OrderApi.updateStatus({ code: record.code, status: "DELETED" })
      .then((res) => {
        //
        const dataFilter = orderRes?.body.filter(
          (item) => item.code !== record.code
        );
        setListOrder(dataFilter);
        console.log("dataFilter", dataFilter);
        AppNotification.success("Xóa phiếu nhập thành công");
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const handleCancel = (record) => {
    if (record.status !== "NEW") {
      AppNotification.error("Không thể hủy phiếu nhập này");
      return;
    }
    ImportBillApi.delete({ id: record.id, status: "CANCELED" })
      .then((res) => {
        AppNotification.success("Hủy phiếu nhập thành công");
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const [rowKey, setRowKey] = useState([]);
  const onSelectChange = (newSelectedRowKeys) => {
    setRowKey(newSelectedRowKeys);
    console.log(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys: rowKey,
    onChange: onSelectChange,
  };
  //pop-up gui phe duyet
  const [modalAssignApproval, setModalAssignApproval] = useState({
    status: false,
    orderCodeList: [],
  });
  const handleSendApproval = () => {
    console.log("Gửi duyệt phiếu listOrder: ", listOrder);
    if (rowKey.length === 0) {
      AppNotification.error("Vui lòng chọn phiếu để gửi phê duyệt");
      return;
    }

    const orderCanSendCodes = new Set(
      listOrder
        ?.filter((item) => item.status === "CREATED")
        .map((item) => item.code)
    );
    const orderNoSend = rowKey.filter((item) => !orderCanSendCodes.has(item));
    if (orderNoSend.length > 0) {
      AppNotification.error("Có phiếu không thể gửi phê duyệt");
      return;
    }
    setModalAssignApproval({ orderCodeList: rowKey, status: true });
    // setModalAssignApproval({status: true})
  };

  const contentStatus = (
    <div>
      <Radio.Group
        onChange={(e) => changeFormSearch("status", e.target.value)}
        value={formSearch?.status}
      >
        <Space direction="vertical">
          <Radio value="">Tất cả</Radio>
          <Radio value="CREATED">Mới tạo</Radio>
          <Radio value="REVIEWING">Đang duyệt</Radio>
          <Radio value="CANCELED">Đã hủy</Radio>
          <Radio value="REFUSED">Đã từ chối</Radio>
          <Radio value="DONE">Hoàn thành</Radio>
        </Space>
      </Radio.Group>
    </div>
  );
  return (
    // <React.Fragment>
    //     <div className={"mt-5"}>
    //         <span className={"text-xl font-bold text-red-700"}>Quản lý đơn hàng</span>
    //     </div>
    //     <div className="bg-red-700 h-[2px] w-full my-3"/>
    //     <div className="m-[20px] flex">
    //         <AppCreateButton text={"Tạo đơn hàng"} onClick={() => nav(routes.ORDER_CREATE)}/>
    //         <Button type="default" size="large" className="ml-4"
    //                 onClick={handleSendApproval}
    //         >
    //             Gửi phê duyệt
    //             <Space>
    //                 <IoIosSend style={{marginLeft: 5}}/>
    //             </Space>
    //         </Button>
    //         <AppFilter placeholder={"Tìm kiếm theo mã"} className="w-[25%] ml-auto mr-5"
    //                    status={formSearch.status} searchText={formSearch.searchText}
    //                    changeFormSearch={changeFormSearch} contentStatus={contentStatus}/>
    //
    //     </div>
    //     <AppTable
    //         columns={columns}
    //         dataSource={dataSource(listOrder, formSearch)}
    //         changeFormSearch={changeFormSearch}
    //         formSearch={formSearch}
    //         rowSelection={rowSelection}
    //         totalElement={orderRes?.total}
    //         totalPages={orderRes?.lastPage}
    //     />
    //
    //     <ModalAssignApprovalOrder modalAssignApproval={modalAssignApproval}
    //                               setModalAssignApproval={setModalAssignApproval} importBillCodes={rowKey}
    //                               refetch={refetch}/>
    // </React.Fragment>

    <AppFormPage title={"Quản lý đơn hàng"}>
      <div className="m-[20px] flex">
        <AppCreateButton
          text={"Tạo đơn hàng"}
          onClick={() => nav(routes.ORDER_CREATE)}
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
          placeholder={"Tìm kiếm theo mã"}
          className="w-[25%] ml-auto mr-5"
          status={formSearch.status}
          searchText={formSearch.searchText}
          changeFormSearch={changeFormSearch}
          contentStatus={contentStatus}
        />
      </div>
      <AppTable
        columns={columns}
        dataSource={dataSource(listOrder, formSearch)}
        changeFormSearch={changeFormSearch}
        formSearch={formSearch}
        rowSelection={rowSelection}
        totalElement={orderRes?.total}
        totalPages={orderRes?.lastPage}
        onRow={(record) => ({
          onDoubleClick: () => nav(routes.ORDER_DETAIL + record?.code),
        })}
      />

      <ModalAssignApprovalOrder
        modalAssignApproval={modalAssignApproval}
        setModalAssignApproval={setModalAssignApproval}
        importBillCodes={rowKey}
        refetch={refetch}
      />
    </AppFormPage>
  );
}

import {
  Button,
  Checkbox,
  Form,
  Input,
  Modal,
  Popconfirm,
  Popover,
  Select,
  Tag,
} from "antd";
import React, { useEffect, useState } from "react";
import { PiDotsThreeOutlineVerticalFill } from "react-icons/pi";
import { AiOutlineClose } from "react-icons/ai";
import { RiSaveLine } from "react-icons/ri";
import { AppNotification } from "../../components/Notification/AppNotification";
import AppCreateButton from "../../components/AppButton/AppCreateButton";
import { WarehouseApi } from "../../apis/Warehouse.api";
import { dataSource, handleSearchForm } from "../../utils/AppUtil";
import AppTableWareHouse from "../../components/TableWareHouse/AppTable";
import AppFilterWareHouse from "../../components/AppFilterWareHouse/AppFilter";
import { useNavigate } from "react-router-dom";
import { UserApi } from "../../apis/User.api";
import { routes } from "utils/common";
import AppFilter from "../../components/AppFilter/AppFilter";
import AppTable from "../../components/Table/AppTable";
import AppFormPage from "../../components/AppFormPage/AppFormPage";

const { TextArea } = Input;
const { Option } = Select;
export default function Warehouse() {
  const navigate = useNavigate();
  const [searchForm, setSearchForm] = useState({
    status: "",
    keyword: "",
    pageNumber: "",
    pageSize: "",
  });
  const [wareHouseList, setWareHouseList] = useState([]);
  const [totalElement, setTotalElement] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const initialModalCreate = {
    whCode: "",
    whName: "",
    userName: "",
    phoneNumber: "",
    whAddress: "",
    whDesc: "",
    status: "",
    type: "",
    manager: "",
  };
  const [modalCreate, setModalCrete] = useState(initialModalCreate);

  const { data: wareHouse } = WarehouseApi.useGetList(searchForm, {
    staleTime: 0,
    cacheTime: 0,
  });
  useEffect(() => {
    if (wareHouse?.searchWareHouseModelList !== wareHouseList) {
      setWareHouseList(wareHouse?.searchWareHouseModelList);
    }
  }, [wareHouse, wareHouseList]);

  const content = (record) => (
    <div>
      <div className="p-1 pointer">
        {/* <div className="mb-0 p-2 pr-6 hover:bg-red-100"
               onClick={() => openEditModal(record)}>
            Chỉnh sửa
          </div> */}
        <div
          className="mb-0 p-2 pr-6 hover:bg-red-100"
          onClick={() => nav(routes.WAREHOUSE_EDIT + record?.whCode)}
        >
          Chỉnh sửa
        </div>
        <div
          className="mb-0 p-2 pr-6 hover:bg-red-100"
          onClick={() => handleDetailClick(record)}
        >
          Xem chi tiết
        </div>
        <Popconfirm
          title="Thông báo"
          description="Bạn có chắc chắn muốn xóa không ?"
          onConfirm={() => handleDelete(record)}
          okText="Có"
          cancelText="Không"
        >
          <div className="mb-0 p-2 pr-6 hover:bg-red-100">Xóa</div>
        </Popconfirm>
      </div>
    </div>
  );
  const columns = [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
    },
    {
      title: "Mã kho",
      dataIndex: "whCode",
      key: "whCode",
    },
    {
      title: "Tên kho",
      dataIndex: "whName",
      key: "whName",
    },
    {
      title: "Địa điểm",
      dataIndex: "whAddress",
      key: "whAddress",
    },
    {
      title: "Thủ kho",
      dataIndex: "manager",
      key: "manager",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "Mô tả",
      dataIndex: "desc",
      key: "desc",
    },
    {
      title: "Trạng Thái",
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
    {
      title: "Tác vụ",
      dataIndex: "tacVu",
      key: "tacVu",
      align: "center",
      render: (text, record) => (
        <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
          <Popover
            placement="top"
            title={text}
            content={() => content(record)}
            overlayInnerStyle={{ padding: 0 }}
          >
            <div className="flex justify-center w-full h-full">
              <PiDotsThreeOutlineVerticalFill />
            </div>
          </Popover>
        </div>
      ),
    },
  ];
  const closeModal = () => {
    setModalCrete({ ...initialModalCreate });
  };
  const changeFormSearch = (name, value) => {
    handleSearchForm(setSearchForm, name, value);
  };

  const dataSource = wareHouseList?.map((item, index) => ({
    stt: (searchForm.pageNumber - 1) * searchForm.pageSize + index + 1,
    ...item,
  }));

  const openEditModal = (item) => {
    setModalCrete({
      ...item,
      whDesc: item.desc,
      type: "edit",
    });
  };

  // Chuyển hướng tới màn hình chi tiết
  const handleDetailClick = (record) => {
    navigate(`/warehouse-detail/${record.whCode}`);
  };

  const handleDelete = (record) => {
    if (record.status === "ACTIVE") {
      AppNotification.error("Chỉ được xóa bản ghi không hoạt động");
      return;
    }
    WarehouseApi.update({ ...record, status: "DELETE" })
      .then((res) => {
        AppNotification.success("Xóa kho thành công");
        const dataFilter = wareHouseList.filter(
          (item) => item.id !== record.id
        );
        setWareHouseList(dataFilter);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  //const {data: userList} = UserApi.getUserByRole({role: ''})
  const { data: userList } = [];

  const handleSubmit = async (record) => {
    try {
      const { stt, type, desc, manager, ...data } = record;
      const requestData = {
        ...data,
        whDesc: record.whDesc,
      };

      const response =
        type !== "create"
          ? await WarehouseApi.update(requestData)
          : await WarehouseApi.create(requestData);

      AppNotification.success("Kho đã được lưu thành công");
      setModalCrete({ ...initialModalCreate, status: false });
      await reloadWareHouseList();
    } catch (error) {
      console.error("Error editing/creating product:", error);
      AppNotification.error("Có lỗi xảy ra khi lưu kho");
    }
  };
  const nav = useNavigate();
  // Gọi lại API để lấy danh sách kho mới
  const { data: whReload, refetch: refetchWareHouse } = WarehouseApi.useGetList(
    { ...searchForm },
    {}
  );
  const reloadWareHouseList = async () => {
    await refetchWareHouse();
  };

  return (
    <AppFormPage title={"Quản lý kho"}>
      <div className="m-[20px] flex">
        {/* <AppCreateButton text={"Thêm mới"} onClick={() => setModalCrete({...initialModalCreate, type: 'create'})}/> */}
        <AppCreateButton
          text={"Thêm mới"}
          onClick={() => nav(routes.WAREHOUSE_CREATE)}
        />
        <AppFilterWareHouse
          placeholder={"Tìm kiếm theo tên"}
          className="w-[25%] ml-auto mr-5"
          status={searchForm.status}
          searchText={searchForm.keyword}
          changeFormSearch={changeFormSearch}
        />
      </div>
      <AppTableWareHouse
        columns={columns}
        dataSource={dataSource}
        changeFormSearch={changeFormSearch}
        formSearch={searchForm}
        totalElement={totalElement}
        totalPages={totalPages}
        onRow={(record) => ({
          onDoubleClick: () => handleDetailClick(record),
        })}
      />
      <Modal
        title={`${
          modalCreate?.type !== "create" ? "Cập nhật" : "Thêm mới"
        } kho`}
        open={modalCreate?.type === "create" || modalCreate?.type === "edit"}
        onCancel={() => setModalCrete({ ...initialModalCreate, type: "" })} // Đóng modal khi hủy
        okButtonProps={{ style: { display: "none" } }}
        cancelButtonProps={{ style: { display: "none" } }}
      >
        <Form
          name="validateOnly"
          layout="vertical"
          autoComplete="off"
          onFinish={() => handleSubmit(modalCreate)}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "48% 48%",
              gap: "4%",
            }}
          >
            <Form.Item label="Mã kho">
              <Input
                size={"large"}
                value={modalCreate?.whCode || ""}
                onChange={(e) =>
                  setModalCrete({ ...modalCreate, whCode: e.target.value })
                }
              />
            </Form.Item>
            <Form.Item label="Tên kho">
              <Input
                size={"large"}
                value={modalCreate?.whName || ""}
                onChange={(e) =>
                  setModalCrete({ ...modalCreate, whName: e.target.value })
                }
              />
            </Form.Item>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "48% 48%",
              gap: "4%",
            }}
          >
            <Form.Item label="Thủ kho">
              <Select
                size="large"
                className="custom-select"
                placeholder="Thủ kho"
                labelInValue={true} // Hiển thị fullName thay vì userCode
                value={
                  modalCreate?.manager
                    ? (() => {
                        const user = userList.find(
                          (user) => user.userCode === modalCreate?.manager
                        );
                        return user
                          ? { value: user.userCode, label: user.fullName }
                          : undefined;
                      })()
                    : undefined
                }
                onChange={
                  (value) =>
                    setModalCrete({ ...modalCreate, userName: value?.value }) // Chỉ lưu userCode
                }
              >
                {userList?.map((item) => (
                  <Option key={item.userId} value={item.userCode}>
                    {item.fullName}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Số điện thoại">
              <Input
                size={"large"}
                value={modalCreate?.phoneNumber || ""}
                onChange={(e) =>
                  setModalCrete({ ...modalCreate, phoneNumber: e.target.value })
                }
              />
            </Form.Item>
          </div>
          <Form.Item label="Địa chỉ">
            <Input
              size={"large"}
              value={modalCreate?.whAddress || ""}
              onChange={(e) =>
                setModalCrete({ ...modalCreate, whAddress: e.target.value })
              }
            />
          </Form.Item>
          <Form.Item label="Mô tả">
            <TextArea
              size={"large"}
              value={modalCreate?.whDesc || ""}
              onChange={(e) =>
                setModalCrete({ ...modalCreate, whDesc: e.target.value })
              }
            />
          </Form.Item>
          <Form.Item label="Trạng thái">
            <Checkbox
              checked={modalCreate?.status === "ACTIVE"}
              onChange={(e) =>
                setModalCrete({
                  ...modalCreate,
                  status: e.target.checked ? "ACTIVE" : "INACTIVE",
                })
              }
            >
              Hoạt động
            </Checkbox>
          </Form.Item>
          <Form.Item>
            <div style={{ display: "flex", marginTop: 20 }}>
              <Button
                style={{ marginLeft: "auto", marginRight: 10 }}
                key="submit"
                title="Thêm"
                onClick={closeModal}
              >
                <AiOutlineClose /> Hủy
              </Button>
              <Button
                className="button-add-promotion bg-red-700 text-[white]"
                key="submit"
                title="Thêm"
                onClick={() => handleSubmit(modalCreate)}
              >
                <RiSaveLine /> Lưu lại
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </AppFormPage>
  );
}

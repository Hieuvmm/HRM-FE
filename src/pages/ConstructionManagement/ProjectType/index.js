import {
  Button,
  Checkbox,
  Form,
  Input,
  Modal,
  Popconfirm,
  Popover,
  Tag,
} from "antd";
import React, { useEffect, useState } from "react";
import { PiDotsThreeOutlineVerticalFill } from "react-icons/pi";
import { RiSaveLine } from "react-icons/ri";
import { AiOutlineClose } from "react-icons/ai";
import { AppNotification } from "../../../components/Notification/AppNotification";
import AppTable from "../../../components/Table/AppTable";
import AppCreateButton from "../../../components/AppButton/AppCreateButton";
import AppFilter from "../../../components/AppFilter/AppFilter";
import {
  addItemToList,
  dataSource,
  deleteItemToList,
  handleFormSearch,
  handleFormUpdate,
  updateItemToList,
} from "../../../utils/AppUtil";
import { endpoints, errorCodes, errorTexts } from "../../../utils/common";
import { useQueryClient } from "@tanstack/react-query";
import { ProjectCategoryApi } from "../../../apis/ProjectCategory.api";
import { ProjectTypeApi } from "../../../apis/ProjectType.api";

const { TextArea } = Input;
export default function ProjectType() {
  const queryClient = useQueryClient();
  const [formSearch, setFormSearch] = useState({
    page: 1,
    limit: 10,
    status: "",
    searchText: "",
  });
  const initialModalCreate = {
    status: false,
    type: "",
    id: "",
  };
  const [modalCreate, setModalCreate] = useState(initialModalCreate);

  const initialFormCreate = {
    status: "ACTIVE",
  };
  const [formCreate, setFormCreate] = useState(initialFormCreate);
  const [formErrors, setFormErrors] = useState({});

  const { data, refetch } = ProjectTypeApi.useGetProjectTypes(formSearch, {
    staleTime: 0,
    cacheTime: 0,
  });
  useEffect(() => {
    if (modalCreate.code) {
      setFormCreate(data?.body?.find((item) => item.code === modalCreate.code));
    }
  }, [modalCreate.code]);
  const content = (record) => {
    return (
      <div className="bg-white p-1 pointer">
        <div
          className="mb-0 p-2 pr-6 hover:bg-red-100"
          onClick={() =>
            setModalCreate({ status: true, code: record?.code, type: "update" })
          }
        >
          Chỉnh sửa
        </div>
        <Popconfirm
          title="Thông báo"
          description="Bạn có chắc chắn muốn xóa không?"
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
  const columns = [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
    },
    {
      title: "Mã loại công trình",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Tên loại công trình",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
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
  const closeModal = () => {
    setFormCreate(initialFormCreate);
    setModalCreate(initialModalCreate);
  };
  const changeFormSearch = (name, value) => {
    handleFormSearch(setFormSearch, name, value);
  };
  const handleSubmit = async () => {
    console.log(formCreate.id);
    const isValid = formCreate.code && formCreate.name;
    if (!isValid) {
      const errors = {
        code: !formCreate.code ? errorTexts.REQUIRE_FIELD : "",
        name: !formCreate.name ? errorTexts.REQUIRE_FIELD : "",
      };
      setFormErrors(errors);
      return;
    }
    if (modalCreate.code) {
      await ProjectTypeApi.update(formCreate)
        .then(() => {
          refetch();
          closeModal();
          AppNotification.success("Cập nhật loại công trình thành công");
        })
        .catch((error) => {
          const errorCode = error.errorCode;
          if (errorCode?.includes(errorCodes.NAME_EXIST)) {
            setFormErrors({ ...formErrors, name: errorTexts.DATA_EXIST });
          }
        });
    } else {
      await ProjectTypeApi.create(formCreate)
        .then(() => {
          refetch();
          closeModal();
          AppNotification.success("Thêm mới loại công trình thành công");
        })
        .catch((error) => {
          const errorCode = error.errorCode;
          if (errorCode?.includes(errorCodes.NAME_EXIST)) {
            setFormErrors({ ...formErrors, name: errorTexts.DATA_EXIST });
          }
          if (errorCode?.includes(errorCodes.CODE_EXIST)) {
            setFormErrors({ ...formErrors, code: errorTexts.DATA_EXIST });
          }
        });
    }
  };

  const handleDelete = async (record) => {
    if (record.status === "ACTIVE") {
      AppNotification.error("Chỉ được xóa bản ghi không hoạt động");
      return;
    }
    await ProjectTypeApi.delete({ code: record.code })
      .then(() => {
        refetch();
        AppNotification.success("Xóa loại công trình thành công");
        closeModal();
      })
      .catch((error) => {
        const message = error.message;
        if (message) {
          AppNotification.error(message);
        }
      });
  };
  const handleDetail = (record) => {
    setFormCreate(record);
    setModalCreate({ status: true, type: "detail" });
  };
  return (
    <React.Fragment>
      <div className="m-[20px] flex">
        <AppCreateButton
          text={"Thêm mới"}
          onClick={() => setModalCreate({ status: true })}
        />
        <AppFilter
          placeholder={"Tìm kiếm theo mã hoặc tên"}
          className="w-[25%] ml-auto mr-5"
          status={formSearch.status}
          searchText={formSearch.searchText}
          changeFormSearch={changeFormSearch}
        />
      </div>
      <div className={`pl-4 pr-4`}>
        <AppTable
          columns={columns}
          dataSource={dataSource(data?.body, formSearch)}
          changeFormSearch={changeFormSearch}
          formSearch={formSearch}
          totalElement={data?.total}
          totalPages={data?.lastPage}
          // handleClick={handleDetail}
        />
        <Modal
          title={` ${
            modalCreate.type === "detail"
              ? "Chi tiết"
              : modalCreate.id
              ? "Cập nhật"
              : "Thêm mới"
          } loại công trình`}
          open={modalCreate.status}
          onCancel={closeModal}
          okButtonProps={{ style: { display: "none" } }}
          cancelButtonProps={{ style: { display: "none" } }}
        >
          <Form name="validateOnly" layout="vertical" autoComplete="off">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "48% 48%",
                gap: "4%",
              }}
            >
              {modalCreate.code ? (
                <Form.Item label="Mã loại công trình">
                  <Input
                    readOnly={true}
                    value={formCreate?.code}
                    size={"large"}
                  />
                </Form.Item>
              ) : (
                <Form.Item
                  label="Mã loại công trình"
                  validateStatus={formErrors["code"] ? "error" : ""}
                  help={formErrors["code"] || ""}
                >
                  <Input
                    value={formCreate.code || ""}
                    onChange={(e) =>
                      handleFormUpdate(
                        setFormCreate,
                        setFormErrors,
                        "code",
                        e.target.value
                      )
                    }
                    size={"large"}
                    readOnly={modalCreate?.type === "detail"}
                  />
                </Form.Item>
              )}

              <Form.Item
                label="Tên loại công trình"
                validateStatus={formErrors["name"] ? "error" : ""}
                help={formErrors["name"] || ""}
              >
                <Input
                  size={"large"}
                  value={formCreate.name || ""}
                  onChange={(e) =>
                    handleFormUpdate(
                      setFormCreate,
                      setFormErrors,
                      "name",
                      e.target.value
                    )
                  }
                  readOnly={modalCreate?.type === "detail"}
                />
              </Form.Item>
            </div>
            <Form.Item label="Mô tả">
              <TextArea
                value={formCreate.description || ""}
                onChange={(e) =>
                  handleFormUpdate(
                    setFormCreate,
                    setFormErrors,
                    "description",
                    e.target.value
                  )
                }
                readOnly={modalCreate?.type === "detail"}
              />
            </Form.Item>
            <Form.Item label="Mô tả">
              <Checkbox
                checked={formCreate?.status === "ACTIVE"}
                onChange={(value) =>
                  modalCreate?.type !== "detail"
                    ? handleFormUpdate(
                        setFormCreate,
                        setFormErrors,
                        "status",
                        value.target.checked ? "ACTIVE" : "INACTIVE"
                      )
                    : null
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
                {modalCreate.type !== "detail" && (
                  <Button
                    className="button-add-promotion bg-red-700 text-[white]"
                    key="submit"
                    title="Thêm"
                    onClick={() => {
                      handleSubmit();
                    }}
                  >
                    <RiSaveLine /> Lưu lại
                  </Button>
                )}
              </div>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </React.Fragment>
  );
}

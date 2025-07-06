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
import { MaterialTypeApi } from "../../../apis/MaterialType.api";
import {
  dataSource,
  handleFormSearch,
  handleFormUpdate,
} from "../../../utils/AppUtil";
import { errorCodes, errorTexts } from "../../../utils/common";
import { ProviderApi } from "../../../apis/Provider.api";
import { ParameterTypeApi } from "../../../apis/ParameterType.api";
import AppFormPage from "../../../components/AppFormPage/AppFormPage";
import AppModalForm from "../../../components/AppModal/AppModalForm";
import AppInput from "../../../components/AppInput/AppInput";
import AppTextArea from "../../../components/AppTextArea/AppTextArea";
import AppCheckBox from "../../../components/AppCheckBox/AppCheckBox";
import { ProfessionApi } from "../../../apis/Profession.api";

const { TextArea } = Input;
export default function Profession() {
  const [formSearch, setFormSearch] = useState({
    page: 1,
    limit: 10,
    status: "",
    searchText: "",
  });
  const initialModalCreate = {
    status: false,
    type: "",
    code: "",
  };
  const [modalCreate, setModalCrete] = useState(initialModalCreate);
  const initialFormCreate = {
    status: "ACTIVE",
  };
  const [formCreate, setFormCreate] = useState(initialFormCreate);
  const [formErrors, setFormErrors] = useState({});
  const { data: professions, refetch } = ProfessionApi.useGetList(formSearch, {
    staleTime: 0,
    cacheTime: 0,
  });

  useEffect(() => {
    if (modalCreate.code) {
      ProfessionApi.detail({ code: modalCreate.code })
        .then((res) => {
          setFormCreate(res.body);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [modalCreate.code]);
  const content = (record) => {
    return (
      <div className="p-1 pointer">
        <div
          className="mb-0 p-2 pr-6 hover:bg-red-100"
          onClick={() => setModalCrete({ status: true, code: record.code })}
        >
          Chỉnh sửa
        </div>
        <div
          className="mb-0 p-2 pr-6 hover:bg-red-100"
          onClick={() => {
            handleDelete(record);
          }}
        >
          Xóa
        </div>
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
      title: "Mã lĩnh vực",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Tên lĩnh vực",
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
      title: "Tác vụ ",
      dataIndex: "hanhDong",
      key: "hanhDong",
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
    setModalCrete(initialModalCreate);
    setFormCreate(initialFormCreate);
  };
  const changeFormSearch = (name, value) => {
    handleFormSearch(setFormSearch, name, value);
  };
  const handleSubmit = () => {
    const isValid = formCreate.name;
    if (!isValid) {
      const errors = {
        name: !formCreate.name ? errorTexts.REQUIRE_FIELD : "",
      };
      setFormErrors(errors);
      return;
    }
    if (formCreate.code) {
      ProfessionApi.update(formCreate)
        .then((res) => {
          refetch();
          closeModal();
          AppNotification.success("Cập nhật lĩnh vực thành công");
        })
        .catch((error) => {
          const errorCode = error.errorCode;
          if (errorCode?.includes(errorCodes.NAME_EXIST)) {
            setFormErrors({ ...formErrors, name: errorTexts.DATA_EXIST });
          }
        });
    } else {
      ProfessionApi.create(formCreate)
        .then((res) => {
          refetch();
          closeModal();
          AppNotification.success("Thêm mới lĩnh vực thành công");
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

  const handleDelete = (record) => {
    if (record.status === "ACTIVE") {
      AppNotification.error("Chỉ được xóa bản ghi không hoạt động");
      return;
    }
    ProfessionApi.delete({ code: record.code })
      .then((res) => {
        AppNotification.success("Xóa lĩnh vực thành công");
        refetch();
      })
      .catch((error) => {
        console.log(error);
      });
  };
  return (
    <AppFormPage title={"Quản lý lĩnh vực"}>
      <div className="m-[20px] flex">
        <AppCreateButton
          text={"Thêm mới"}
          onClick={() => setModalCrete({ status: true })}
        />
        <AppFilter
          placeholder={"Tìm kiếm theo mã hoặc tên"}
          className="w-[25%] ml-auto mr-5"
          status={formSearch.status}
          searchText={formSearch.searchText}
          changeFormSearch={changeFormSearch}
        />
      </div>
      <AppTable
        columns={columns}
        dataSource={dataSource(professions?.body, formSearch)}
        changeFormSearch={changeFormSearch}
        formSearch={formSearch}
        totalElement={professions?.total}
        totalPages={professions?.lastPage}
      />
      <AppModalForm
        title={` ${modalCreate.code ? "Cập nhật" : "Thêm mới"} lĩnh vực`}
        isOpen={modalCreate.status}
        action={
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
        }
        onClose={closeModal}
      >
        <form>
          <div className={`grid grid-cols-2 gap-[4%]`}>
            <AppInput
              className={"mb-5"}
              label={"Mã lĩnh vực"}
              value={formCreate?.code}
              show={!!modalCreate.code}
              disabled={true}
            />
            <AppInput
              className={"mb-5"}
              label={"Tên lĩnh vực"}
              value={formCreate?.name}
              onChange={(e) =>
                handleFormUpdate(
                  setFormCreate,
                  setFormErrors,
                  "name",
                  e.target.value
                )
              }
              required={true}
              error={formErrors?.name}
            />
          </div>
          <AppTextArea
            className={"mb-5"}
            label={"Mô tả"}
            value={formCreate["description"] || ""}
            onChange={(e) =>
              handleFormUpdate(
                setFormCreate,
                setFormErrors,
                "description",
                e.target.value
              )
            }
          />
          <AppCheckBox
            checked={formCreate?.status === "ACTIVE"}
            onChange={(value) =>
              handleFormUpdate(
                setFormCreate,
                setFormErrors,
                "status",
                value.target.checked ? "ACTIVE" : "INACTIVE"
              )
            }
            label="Hoạt động"
          />
        </form>
      </AppModalForm>
    </AppFormPage>
  );
}

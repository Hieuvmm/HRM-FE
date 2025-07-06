// import '.././style.scss';
import { AppNotification } from "../../../components/Notification/AppNotification";
import { Button, Checkbox, Form, Input, Popconfirm, Select } from "antd";
import React, { useEffect, useState } from "react";

import { AiOutlineClose } from "react-icons/ai";
import { RiSaveLine } from "react-icons/ri";
import {
  addItemToList,
  handleFormUpdate,
  handleLogMessageError,
  updateItemToList,
  useHandleAddress,
  useHandleGetBanks,
} from "../../../utils/AppUtil";
import { GrFormPrevious } from "react-icons/gr";
import {
  endpoints,
  errorCodes,
  errorTexts,
  routes,
} from "../../../utils/common";
import { useNavigate, useParams } from "react-router-dom";
import { ObjectApi } from "../../../apis/Object.api";
import { useQueryClient } from "@tanstack/react-query";
import { ProfessionApi } from "../../../apis/Profession.api";
import { UserApi } from "../../../apis/User.api";
import { BranchApi } from "../../../apis/Branch.api";

const { Option } = Select;

function CreateObjectsPartner() {
  const queryClient = useQueryClient();
  const nav = useNavigate();
  const { code } = useParams();
  const { TextArea } = Input;
  const initialFormCreate = {
    customerType: true,
    providerType: false,
    status: "ACTIVE",
  };
  const [formCreate, setFormCreate] = useState({ ...initialFormCreate });
  const [formErrors, setFormErrors] = useState({});
  const [districts, setDistricts] = useState([]);
  const { data: banks } = useHandleGetBanks();
  const { data: provinces } = useHandleAddress();
  const { data: professions, refetch } = ProfessionApi.useGetList(
    {
      page: 1,
      limit: 10,
      status: "",
      searchText: "",
    },
    { staleTime: 0, cacheTime: 0 }
  );
  const { data: usersRaw } = UserApi.useSearch(
    { page: 1, limit: 100, status: "ACTIVE", searchText: "" },
    { staleTime: 0, cacheTime: 0 }
  );
  const { data: branchesRaw } = BranchApi.useGetList(
    { page: 1, limit: 100, status: "ACTIVE", searchText: "" },
    { staleTime: 0, cacheTime: 0 }
  );

  // Đảm bảo users và branches luôn là mảng
  const users = Array.isArray(usersRaw)
    ? usersRaw
    : Array.isArray(usersRaw?.body)
    ? usersRaw.body
    : [];
  const branches = Array.isArray(branchesRaw)
    ? branchesRaw
    : Array.isArray(branchesRaw?.body)
    ? branchesRaw.body
    : [];

  useEffect(() => {
    if (code) {
      ObjectApi.detail({ code: code })
        .then((res) => {
          const customerDetailRes = res?.body;
          setFormCreate({
            ...customerDetailRes,
            customerType: !!customerDetailRes?.type?.includes("CUSTOMER"),
            providerType: !!customerDetailRes?.type?.includes("PROVIDER"),
            actType: "update",
          });
          console.log(customerDetailRes);
        })
        .catch((error) => {
          handleLogMessageError(error);
        });
    }
  }, [code]);
  // handle get district list
  useEffect(() => {
    if (formCreate?.provinceCode) {
      const handleGetDistricts = provinces.find(
        (item) => item.code === formCreate.provinceCode
      )?.districts;
      setDistricts(handleGetDistricts);
      if (formCreate?.actType !== "update") {
        changeFormRequest("districtCode", null);
      } else {
        setFormCreate({
          ...formCreate,
          actType: "",
        });
      }
    }
  }, [formCreate?.provinceCode]);

  const typeObj = () => {
    if (formCreate?.customerType && formCreate.providerType) {
      return "CUSTOMER,PROVIDER";
    } else if (formCreate?.customerType && !formCreate.providerType) {
      return "CUSTOMER";
    } else if (!formCreate?.customerType && formCreate.providerType) {
      return "PROVIDER";
    } else {
      return null;
    }
  };
  const handleValidation = () => {
    const reqBody = { ...formCreate, type: typeObj() };
    const isValid =
      reqBody.code &&
      reqBody.name &&
      reqBody.type &&
      reqBody.phoneNumber &&
      reqBody.professionCode &&
      reqBody.agentLevelCode &&
      // && reqBody.taxCode
      reqBody.maximumDebt &&
      reqBody.provinceCode &&
      reqBody.districtCode &&
      reqBody.addressDetail &&
      reqBody.debtDay &&
      reqBody.bankName &&
      // && reqBody.bankNumber
      reqBody.businessManagerCode;

    if (!isValid) {
      const errors = {
        code: !reqBody.code ? errorTexts.REQUIRE_FIELD : "",
        name: !reqBody.name ? errorTexts.REQUIRE_FIELD : "",
        type: !reqBody.type ? "Chọn loại đối tượng" : "",
        professionCode: !reqBody.professionCode ? errorTexts.REQUIRE_FIELD : "",
        agentLevelCode: !reqBody.agentLevelCode ? errorTexts.REQUIRE_FIELD : "", // taxCode: !reqBody.taxCode ? errorTexts.REQUIRE_FIELD : "",
        maximumDebt: !reqBody.maximumDebt ? errorTexts.REQUIRE_FIELD : "",
        debtDay: !reqBody.debtDay ? errorTexts.REQUIRE_FIELD : "",
        provinceCode: !reqBody.provinceCode ? errorTexts.REQUIRE_FIELD : "",
        districtCode: !reqBody.districtCode ? errorTexts.REQUIRE_FIELD : "",
        addressDetail: !reqBody.addressDetail ? errorTexts.REQUIRE_FIELD : "",
        bankName: !reqBody.bankName ? errorTexts.REQUIRE_FIELD : "", // bankNumber: !reqBody.bankNumber ? errorTexts.REQUIRE_FIELD : "",
        businessManagerCode: !reqBody.businessManagerCode
          ? errorTexts.REQUIRE_FIELD
          : "",
      };
      setFormErrors(errors);
      AppNotification.error("Điền đầy đủ các thông tin các trường");
      return;
    }
    handleSubmit();
  };
  const handleSubmit = () => {
    const formSearch = {
      page: 1,
      limit: 10,
      status: "",
      searchText: "",
      type: "CUSTOMER",
    };
    const reqBody = { ...formCreate, type: typeObj() };
    if (code) {
      ObjectApi.update(reqBody)
        .then((res) => {
          AppNotification.success("Cập nhật thành công");
          nav(routes.PARTNER);
        })
        .catch((error) => {
          handleLogMessageError(error);
        });
    } else {
      ObjectApi.create(reqBody)
        .then((res) => {
          AppNotification.success("Thêm mới thành công");
          nav(routes.PARTNER);
        })
        .catch((error) => {
          const errorCode = error.errorCode;
          if (errorCode?.includes(errorCodes.CODE_EXIST)) {
            setFormErrors({ ...formErrors, code: errorTexts.DATA_EXIST });
          }
        });
    }
  };

  const changeFormRequest = (name, value) => {
    handleFormUpdate(setFormCreate, setFormErrors, name, value);
  };

  return (
    <div className={"py-3"}>
      <div className={"flex items-center justify-between"}>
        <div className={"flex items-center"}>
          <GrFormPrevious
            className={"pointer text-red-700"}
            size={30}
            onClick={() => nav(routes.PARTNER)}
          />
          <span className={"text-lg font-bold text-red-700 ml-2"}>
            {code ? "Cập nhật" : "Tạo mới"} đối tác
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            key="cancel"
            onClick={() => nav(routes.PARTNER)}
            icon={<AiOutlineClose />}
          >
            Huỷ bỏ
          </Button>
          <Button
            className="button-add-promotion bg-red-700 text-[white]"
            key="save"
            onClick={() => handleValidation()}
            icon={<RiSaveLine />}
          >
            Lưu lại
          </Button>
        </div>
      </div>
      <div className="bg-red-700 h-[2px] w-full my-3" />
      <Form name="validateOnly" layout="vertical" autoComplete="off">
        <div className="p-2 border-[1px] border-gray-200 rounded-md mb-3">
          <div
            className={
              "h-[35px] bg-gray-200 flex items-center pl-3 text-16 font-bold mb-3"
            }
          >
            Thông tin chung
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "30% 30% 32%",
              gap: "4%",
            }}
          >
            <Form.Item
              label={
                <span>
                  Mã đối tượng <span style={{ color: "red" }}>*</span>
                </span>
              }
              validateStatus={formErrors["code"] ? "error" : ""}
              help={formErrors["code"] || ""}
            >
              <Input
                value={formCreate.code || ""}
                onChange={(e) => changeFormRequest("code", e.target.value)}
                size={"large"}
              />
            </Form.Item>
            <Form.Item
              label={
                <span>
                  Tên đối tượng <span style={{ color: "red" }}>*</span>
                </span>
              }
              validateStatus={formErrors["name"] ? "error" : ""}
              help={formErrors["name"] || ""}
            >
              <Input
                size={"large"}
                value={formCreate.name || ""}
                onChange={(e) => changeFormRequest("name", e.target.value)}
              />
            </Form.Item>
            <Form.Item
              label={
                <span>
                  Loại đối tượng <span style={{ color: "red" }}>*</span>
                </span>
              }
              validateStatus={formErrors["type"] ? "error" : ""}
              help={formErrors["type"] || ""}
            >
              <div className={"flex items-center"}>
                <Checkbox
                  className={"mr-5"}
                  checked={formCreate?.customerType === true}
                  onChange={(value) =>
                    changeFormRequest("customerType", value.target.checked)
                  }
                >
                  Khách hàng
                </Checkbox>
                <Checkbox
                  checked={formCreate?.providerType === true}
                  onChange={(value) =>
                    changeFormRequest("providerType", value.target.checked)
                  }
                >
                  Nhà cung cấp
                </Checkbox>
              </div>
            </Form.Item>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "30% 30% 32%",
              gap: "4%",
            }}
          >
            <Form.Item
              label={
                <span>
                  Tỉnh/Thành phố <span style={{ color: "red" }}>*</span>
                </span>
              }
              validateStatus={formErrors["provinceCode"] ? "error" : ""}
              help={formErrors["provinceCode"] || ""}
            >
              <Select
                placeholder="Chọn tỉnh/thành phố"
                size={"large"}
                className="custom-select"
                value={formCreate?.provinceCode}
                onChange={(value) => changeFormRequest("provinceCode", value)}
              >
                {provinces?.map((item) => (
                  <Option key={item.code} value={item.code}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label={
                <span>
                  Huyện/Thị trấn <span style={{ color: "red" }}>*</span>
                </span>
              }
              validateStatus={formErrors["districtCode"] ? "error" : ""}
              help={formErrors["districtCode"] || ""}
            >
              <Select
                placeholder="Chọn huyện/thị trấn"
                size={"large"}
                className="custom-select"
                value={formCreate?.districtCode}
                onChange={(value) => changeFormRequest("districtCode", value)}
              >
                {districts?.map((item) => (
                  <Option key={item.code} value={item.code}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label={
                <span>
                  Địa chỉ cụ thể <span style={{ color: "red" }}>*</span>
                </span>
              }
              validateStatus={formErrors["addressDetail"] ? "error" : ""}
              help={formErrors["addressDetail"] || ""}
            >
              <Input
                placeholder="Địa chỉ cụ thể"
                value={formCreate?.addressDetail}
                onChange={(e) =>
                  changeFormRequest("addressDetail", e.target.value)
                }
                size={"large"}
              />
            </Form.Item>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "30% 30% 32%",
              gap: "4%",
            }}
          >
            <Form.Item
              label={
                <span>
                  Số điện thoại <span style={{ color: "red" }}>*</span>
                </span>
              }
              validateStatus={formErrors["phoneNumber"] ? "error" : ""}
              help={formErrors["phoneNumber"] || ""}
            >
              <Input
                size={"large"}
                value={formCreate.phoneNumber || ""}
                onChange={(e) =>
                  handleFormUpdate(
                    setFormCreate,
                    setFormErrors,
                    "phoneNumber",
                    e.target.value
                  )
                }
              />
            </Form.Item>
            <Form.Item
              label={
                <span>
                  Ngành nghề <span style={{ color: "red" }}>*</span>
                </span>
              }
              validateStatus={formErrors["professionCode"] ? "error" : ""}
              help={formErrors["professionCode"] || ""}
            >
              <Select
                placeholder={"Chọn ngành nghề"}
                value={formCreate?.professionCode}
                onChange={(value) => changeFormRequest("professionCode", value)}
                style={{ width: "100%" }}
                size={"large"}
              >
                {professions?.body?.map((type) => (
                  <Option key={type.id} value={type.code}>
                    {type.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label="Mã số thuế khách hàng"
              validateStatus={formErrors["taxCode"] ? "error" : ""}
              help={formErrors["taxCode"] || ""}
            >
              <Input
                size={"large"}
                value={formCreate?.taxCode}
                onChange={(e) => changeFormRequest("taxCode", e.target.value)}
              />
            </Form.Item>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "30% 30% 32%",
              gap: "4%",
            }}
          >
            <Form.Item
              label={
                <span>
                  Cấp đối tượng <span style={{ color: "red" }}>*</span>
                </span>
              }
              validateStatus={formErrors["agentLevelCode"] ? "error" : ""}
              help={formErrors["agentLevelCode"] || ""}
            >
              <Select
                placeholder={"Chọn cấp đối tượng"}
                value={formCreate?.agentLevelCode}
                onChange={(value) => changeFormRequest("agentLevelCode", value)}
                style={{ width: "100%" }}
                size={"large"}
                options={[
                  { value: "level1", label: "Cấp 1" },
                  { value: "level2", label: "Cấp 2" },
                  { value: "level3", label: "Cấp 3" },
                  { value: "level4", label: "Cấp 4" },
                ]}
              />
            </Form.Item>
            <Form.Item
              label={
                <span>
                  Công nợ tối đa <span style={{ color: "red" }}>*</span>
                </span>
              }
              validateStatus={formErrors["maximumDebt"] ? "error" : ""}
              help={formErrors["maximumDebt"] || ""}
            >
              <Input
                size={"large"}
                value={formCreate?.maximumDebt}
                onChange={(e) =>
                  changeFormRequest("maximumDebt", e.target.value)
                }
              />
            </Form.Item>
            <Form.Item
              label={
                <span>
                  Số ngày được phép nợ <span style={{ color: "red" }}>*</span>
                </span>
              }
              validateStatus={formErrors["debtDay"] ? "error" : ""}
              help={formErrors["debtDay"] || ""}
            >
              <Input
                size={"large"}
                value={formCreate?.debtDay}
                onChange={(e) => changeFormRequest("debtDay", e.target.value)}
              />
            </Form.Item>
          </div>
        </div>
        <div
          style={{ display: "grid", gridTemplateColumns: "49% 49%", gap: "2%" }}
          className={"mb-3"}
        >
          <div className="p-2 border-[1px] border-gray-200 rounded-md">
            <div
              className={
                "h-[35px] bg-gray-200 flex items-center pl-3 text-16 font-bold mb-3"
              }
            >
              Tài khoản ngân hàng
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "60% 36%",
                gap: "4%",
              }}
            >
              <Form.Item
                label={
                  <span>
                    Ngân hàng <span style={{ color: "red" }}>*</span>
                  </span>
                }
                validateStatus={formErrors["bankName"] ? "error" : ""}
                help={formErrors["bankName"] || ""}
              >
                <Select
                  placeholder="Chọn ngân hàng"
                  size={"large"}
                  className="custom-select"
                  value={formCreate?.bankName}
                  onChange={(value) => changeFormRequest("bankName", value)}
                >
                  {banks?.map((item) => (
                    <Option key={item?.code} value={item?.code}>
                      {item?.shortName} - {item?.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                label="Số tài khoản"
                validateStatus={formErrors["bankNumber"] ? "error" : ""}
                help={formErrors["bankNumber"] || ""}
              >
                <Input
                  size={"large"}
                  value={formCreate?.bankNumber}
                  onChange={(e) =>
                    changeFormRequest("bankNumber", e.target.value)
                  }
                />
              </Form.Item>
              <Form.Item
                label="Tên tài khoản"
                validateStatus={formErrors["accountName"] ? "error" : ""}
                help={formErrors["accountName"] || ""}
              >
                <Input
                  size={"large"}
                  value={formCreate?.accountName}
                  onChange={(e) =>
                    changeFormRequest("accountName", e.target.value)
                  }
                />
              </Form.Item>
            </div>
          </div>
          <div className="p-2 border-[1px] border-gray-200 rounded-md">
            <div
              className={
                "h-[35px] bg-gray-200 flex items-center pl-3 text-16 font-bold mb-3"
              }
            >
              Thông tin quản lý
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "48% 48%",
                gap: "4%",
              }}
            >
              <Form.Item
                label={
                  <span>
                    Kinh doanh quản lý <span style={{ color: "red" }}>*</span>
                  </span>
                }
                validateStatus={
                  formErrors["businessManagerCode"] ? "error" : ""
                }
                help={formErrors["businessManagerCode"] || ""}
              >
                <Select
                  showSearch
                  placeholder="Chọn người quản lý"
                  size={"large"}
                  value={formCreate?.businessManagerCode}
                  onChange={(value) =>
                    changeFormRequest("businessManagerCode", value)
                  }
                  filterOption={(input, option) =>
                    (option?.children ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                >
                  {users?.map((user) => (
                    <Option key={user.code} value={user.code}>
                      {user.fullName} ({user.username})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                label={
                  <span>
                    Chi nhánh quản lý <span style={{ color: "red" }}>*</span>
                  </span>
                }
              >
                <Select
                  showSearch
                  placeholder="Chọn chi nhánh quản lý"
                  size={"large"}
                  value={formCreate?.branchCode}
                  onChange={(value) => changeFormRequest("branchCode", value)}
                  filterOption={(input, option) =>
                    (option?.children ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                >
                  {branches?.map((branch) => (
                    <Option key={branch.code} value={branch.code}>
                      {branch.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
          </div>
        </div>
        <Form.Item label="Ghi chú">
          <TextArea
            placeholder="Ghi chú"
            value={formCreate?.description}
            onChange={(e) => changeFormRequest("description", e.target.value)}
            size={"large"}
          />
        </Form.Item>
        <Form.Item>
          <Checkbox
            checked={formCreate?.status === "ACTIVE"}
            onChange={(value) =>
              changeFormRequest(
                "status",
                value.target.checked ? "ACTIVE" : "INACTIVE"
              )
            }
          >
            Hoạt động
          </Checkbox>
        </Form.Item>
      </Form>
    </div>
  );
}

export default CreateObjectsPartner;

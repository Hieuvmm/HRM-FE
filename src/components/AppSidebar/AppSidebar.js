import { Layout, Menu, Tooltip } from "antd";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "./style.scss";
import { AiOutlineProduct, AiOutlineUser } from "react-icons/ai";
import logoApp from "../../assets/logoApp.svg";
import { routes } from "../../utils/common";
import { checkReturnTrue } from "../../utils/AppUtil";
import { GoCalendar } from "react-icons/go";
import { CiFolderOn, CiSquarePlus } from "react-icons/ci";
import { LuClock3 } from "react-icons/lu";
import { IoCartOutline, IoSettingsOutline } from "react-icons/io5";
import { ParameterTypeApi } from "../../apis/ParameterType.api";
import { useUserStore } from "../../store/storeUser";
import { useParameterStore } from "../../store/storeParameter";
import { AiFillDashboard } from "react-icons/ai";
import { BsBuildingsFill, BsCartFill } from "react-icons/bs";
import { MdOutlineContentPaste } from "react-icons/md";

const { Sider } = Layout;

const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedKey, setSelectedKey] = useState(location.pathname);

  useEffect(() => {
    setSelectedKey(location.pathname);
  }, [location.pathname]);

  const handleMenuClick = (key, path) => {
    setSelectedKey(key);
    navigate(path);
  };
  const getKeySidebar = (path, keys) => {
    const keyNow = keys?.find((item) => path.includes(item));
    if (keyNow) {
      return path;
    }
  };
  const { data: parameterTypes } = ParameterTypeApi.useGetList(
    {
      page: 1,
      limit: 10000,
      status: "",
      searchText: "",
    },
    { staleTime: 0, cacheTime: 0 }
  );
  const [addParameters] = useParameterStore((state) => [state?.addParameters]);
  return (
    <>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <Link to={routes.INFO_COMPANY} className="logo-container">
          <img
            src={logoApp}
            alt="logo"
            className={`logo-image ${collapsed ? "collapsed" : ""}`}
          />
        </Link>
        <div
          className="content-sidebar"
          style={{
            overflowY: "auto",
            overflowX: "hidden",
            height: "83.2vh",
            backgroundColor: "#fff",
            borderTop: "1px #efefef solid",
          }}
        >
          <Menu
            className={collapsed ? "sidebar-body active" : "sidebar-body"}
            mode="inline"
            theme="light"
            style={{ width: "100%" }}
            selectedKeys={[selectedKey]}
          >
            {/* Dashboard */}
            <Menu.Item
              key={routes.DASHBOARD}
              icon={<AiOutlineProduct size={25} />}
              onClick={() =>
                handleMenuClick(routes.DASHBOARD, routes.DASHBOARD)
              }
            >
              <h2>Dashboard</h2>
            </Menu.Item>

            {/* Quản lý thi công */}
            <Menu.Item
              key={getKeySidebar(selectedKey, [
                routes.PROJECT,
                routes.PROJECT_CREATE,
                routes.PROJECT_UPDATE,
                routes.PROJECT_TYPE,
                routes.PROJECT_CATEGORY,
              ])}
              icon={<GoCalendar size={25} />}
              onClick={() => handleMenuClick(routes.PROJECT, routes.PROJECT)}
            >
              <h2>Quản lý thi công</h2>
            </Menu.Item>

            {/* Quản lý bán hàng */}
            <Menu.Item
              key={getKeySidebar(selectedKey, [
                routes.ORDER_MANAGEMENT,
                routes.ORDER_CREATE,
                routes.ORDER_UPDATE,
                routes.ORDER_DETAIL,
              ])}
              icon={<IoCartOutline size={25} />}
              onClick={() =>
                handleMenuClick(
                  routes.ORDER_MANAGEMENT,
                  routes.ORDER_MANAGEMENT
                )
              }
            >
              <h2>Quản lý bán hàng</h2>
            </Menu.Item>

            <Menu.SubMenu
              key={routes.PARTNER}
              title={"Quản lý khách hàng"}
              icon={<AiOutlineUser size={25} />}
            >
              <Menu.Item
                key={getKeySidebar(selectedKey, [
                  routes.PARTNER,
                  routes.PARTNER_CREATE,
                  routes.PARTNER_UPDATE,
                ])}
                onClick={() => handleMenuClick(routes.PARTNER, routes.PARTNER)}
              >
                <h4>Khách hàng</h4>
              </Menu.Item>
              <Menu.Item
                key={routes.PROFESSION}
                onClick={() =>
                  handleMenuClick(routes.PROFESSION, routes.PROFESSION)
                }
              >
                <h4>Lĩnh vực</h4>
              </Menu.Item>
            </Menu.SubMenu>
            <Menu.SubMenu
              key={routes.WAREHOUSE}
              title={"Quản lý kho"}
              icon={<CiFolderOn size={25} />}
            >
              <Menu.Item
                key={routes.WAREHOUSE}
                onClick={() =>
                  handleMenuClick(routes.WAREHOUSE, routes.WAREHOUSE)
                }
              >
                <h4>Kho</h4>
              </Menu.Item>

              <Menu.Item
                key={routes.IM_WAREHOUSE}
                onClick={() =>
                  handleMenuClick(routes.IM_WAREHOUSE, routes.IM_WAREHOUSE)
                }
              >
                <h4>Nhập kho</h4>
              </Menu.Item>
              <Menu.Item
                key={routes.EX_WAREHOUSE}
                onClick={() =>
                  handleMenuClick(routes.EX_WAREHOUSE, routes.EX_WAREHOUSE)
                }
              >
                <h4>Xuất kho</h4>
              </Menu.Item>
              <Menu.Item
                key={getKeySidebar(selectedKey, [
                  routes.MATERIAL,
                  routes.MATERIAL_CREATE,
                  routes.MATERIAL_TYPE,
                  routes.UNIT_TYPE,
                  routes.EXCHANGE_RATE,
                  routes.PROVIDER,
                ])}
                onClick={() =>
                  handleMenuClick(routes.MATERIAL, routes.MATERIAL)
                }
              >
                <h4>Danh mục vật tư</h4>
              </Menu.Item>
              <Menu.Item
                key={getKeySidebar(selectedKey, [routes.PARAMETER_TYPE])}
                onClick={() =>
                  handleMenuClick(routes.PARAMETER_TYPE, routes.PARAMETER_TYPE)
                }
              >
                <h4>Quản lý loại thông số</h4>
              </Menu.Item>
              <Menu.Item
                key={getKeySidebar(selectedKey, [routes.PARAMETER])}
                onClick={() => {
                  const lastRecord = parameterTypes?.body?.at(-1);
                  if (lastRecord?.code) {
                    const paramRoute = routes.PARAMETER + lastRecord.code;
                    handleMenuClick(paramRoute, paramRoute);
                    addParameters(parameterTypes?.body);
                  }
                }}
              >
                <h4>Quản lý thông số</h4>
              </Menu.Item>
            </Menu.SubMenu>
            <Menu.SubMenu
              key={routes.REQUEST}
              title={"Chấm công"}
              icon={<LuClock3 size={25} />}
            >
              <Menu.Item
                key={routes.REQUEST}
                onClick={() => handleMenuClick(routes.REQUEST, routes.REQUEST)}
              >
                <h4>Đơn từ</h4>
              </Menu.Item>

              <Menu.Item
                key={routes.TIME_SHEET}
                onClick={() =>
                  handleMenuClick(routes.TIME_SHEET, routes.TIME_SHEET)
                }
              >
                <h4>Bảng công</h4>
              </Menu.Item>
            </Menu.SubMenu>
            <Menu.SubMenu
              key={routes.ACCOUNT}
              title={"Quản trị hệ thống"}
              icon={<IoSettingsOutline size={25} />}
            >
              <Menu.Item
                key={getKeySidebar(selectedKey, [
                  routes.ACCOUNT,
                  routes.JOB_POSITION,
                  routes.JOB_TITLE,
                  routes.DEPARTMENT,
                  routes.BRANCH,
                ])}
                onClick={() => handleMenuClick(routes.ACCOUNT, routes.ACCOUNT)}
              >
                <h4>Tổ chức</h4>
              </Menu.Item>

              <Menu.Item
                key={routes.PERMISSION}
                onClick={() =>
                  handleMenuClick(routes.PERMISSION, routes.PERMISSION)
                }
              >
                <h4>Phân quyền</h4>
              </Menu.Item>
              <Menu.Item
                key={routes.USER_INFO}
                onClick={() =>
                  handleMenuClick(routes.USER_INFO, routes.USER_INFO)
                }
              >
                <h4>Hồ sơ nhân sự</h4>
              </Menu.Item>

              <Menu.Item
                key={routes.CONTENT_MANAGEMENT}
                // icon={<MdOutlineContentPaste size={25} />}
                onClick={() =>
                  handleMenuClick(
                    routes.CONTENT_MANAGEMENT,
                    routes.CONTENT_MANAGEMENT
                  )
                }
              >
                <h4>Quản lý dashboard</h4>
              </Menu.Item>
            </Menu.SubMenu>

            <Menu.SubMenu
              title={"Thêm mới dữ liệu"}
              icon={<CiSquarePlus size={25} />}
            >
              <Menu.SubMenu title={"Thi công"}>
                <Menu.Item
                  // key={routes.PROJECT_CREATE}
                  onClick={() => navigate(routes.PROJECT_CREATE)}
                >
                  <h4>Công trình</h4>
                </Menu.Item>
                <Menu.Item
                  // key={routes.PROJECT_TYPE}
                  onClick={() => navigate(routes.PROJECT_TYPE)}
                >
                  <h4>Loại công trình</h4>
                </Menu.Item>
                <Menu.Item
                  // key={routes.PROJECT_CATEGORY}
                  onClick={() => navigate(routes.PROJECT_CATEGORY)}
                >
                  <h4>Hạng mục công trình</h4>
                </Menu.Item>
              </Menu.SubMenu>

              <Menu.SubMenu title={"Đối tác"}>
                <Menu.Item
                  // key={routes.CUSTOMER_CREATE}
                  onClick={() =>
                    handleMenuClick(
                      routes.PARTNER_CREATE,
                      routes.PARTNER_CREATE
                    )
                  }
                >
                  <h4>Đối tác</h4>
                </Menu.Item>
              </Menu.SubMenu>

              <Menu.SubMenu title={"Kho"}>
                <Menu.Item
                  key={routes.WAREHOUSE}
                  onClick={() => navigate(routes.WAREHOUSE)}
                >
                  <h4>Kho</h4>
                </Menu.Item>
                <Menu.Item
                  // key={routes.IM_WAREHOUSE}
                  onClick={() => navigate(routes.IM_WAREHOUSE)}
                >
                  <h4>Phiếu nhập</h4>
                </Menu.Item>
                <Menu.Item onClick={() => navigate(routes.EX_WAREHOUSE)}>
                  <h4>Phiếu xuất</h4>
                </Menu.Item>
              </Menu.SubMenu>
              <Menu.SubMenu title={"Danh mục vật tư"}>
                <Menu.Item
                  // key={routes.MATERIAL_TYPE}
                  onClick={() => navigate(routes.MATERIAL_TYPE)}
                >
                  <h4>Loại vật tư</h4>
                </Menu.Item>
                <Menu.Item
                  // key={routes.MATERIAL}
                  onClick={() => navigate(routes.MATERIAL)}
                >
                  <h4>Vật tư</h4>
                </Menu.Item>
                <Menu.Item
                  // key={routes.UNIT_TYPE}
                  onClick={() => navigate(routes.UNIT_TYPE)}
                >
                  <h4>Đơn vị tính</h4>
                </Menu.Item>
                <Menu.Item
                  // key={routes.MATERIALS}
                  onClick={() => navigate(routes.EXCHANGE_RATE)}
                >
                  <h4>Tỷ giá</h4>
                </Menu.Item>
                <Menu.Item
                  // key={routes.MATERIALS}
                  onClick={() => navigate(routes.PROVIDER)}
                >
                  <h4>Nhà cung cấp</h4>
                </Menu.Item>
              </Menu.SubMenu>
              <Menu.SubMenu title={"Tổ chức"}>
                <Menu.Item
                  // key={routes.ACCOUNT}
                  onClick={() => navigate(routes.ACCOUNT)}
                >
                  <h4>Tài khoản</h4>
                </Menu.Item>
                <Menu.Item
                  // key={routes.JOB_TITLE}
                  onClick={() => navigate(routes.JOB_TITLE)}
                >
                  <h4>Chức danh</h4>
                </Menu.Item>
                <Menu.Item
                  // key={routes.ACCOUNT}
                  onClick={() => navigate(routes.JOB_POSITION)}
                >
                  <h4>Chức vụ</h4>
                </Menu.Item>
                <Menu.Item
                  // key={routes.ACCOUNT}
                  onClick={() => navigate(routes.DEPARTMENT)}
                >
                  <h4>Phòng ban</h4>
                </Menu.Item>
                <Menu.Item
                  // key={routes.ACCOUNT}
                  onClick={() => navigate(routes.BRANCH)}
                >
                  <h4>Chi nhánh</h4>
                </Menu.Item>
              </Menu.SubMenu>
            </Menu.SubMenu>
          </Menu>
        </div>
      </Sider>
      <div
        style={{
          height: "100vh",
          width: checkReturnTrue(collapsed, 80, 250),
          backgroundColor: "white",
          transition: "width 0.25s ease",
        }}
      ></div>
    </>
  );
};

export default AppSidebar;

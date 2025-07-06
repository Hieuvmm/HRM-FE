import { lazy } from "react";
import { routes } from "../utils/common";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import LayoutMaterials from "../pages/MaterialCategory";
import Warehouse from "../pages/Warehouse";
import WarehouseDetail from "../pages/Warehouse/DetailWareHouse";
import SystemManagement from "../pages/SystemManagerment";
import ImportWarehouse from "../pages/Warehouse/ImportWarehouse";
import ExportWarehouse from "../pages/Warehouse/ExportWarehouse";
import ConstructionManagement from "../pages/ConstructionManagement";
import Customer from "../pages/Objects";
import UserInfo from "../pages/SystemManagerment/UserInfo";
// import CreateData from "pages/CreateData";
import CreateProject from "../pages/ConstructionManagement/Project/CreateProject";
import CreateObjectsPartner from "../pages/Objects/CreateObjectsPartner/CreateObjectsPartner";
import OrderManagement from "../pages/OrderManagement";
import CreateOrder from "../pages/OrderManagement/CreateOrder/CreateOrder";
import CreateImport from "../pages/Warehouse/ImportWarehouse/Create/CreateImport";
import DetailImport from "../pages/Warehouse/ImportWarehouse/Detail/DetailImport";
import DetailOrder from "pages/OrderManagement/DetailOrder/DetailOrder";
import CreateWarehouse from "pages/Warehouse/CreateWarehouse";
import CreateExportBillPage from "pages/Warehouse/ExportWarehouse/PageCreateExport/CreateExportBillPage";
import DetailExportBillPage from "../pages/Warehouse/ExportWarehouse/PageCreateExport/DetailExportBillPage";
import ParameterType from "../pages/MaterialParameter/ParameterType";
import Parameter from "../pages/MaterialParameter/Parameter";
import Profession from "../pages/GeneralCategory/Profession";
import ProjectType from "../pages/ConstructionManagement/ProjectType";
import CreateMaterial from "../pages/MaterialCategory/Material/CreateMaterial";
import CreateAccount from "../pages/SystemManagerment/Account/CreateAccount/CreateAccount";
import AttributeManagement from "../pages/AttributeManagement";
import permissions from "pages/SystemManagerment/Permissions";
import ContentManagement from "../pages/ContentManagement";
import NewsDetail from "../pages/Dashboard/NewsDetail";
import AddContent from "../pages/ContentManagement/AddContent";
// const Login = lazy(() => import("../pages/Login"));
// const Dashboard = lazy(() => import("../pages/Dashboard"));
// const LayoutMaterials = lazy(() => import("../pages/MaterialCategory"));
// const Warehouse = lazy(() => import("../pages/Warehouse"));
// const WarehouseDetail = lazy(() => import("../pages/Warehouse/DetailWareHouse"));
// const SystemManagement = lazy(() => import("../pages/SystemManagerment"));
// const ImportWarehouse = lazy(() => import("../pages/Warehouse/ImportWarehouse"));
// const ExportWarehouse = lazy(() => import("../pages/Warehouse/ExportWarehouse"))

const privateRoutes = [
  { path: routes.LOGIN, component: Login },
  { path: routes.HOME_PAGE, component: Login },
  { path: routes.DASHBOARD, component: Dashboard },
  { path: routes.WAREHOUSE, component: Warehouse },
  { path: routes.WAREHOUSE_DETAIL, component: WarehouseDetail },
  { path: routes.WAREHOUSE_CREATE, component: CreateWarehouse },
  { path: routes.WAREHOUSE_EDIT + ":whCode", component: CreateWarehouse },
  { path: routes.IM_WAREHOUSE, component: ImportWarehouse },
  { path: routes.IM_WAREHOUSE_CREATE, component: CreateImport },
  { path: routes.IM_WAREHOUSE_UPDATE + ":code", component: CreateImport },
  { path: routes.IM_WAREHOUSE_DETAIL + ":code", component: DetailImport },
  { path: routes.EX_WAREHOUSE, component: ExportWarehouse },
  { path: routes.EX_WAREHOUSE_CREATE, component: CreateExportBillPage },
  {
    path: routes.EX_WAREHOUSE_EDIT + ":exCode",
    component: CreateExportBillPage,
  },
  {
    path: routes.EX_WAREHOUSE_DETAIL + ":exCode",
    component: DetailExportBillPage,
  },
  { path: routes.MATERIAL, component: LayoutMaterials },
  { path: routes.MATERIAL_CREATE, component: CreateMaterial },
  { path: routes.MATERIAL_UPDATE + ":code", component: CreateMaterial },
  { path: routes.MATERIAL_TYPE, component: LayoutMaterials },
  { path: routes.UNIT_TYPE, component: LayoutMaterials },
  { path: routes.EXCHANGE_RATE, component: LayoutMaterials },
  { path: routes.PROVIDER, component: LayoutMaterials },
  { path: routes.REQUEST, component: Dashboard },
  { path: routes.TIME_SHEET, component: Dashboard },
  { path: routes.ACCOUNT, component: SystemManagement },
  { path: routes.JOB_POSITION, component: SystemManagement },
  { path: routes.JOB_TITLE, component: SystemManagement },
  { path: routes.BRANCH, component: SystemManagement },
  { path: routes.DEPARTMENT, component: SystemManagement },
  { path: routes.PERMISSION, component: permissions },
  { path: routes.USER_INFO, component: UserInfo },
  { path: routes.PROJECT, component: ConstructionManagement },
  { path: routes.PROJECT_TYPE, component: ConstructionManagement },
  { path: routes.PROJECT_TYPE_CREATE, component: ProjectType },
  { path: routes.PROJECT_CATEGORY, component: ConstructionManagement },
  { path: routes.PROJECT_CREATE, component: CreateProject },
  { path: routes.PROJECT_UPDATE + ":code", component: CreateProject },
  { path: routes.PROJECT_DETAIL + ":code", component: CreateProject },
  { path: routes.PARTNER, component: Customer },
  { path: routes.PARTNER_CREATE, component: CreateObjectsPartner },
  { path: routes.PARTNER_UPDATE + ":code", component: CreateObjectsPartner },
  { path: routes.ORDER_MANAGEMENT, component: OrderManagement },
  { path: routes.ORDER_CREATE, component: CreateOrder },
  { path: routes.ORDER_UPDATE + ":code", component: CreateOrder },
  { path: routes.ORDER_DETAIL + ":code", component: DetailOrder },
  { path: routes.ORDER_DETAIL + ":code", component: DetailOrder },
  { path: routes.PARAMETER_TYPE, component: ParameterType },
  { path: routes.PARAMETER + ":code", component: Parameter },
  { path: routes.PROFESSION, component: Profession },
  { path: routes.ACCOUNT_CREATE, component: CreateAccount },
  { path: routes.ATTRIBUTE_MANAGE, component: AttributeManagement },
  { path: routes.CONTENT_MANAGEMENT, component: ContentManagement },
  { path: "/content-management/add", component: AddContent },
  { path: routes.DASHBOARD_NEWS_DETAIL, component: NewsDetail },
];

export { privateRoutes };

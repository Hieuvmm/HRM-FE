import { Breadcrumb } from "antd";
import { Link, useLocation } from "react-router-dom";

// Map path segment to display name
const breadcrumbNameMap = {
  "system-management": "Quản trị hệ thống",
  "content-management": "Quản lý nội dung",
  banner: "Quản lý Banner",
  "order-management": "Quản lý đơn hàng",
  dashboard: "Bảng tin",
  news: "Chi tiết tin tức",
  // Thêm các mapping khác nếu cần
};

const AppBreadcrumb = () => {
  const location = useLocation();
  const pathSnippets = location.pathname.split("/").filter((i) => i);

  // Tạo mảng các cấp breadcrumb
  const extraBreadcrumbItems = pathSnippets.map((_, index) => {
    const url = `/${pathSnippets.slice(0, index + 1).join("/")}`;
    const name = breadcrumbNameMap[pathSnippets[index]] || pathSnippets[index];
    return (
      <Breadcrumb.Item key={url}>
        {index !== pathSnippets.length - 1 ? (
          <Link to={url}>{name}</Link>
        ) : (
          name
        )}
      </Breadcrumb.Item>
    );
  });

  // Cấp đầu là Quản trị hệ thống, dẫn về /dashboard
  const breadcrumbItems = [
    <Breadcrumb.Item key="root">
      <Link to="/dashboard">Quản trị hệ thống</Link>
    </Breadcrumb.Item>,
  ].concat(extraBreadcrumbItems);

  return (
    <Breadcrumb style={{ margin: "16px 0" }}>{breadcrumbItems}</Breadcrumb>
  );
};

export default AppBreadcrumb;

import { Pagination, Select, Table } from "antd";
import "./style.scss";

function AppTableWareHouse({
  columns,
  dataSource,
  changeFormSearch,
  totalPages,
  totalElement,
  formSearch,
  onRow,
}) {
  return (
    <>
      <Table
        className="table-all-default"
        style={{ overflowX: "auto" }}
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        bordered
        {...(onRow ? { onRow } : {})}
      />
      {dataSource?.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "end",
            padding: "19px 19px 20px 0",
            background: "white",
          }}
        >
          <span className="total-element">Tổng số bản ghi: {totalElement}</span>
          <Pagination
            style={{ margin: "0 1%" }}
            defaultCurrent={1}
            current={formSearch.pageNumber}
            onChange={(value) => changeFormSearch("pageNumber", value)}
            total={totalPages * 10}
            showSizeChanger={false}
            showQuickJumper={false}
          />

          <Select
            size={"large"}
            style={{ width: 110 }}
            value={formSearch.pageSize}
            defaultValue={10}
            onChange={(value) => changeFormSearch("pageSize", value)}
          >
            <Select.Option value={10}>10/ Trang</Select.Option>
            <Select.Option value={20}>20/ Trang</Select.Option>
            <Select.Option value={30}>30/ Trang</Select.Option>
            <Select.Option value={50}>50/ Trang</Select.Option>
          </Select>
        </div>
      )}
    </>
  );
}

export default AppTableWareHouse;

import { Pagination, Select, Table } from "antd";
import "./style.scss";
import { useStyle } from "../../utils/AppUtil";

function AppTable({
  className,
  rowSelection,
  rowKey,
  columns,
  dataSource,
  changeFormSearch,
  totalPages,
  totalElement,
  formSearch,
  handleClick,
  onRow,
}) {
  const { styles } = useStyle();
  return (
    <>
      <Table
        rowSelection={rowSelection}
        rowKey={rowKey}
        className={`${styles?.customTable} ${className}`}
        scroll={{
          x: "max-content",
        }}
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        bordered
        onRow={
          onRow
            ? onRow
            : (record) => ({
                onClick: () => (handleClick ? handleClick(record) : null),
              })
        }
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
            current={formSearch.page}
            onChange={(value) => changeFormSearch("page", value)}
            total={totalPages * 10}
            showSizeChanger={false}
            showQuickJumper={false}
          />

          <Select
            size={"large"}
            style={{ width: 110 }}
            value={formSearch.limit}
            defaultValue={10}
            onChange={(value) => changeFormSearch("limit", value)}
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

export default AppTable;

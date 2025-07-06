"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { WarehouseDetailApi } from "../../../apis/Warehouse.api";
import { Button, Popconfirm, Tag, Select, Input } from "antd";
import { IoArrowBack, IoSearch } from "react-icons/io5";
import AppTableWareHouse from "../../../components/TableWareHouse/AppTable";
import { ObjectApi } from "../../../apis/Object.api";

const { Option } = Select;

export default function WarehouseDetail() {
  const { whCode } = useParams();
  const navigate = useNavigate();

  const [searchForm, setSearchForm] = useState({
    whCode: whCode,
    materialType: "",
    supplier: "",
    keyword: "",
    status: "all",
  });
  const [wareHouseList, setWareHouseList] = useState([]);
  const [totalElement, setTotalElement] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const getProviderName = (code) =>
    providerList.find((p) => p.code === code)?.name || code;

  const { data: wareHouse } = WarehouseDetailApi.useGetList(
    { ...searchForm },
    {}
  );

  useEffect(() => {
    if (wareHouse?.productList !== wareHouseList) {
      setWareHouseList(wareHouse?.productList);
    }
  }, [wareHouse, wareHouseList]);

  // Sinh danh sách loại vật tư và nhà cung cấp từ dữ liệu trả về (fix undefined)
  const materialTypes = [
    ...new Set(
      (wareHouseList || []).map((item) => item.category).filter(Boolean)
    ),
  ];
  const providerList = [
    ...new Set(
      (wareHouseList || []).map((item) => item.provider).filter(Boolean)
    ),
  ];

  // Filter data based on status, materialType, supplier
  const getFilteredData = () => {
    if (!wareHouseList) return [];

    let filtered = wareHouseList;

    // Lọc theo loại vật tư
    if (searchForm.materialType) {
      filtered = filtered.filter(
        (item) => item.category === searchForm.materialType
      );
    }

    // Lọc theo nhà cung cấp
    if (searchForm.supplier) {
      filtered = filtered.filter(
        (item) => item.provider === searchForm.supplier
      );
    }

    // Lọc theo trạng thái
    if (searchForm.status !== "all") {
      filtered = filtered.filter((item) => {
        const status = (() => {
          if (item.quantity === 0) return "out_of_stock";
          if (item.quantity < item.minInventory) return "need_restock";
          return "in_stock";
        })();
        return status === searchForm.status;
      });
    }

    // Lọc theo keyword
    if (searchForm.keyword) {
      filtered = filtered.filter(
        (item) =>
          item.productName
            ?.toLowerCase()
            .includes(searchForm.keyword.toLowerCase()) ||
          item.productCode
            ?.toLowerCase()
            .includes(searchForm.keyword.toLowerCase())
      );
    }

    return filtered;
  };

  const dataSource = getFilteredData()?.map((item, index) => ({
    stt: index + 1,
    code: item.productCode,
    name: item.productName,
    category: item.category,
    unit: item.unit,
    quantity: item.quantity,
    min_inventory: item.minInventory,
    price: item.price?.toLocaleString("vi-VN") + " " + (item.ccy || ""),
    sell_price:
      item.sellPrice?.toLocaleString("vi-VN") + " " + (item.ccy || ""),
    provider: item.provider || "",
    status: (() => {
      if (item.quantity === 0) return "Hết hàng";
      if (item.quantity < item.minInventory) return "Cần nhập";
      return "Đủ hàng";
    })(),
  }));

  const columns = [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      width: 60,
      align: "center",
    },
    {
      title: "Mã VT-SP",
      dataIndex: "code",
      key: "code",
      width: 100,
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
      width: 200,
    },
    {
      title: "Loại VT-SP",
      dataIndex: "category",
      key: "category",
      width: 120,
    },
    {
      title: "Đơn vị tính",
      dataIndex: "unit",
      key: "unit",
      width: 100,
      align: "center",
    },
    {
      title: "Tồn kho",
      dataIndex: "quantity",
      key: "quantity",
      width: 80,
      align: "center",
    },
    {
      title: "Ngưỡng tối thiểu",
      dataIndex: "min_inventory",
      key: "min_inventory",
      width: 120,
      align: "center",
    },
    {
      title: "Giá niêm yết",
      dataIndex: "price",
      key: "price",
      width: 120,
      align: "right",
    },
    {
      title: "Giá bán",
      dataIndex: "sell_price",
      key: "sell_price",
      width: 120,
      align: "right",
    },
    {
      title: "Nhà cung cấp",
      dataIndex: "provider",
      key: "provider",
      width: 150,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 100,
      align: "center",
      render: (text) => {
        let color = "green";
        if (text === "Cần nhập") color = "orange";
        if (text === "Hết hàng") color = "red";
        return <Tag color={color}>{text}</Tag>;
      },
    },
  ];

  const handleStatusFilter = (status) => {
    setSearchForm((prev) => ({ ...prev, status }));
  };

  const getStatusCount = (status) => {
    if (!wareHouseList) return 0;
    if (status === "all") return wareHouseList.length;

    return wareHouseList.filter((item) => {
      const itemStatus = (() => {
        if (item.quantity === 0) return "out_of_stock";
        if (item.quantity < item.minInventory) return "need_restock";
        return "in_stock";
      })();
      return itemStatus === status;
    }).length;
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header with back button */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <Button
            type="text"
            icon={<IoArrowBack />}
            onClick={() => navigate("/warehouse")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            Chi tiết Kho {whCode}
          </Button>
        </div>
      </div>

      <div className="p-6">
        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Material Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại Vật tư - Sản phẩm
              </label>
              <Select
                placeholder="Tất cả"
                className="w-full"
                size="large"
                value={searchForm.materialType || undefined}
                onChange={(value) =>
                  setSearchForm((prev) => ({ ...prev, materialType: value }))
                }
                allowClear
              >
                {materialTypes.map((type) => (
                  <Option key={type} value={type}>
                    {type}
                  </Option>
                ))}
              </Select>
            </div>

            {/* Supplier Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nhà cung cấp
              </label>
              <Select
                placeholder="Tất cả nhà cung cấp"
                className="w-full"
                size="large"
                value={searchForm.supplier || undefined}
                onChange={(value) =>
                  setSearchForm((prev) => ({ ...prev, supplier: value }))
                }
                allowClear
              >
                {providerList.map((provider) => (
                  <Option key={provider} value={provider}>
                    {provider}
                  </Option>
                ))}
              </Select>
            </div>

            {/* Search Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tìm kiếm
              </label>
              <Input
                placeholder="Nhập mã, tên vật tư - sản phẩm"
                size="large"
                prefix={<IoSearch className="text-gray-400" />}
                value={searchForm.keyword}
                onChange={(e) =>
                  setSearchForm((prev) => ({
                    ...prev,
                    keyword: e.target.value,
                  }))
                }
                className="w-full"
              />
            </div>
          </div>

          {/* Status Filter Buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button
              type={searchForm.status === "all" ? "primary" : "default"}
              onClick={() => handleStatusFilter("all")}
              className={`rounded-full ${
                searchForm.status === "all"
                  ? "bg-red-600 border-red-600"
                  : "border-gray-300 text-gray-600 hover:border-red-600 hover:text-red-600"
              }`}
            >
              Tất cả
            </Button>
            <Button
              type={searchForm.status === "in_stock" ? "primary" : "default"}
              onClick={() => handleStatusFilter("in_stock")}
              className={`rounded-full ${
                searchForm.status === "in_stock"
                  ? "bg-green-600 border-green-600"
                  : "border-gray-300 text-gray-600 hover:border-green-600 hover:text-green-600"
              }`}
            >
              Đủ hàng
            </Button>
            <Button
              type={
                searchForm.status === "need_restock" ? "primary" : "default"
              }
              onClick={() => handleStatusFilter("need_restock")}
              className={`rounded-full ${
                searchForm.status === "need_restock"
                  ? "bg-orange-600 border-orange-600"
                  : "border-gray-300 text-gray-600 hover:border-orange-600 hover:text-orange-600"
              }`}
            >
              Cần nhập
            </Button>
            <Button
              type={
                searchForm.status === "out_of_stock" ? "primary" : "default"
              }
              onClick={() => handleStatusFilter("out_of_stock")}
              className={`rounded-full ${
                searchForm.status === "out_of_stock"
                  ? "bg-red-600 border-red-600"
                  : "border-gray-300 text-gray-600 hover:border-red-600 hover:text-red-600"
              }`}
            >
              Hết hàng
            </Button>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <AppTableWareHouse
            columns={columns}
            dataSource={dataSource}
            formSearch={searchForm}
            changeFormSearch={() => {}}
            totalElement={totalElement}
            totalPages={totalPages}
            pagination={{
              current: 1,
              pageSize: 10,
              total: dataSource?.length || 0,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} mục`,
              pageSizeOptions: ["10", "20", "50", "100"],
            }}
          />
        </div>
      </div>
    </div>
  );
}

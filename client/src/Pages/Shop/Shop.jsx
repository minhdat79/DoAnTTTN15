import { FilterOutlined } from "@ant-design/icons";
import { Button, Pagination, Select, message } from "antd";
import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { formatCurrencyVND } from "../../utils";
import { getAllProduct } from "../../service/productService";
import { getAllCategory } from "../../service/categoryService";
import ProductItem from "../../Components/ProductItem/ProductItem";

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagi, setPagi] = useState({
    total: 1,
    limit: 6,
    page: 1,
    totalPages: 1,
  });
  const [filters, setFilters] = useState({
    priceRange: [0, 10000000000],
    status: [],
    category: [],
    sortBy: null,
    searchText: "",
  });

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchText = searchParams.get("search");
  const categoryText = searchParams.get("categories");

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      const res = await getAllProduct({
        page: pagi.page,
        limit: pagi.limit,
        filters,
      });
      if (res.status === 200) {
        setProducts(res.data.data);
        setPagi(res.data.meta);
      }
    } catch (error) {
      message.error("Không thể tải danh sách sản phẩm");
    }
  }, [filters, pagi.page, pagi.limit]);

  // Fetch categories
  const fetchAllCategories = useCallback(async () => {
    try {
      const res = await getAllCategory({ page: 1, limit: 1000 });
      if (res.status === 200) {
        setCategories(res.data.data);
      }
    } catch (error) {
      message.error("Không thể tải danh sách danh mục");
    }
  }, []);

  // Sync filters with URL params
  useEffect(() => {
    const newFilters = { ...filters };

    // Update searchText
    newFilters.searchText = searchText || "";

    // Update category if categoryText exists and categories are loaded
    if (categoryText && categories.length > 0) {
      const matchedCategory = categories.find((cate) =>
        new RegExp(`^${categoryText}$`, "i").test(cate.name)
      );
      newFilters.category = matchedCategory ? [matchedCategory._id] : [];
    }

    setFilters(newFilters);
  }, [searchText, categoryText, categories]);

  // Fetch initial data
  useEffect(() => {
    fetchAllCategories();
  }, [fetchAllCategories]);

  // Fetch products when filters or pagination change
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Filter handlers
  const handlePriceChange = (index) => (e) => {
    const value = Number(e.target.value);
    setFilters((prev) => ({
      ...prev,
      priceRange:
        index === 0 ? [value, prev.priceRange[1]] : [prev.priceRange[0], value],
    }));
  };

  const handleStockChange = (stockStatus) => {
    setFilters((prev) => ({
      ...prev,
      status: prev.status.includes(stockStatus)
        ? prev.status.filter((s) => s !== stockStatus)
        : [...prev.status, stockStatus],
    }));
  };

  const handleCategoryChange = (category) => {
    setFilters((prev) => ({
      ...prev,
      category: prev.category.includes(category)
        ? prev.category.filter((c) => c !== category)
        : [...prev.category, category],
    }));
  };

  const handleSortChange = (value) =>
    setFilters((prev) => ({ ...prev, sortBy: value }));

  const handlePageChange = (page, pageSize) => {
    setPagi((prev) => ({ ...prev, page, limit: pageSize }));
  };

  return (
    <div className="flex justify-center">
      <div className="container px-4 py-6 flex gap-6">
        <aside className="w-1/4">
          {searchText && (
            <h3 className="text-lg font-base mb-2">
              Kết quả tìm kiếm: <strong>{searchText}</strong>
            </h3>
          )}

          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Lọc theo khoảng giá</h3>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Giá thấp nhất"
                className="w-1/2 p-2 border border-gray-300 rounded"
                onChange={handlePriceChange(0)}
              />
              <input
                type="number"
                placeholder="Giá cao nhất"
                className="w-1/2 p-2 border border-gray-300 rounded"
                onChange={handlePriceChange(1)}
              />
            </div>
            <div className="text-sm mt-2">
              {formatCurrencyVND(filters.priceRange[0])} -{" "}
              {formatCurrencyVND(filters.priceRange[1])}
            </div>
          </section>

          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Trạng thái sản phẩm</h3>
            {["in-stock", "out-of-stock"].map((status) => (
              <div key={status} className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id={status}
                  checked={filters.status.includes(status)}
                  onChange={() => handleStockChange(status)}
                />
                <label htmlFor={status}>
                  {status === "in-stock" ? "Còn hàng" : "Hết hàng"}
                </label>
              </div>
            ))}
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-2">Thể loại</h3>
            <ul className="space-y-2 text-gray-600">
              {categories.map((category) => (
                <li key={category._id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.category.includes(category._id)}
                    onChange={() => handleCategoryChange(category._id)}
                  />
                  <label className="cursor-pointer hover:text-black">
                    {category.name}
                  </label>
                </li>
              ))}
            </ul>
          </section>
        </aside>

        <main className="w-3/4">
          <div className="flex justify-between items-center mb-6">
            <div>Hiển thị {products.length} sản phẩm</div>
            <Select
              className="w-48 h-10"
              placeholder="Sắp xếp"
              onChange={handleSortChange}
            >
              <Select.Option value="price-asc">Giá tăng dần</Select.Option>
              <Select.Option value="price-desc">Giá giảm dần</Select.Option>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductItem key={product._id} product={product} />
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <Pagination
              current={pagi.page}
              pageSize={pagi.limit}
              total={pagi.total}
              onChange={handlePageChange}
              showSizeChanger
              pageSizeOptions={[6, 12, 24, 48]}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Shop;

import React, { useState } from "react";
import { NextPage } from "next";
import { Box, Typography, Pagination, CircularProgress, Alert } from "@mui/material";
import { useQuery } from "@apollo/client";
import useDeviceDetect from "../../libs/hooks/useDeviceDetect";
import withLayoutBasic from "../../libs/components/layout/LayoutBasic";
import Filter from "../../libs/components/product/Filter";
import ProductCard, { Product } from "../../libs/components/product/ProductCard";
import { GET_PRODUCTS } from "../../apollo/user/query";


/** ─── Constants ─────────────────────────────────────────────── */
const PAGE_LIMIT = 12;

const SORT_OPTIONS = [
  { label: "Newest",       value: "createdAt",   dir: "DESC" },
  { label: "Price ↑",     value: "productPrice", dir: "ASC"  },
  { label: "Price ↓",     value: "productPrice", dir: "DESC" },
  { label: "Most Viewed", value: "productViews", dir: "DESC" },
  { label: "Most Liked",  value: "productLikes", dir: "DESC" },
];

/** ─── Helper ────────────────────────────────────────────────── */
const toggleItem = (
  list: string[],
  setList: (v: string[]) => void,
  val: string,
  resetPage: () => void
) => {
  setList(list.includes(val) ? list.filter((x) => x !== val) : [...list, val]);
  resetPage();
};

/** ─── Page ──────────────────────────────────────────────────── */
const ProductList: NextPage = () => {
  const device = useDeviceDetect();

  const [page, setPage]                 = useState(1);
  const [sortIndex, setSortIndex]       = useState(0);
  const [searchText, setSearchText]     = useState("");
  const [activeTypes, setActiveTypes]   = useState<string[]>([]);
  const [activeAges, setActiveAges]     = useState<string[]>([]);
  const [activeColors, setActiveColors] = useState<string[]>([]);
  const [activeSizes, setActiveSizes]   = useState<string[]>([]);
  const [priceRange, setPriceRange]     = useState<[number, number]>([0, 5000]);

  const resetPage = () => setPage(1);
  const sortOpt   = SORT_OPTIONS[sortIndex];

  const buildInput = () => {
    const search: Record<string, any> = {
      priceRange: { start: priceRange[0], end: priceRange[1] },
    };

    if (activeTypes.length)  search.productTypeList        = activeTypes;
    if (activeAges.length)   search.productAgeCategoryList = activeAges;
    if (activeColors.length) search.productColorList       = activeColors;
    if (activeSizes.length)  search.productSizeList        = activeSizes;
    if (searchText.trim())   search.text                   = searchText.trim();

    return {
      page,
      limit: PAGE_LIMIT,
      sort: sortOpt.value,
      direction: sortOpt.dir,
      search,
    };
  };

  const { data, loading, error } = useQuery(GET_PRODUCTS, {
    variables: { input: buildInput() },
    fetchPolicy: "cache-and-network",
  });

  const products: Product[] = data?.getProducts?.list ?? [];
  const total: number       = data?.getProducts?.metaCounter?.[0]?.total ?? 0;
  const pageCount           = Math.ceil(total / PAGE_LIMIT);

  const handleReset = () => {
    setActiveTypes([]);
    setActiveAges([]);
    setActiveColors([]);
    setActiveSizes([]);
    setPriceRange([0, 5000]);
    setSearchText("");
    setPage(1);
  };

  /** Mobile */
  if (device === "mobile") {
    return (
      <Box className="product-list product-list--mobile">
        <Typography className="product-list__heading">Products</Typography>
        {loading && <CircularProgress className="product-list__spinner" />}
        {error && <Alert severity="error">{error.message}</Alert>}
        <Box className="product-list__grid">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </Box>
        {pageCount > 1 && (
          <Pagination
            page={page}
            count={pageCount}
            onChange={(_, v) => setPage(v)}
            className="product-list__pagination"
            shape="circular"
            color="primary"
          />
        )}
      </Box>
    );
  }

  /** Desktop */
  return (
    <Box id="product-list-page" className="product-list">
      <Box className="product-list__layout">

        {/* Sidebar */}
        <Filter
          searchText={searchText}
          onSearchChange={(v) => { setSearchText(v); resetPage(); }}
          activeTypes={activeTypes}
          onToggleType={(v) => toggleItem(activeTypes, setActiveTypes, v, resetPage)}
          activeAges={activeAges}
          onToggleAge={(v) => toggleItem(activeAges, setActiveAges, v, resetPage)}
          activeColors={activeColors}
          onToggleColor={(v) => toggleItem(activeColors, setActiveColors, v, resetPage)}
          activeSizes={activeSizes}
          onToggleSize={(v) => toggleItem(activeSizes, setActiveSizes, v, resetPage)}
          priceRange={priceRange}
          onPriceChange={(v) => { setPriceRange(v); resetPage(); }}
          onReset={handleReset}
        />

        {/* Main content */}
        <Box className="product-list__main">

          {/* Top bar */}
          <Box className="product-list__topbar">
            <Box className="product-list__heading-wrap">
              <Typography className="product-list__heading">Our Products</Typography>
              {!loading && (
                <Typography className="product-list__count">
                  {total} {total === 1 ? "product" : "products"} available
                </Typography>
              )}
            </Box>

            <Box className="product-list__sort-tabs">
              {SORT_OPTIONS.map((opt, i) => (
                <Box
                  key={i}
                  className={`product-list__sort-tab${
                    sortIndex === i ? " product-list__sort-tab--active" : ""
                  }`}
                  onClick={() => { setSortIndex(i); resetPage(); }}
                >
                  {opt.label}
                </Box>
              ))}
            </Box>
          </Box>

          {/* States */}
          {loading && (
            <Box className="product-list__loading">
              <CircularProgress sx={{ color: "#1a1a1a" }} />
            </Box>
          )}

          {error && !loading && (
            <Alert severity="error" className="product-list__error">
              Failed to load products: {error.message}
            </Alert>
          )}

          {!loading && !error && products.length === 0 && (
            <Box className="product-list__empty">
              <Typography className="product-list__empty-icon">🚲</Typography>
              <Typography className="product-list__empty-title">No products found</Typography>
              <Typography className="product-list__empty-sub">
                Try adjusting your filters
              </Typography>
            </Box>
          )}

          {/* Grid */}
          {!loading && products.length > 0 && (
            <Box className="product-list__grid">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </Box>
          )}

          {/* Pagination */}
          {!loading && pageCount > 1 && (
            <Box className="product-list__pagination-wrap">
              <Pagination
                page={page}
                count={pageCount}
                onChange={(_, v) => {
                  setPage(v);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                shape="circular"
                color="primary"
                size="large"
              />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default withLayoutBasic(ProductList);

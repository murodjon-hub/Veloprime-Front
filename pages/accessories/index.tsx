import React, { useState } from "react";
import { NextPage } from "next";
import { Box, Typography, Pagination, CircularProgress, Alert } from "@mui/material";
import { useQuery } from "@apollo/client";
import useDeviceDetect from "../../libs/hooks/useDeviceDetect";
import withLayoutBasic from "../../libs/components/layout/LayoutBasic";
import { Product } from "../../libs/components/product/ProductCard";
import { GET_PRODUCTS } from "../../apollo/user/query";
import AccessoryCard from "../../libs/components/accesories/accessories_card";

const PAGE_LIMIT = 12;

const SORT_OPTIONS = [
  { label: "Newest",       value: "createdAt",   dir: "DESC" },
  { label: "Price ↑",     value: "productPrice", dir: "ASC"  },
  { label: "Price ↓",     value: "productPrice", dir: "DESC" },
  { label: "Most Viewed", value: "productViews", dir: "DESC" },
  { label: "Most Liked",  value: "productLikes", dir: "DESC" },
];

const AccessoriesPage: NextPage = () => {
  const device = useDeviceDetect();

  const [currentPage, setCurrentPage] = useState(1);
  const [currentSort, setCurrentSort] = useState(0);

  const resetPage = () => setCurrentPage(1);
  const sortOpt   = SORT_OPTIONS[currentSort];

  const buildInput = () => ({
    page:      currentPage,
    limit:     PAGE_LIMIT,
    sort:      sortOpt.value,
    direction: sortOpt.dir,
    search: {
      productTypeList: ["ACCESSORY"],
    },
  });

  const { data, loading, error } = useQuery(GET_PRODUCTS, {
    variables:   { input: buildInput() },
    fetchPolicy: "cache-and-network",
  });

  const products: Product[] = data?.getProducts?.list ?? [];
  const total: number       = data?.getProducts?.metaCounter?.[0]?.total ?? 0;
  const pageCount           = Math.ceil(total / PAGE_LIMIT);

  /** Mobile */
  if (device === "mobile") {
    return (
      <Box className="acc-page acc-page--mobile">
        <Box className="acc-page__topbar">
          <Typography className="acc-page__heading">Accessories</Typography>
          <Box className="acc-page__sort-row">
            {SORT_OPTIONS.map((opt, i) => (
              <Box
                key={i}
                className={`acc-page__sort-chip${currentSort === i ? " acc-page__sort-chip--active" : ""}`}
                onClick={() => { setCurrentSort(i); resetPage(); }}
              >
                {opt.label}
              </Box>
            ))}
          </Box>
        </Box>

        {loading && <CircularProgress className="acc-page__spinner" />}
        {error   && <Alert severity="error">{error.message}</Alert>}

        <Box className="acc-page__grid">
          {products.map((p) => <AccessoryCard key={p._id} product={p} />)}
        </Box>

        {pageCount > 1 && (
          <Pagination
            page={currentPage}
            count={pageCount}
            onChange={(_, v) => setCurrentPage(v)}
            className="acc-page__pagination"
            shape="circular"
            color="primary"
          />
        )}
      </Box>
    );
  }

  /** Desktop */
  return (
    <Box id="accessories-page" className="acc-page">

      {/* Banner */}
      <Box className="acc-page__banner">
        <Box className="acc-page__banner-inner">
          <Typography className="acc-page__banner-title">Accessories</Typography>
        </Box>
      </Box>

      {/* Sort bar */}
      <Box className="acc-page__sortbar">
        <Box className="acc-page__sort-row">
          {SORT_OPTIONS.map((opt, i) => (
            <Box
              key={i}
              className={`acc-page__sort-chip${currentSort === i ? " acc-page__sort-chip--active" : ""}`}
              onClick={() => { setCurrentSort(i); resetPage(); }}
            >
              {opt.label}
            </Box>
          ))}
        </Box>
      </Box>

      {loading && (
        <Box className="acc-page__loading">
          <CircularProgress />
        </Box>
      )}

      {error && !loading && (
        <Alert severity="error" className="acc-page__error">
          Failed to load accessories: {error.message}
        </Alert>
      )}

      {!loading && !error && products.length === 0 && (
        <Box className="acc-page__empty">
          <Typography className="acc-page__empty-icon">🎒</Typography>
          <Typography className="acc-page__empty-title">No accessories found</Typography>
          <Typography className="acc-page__empty-sub">Check back soon</Typography>
        </Box>
      )}

      {!loading && products.length > 0 && (
        <Box className="acc-page__grid">
          {products.map((p) => <AccessoryCard key={p._id} product={p} />)}
        </Box>
      )}

      {!loading && pageCount > 1 && (
        <Box className="acc-page__pagination-wrap">
          <Pagination
            page={currentPage}
            count={pageCount}
            onChange={(_, v) => {
              setCurrentPage(v);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            shape="circular"
            color="primary"
            size="large"
          />
        </Box>
      )}
    </Box>
  );
};

export default withLayoutBasic(AccessoriesPage);
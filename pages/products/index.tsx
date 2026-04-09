import React, { useState } from "react";
import { NextPage } from "next";
import {Pagination, Stack, Typography } from "@mui/material";
import useDeviceDetect from "../../libs/hooks/useDeviceDetect";
import withLayoutBasic from "../../libs/components/layout/LayoutBasic";
import ProductCard from "../../libs/components/product/ProductCard";
import Filter from "../../libs/components/product/Filter";

const PropertyList: NextPage = () => {
  const device = useDeviceDetect();
  if (device === "mobile") {
    return <Stack>PROPERTY LIST MOBILE MOBILE</Stack>;
  } else {
    return (
      <div id={"property-list-page"} style={{ position: "relative" }}>
        <Stack className={"container"}>
          
          <Stack className={"property-page"}>
            <Stack className={"filter-config"}>
              <Filter />
            </Stack>
            <Stack className={"main-config"} mb={"76px"}>
              <Stack className={"list-config"}>
                 {
                  <ProductCard />
                }
              </Stack>
              <Stack className="pagination-config">
                <Stack className="pagination-box">
                  <Pagination
                    page={1}
                    count={5}
                    shape="circular"
                    color="primary"
                  />
                </Stack>
                <Stack className="total-result">
                  <Typography>Total 5 properties available</Typography>
                </Stack>
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </div>
    );
  };
};

export default withLayoutBasic(PropertyList);

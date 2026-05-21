
import { useQuery } from "@apollo/client";
import { Stack } from "@mui/material";
import { NextPage } from "next";
import useDeviceDetect from "../libs/hooks/useDeviceDetect";
import { GET_PRODUCTS } from "../apollo/user/query";
import NewArrivals from "../libs/components/homepage/New_arrivals";
import withLayoutMain from "../libs/components/layout/LayoutHome";
import FeaturedProduct from "../libs/components/homepage/Featured_product";
import E_bike from "../libs/components/homepage/E_bike";
import Community from "../libs/components/homepage/Community";
import Accessories from "../libs/components/homepage/Accesories";
import Events from "../libs/components/homepage/Events";

const Home: NextPage = () => {
  const device = useDeviceDetect();

const {
  loading: getProductsLoading,
  data: getProductsData,
  error: getProductssError,
  refetch: getProductsRefetch,
} = useQuery(GET_PRODUCTS, {
  fetchPolicy: "network-only",
  variables : {
     input: {
        page: 1,
        limit: 4,
        sort: "createdAt",
        direction: "DESC",
        search: {
        }
    }
  }

});

console.log("getProductsData =>", getProductsData);

  if (device === "mobile") {
    return <Stack>HOMEPAGE MOBILE</Stack>;
  } else {
    return (
      <Stack>
        <Stack className={"home-page"}>
          <NewArrivals />
          <FeaturedProduct />
          <E_bike />
          <Community />
          <Accessories />
          <Events />
        </Stack>
      </Stack>
    );
  }
};

export default withLayoutMain(Home);

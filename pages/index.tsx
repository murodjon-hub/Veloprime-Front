
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
import AiShowcase from "../libs/components/homepage/AiShowcase";
import { AiLauncher } from "../libs/components/ai/AiLauncher";

const Home: NextPage = () => {
  const device = useDeviceDetect();

useQuery(GET_PRODUCTS, {
  fetchPolicy: "network-only",
  variables: {
    input: { page: 1, limit: 4, sort: "createdAt", direction: "DESC", search: {} },
  },
});


  if (device === "mobile") {
    return <Stack>HOMEPAGE MOBILE</Stack>;
  } else {
    return (
      <Stack>
        <Stack className={"home-page"}>
          <NewArrivals />
          <FeaturedProduct />
          <E_bike />
          <AiShowcase />
          <Community />
          <Accessories />
          <Events />
        </Stack>
        <AiLauncher />
      </Stack>
    );
  }
};

export default withLayoutMain(Home);

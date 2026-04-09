import React from "react";
import { Stack } from "@mui/material";
import Head from "next/head";
import Top from "../Top";
import Footer from "../Footer";
import useDeviceDetect from "../../hooks/useDeviceDetect";

const withLayoutMain = (Component: React.ComponentType<any>) => {
  return (props: any) => {
    const device = useDeviceDetect();
    if (device == "mobile") {
      return <>
      <Head>
            <title>Nestar</title>
          </Head>
          <Stack id="mobile-wrap">
            <Stack id={"top"}>
              <Top />
            </Stack>
            <Stack id={"main"}>
              <Component {...props} />
            </Stack>

            <Stack id={"footer"}>
              <Footer />
            </Stack>
          </Stack>
          </>
          
    } else {
      return (
        <>
          <Head>
            <title>Nestar</title>
          </Head>
          <Stack id="pc-wrap">
            <Stack id={"top"}>
              <Top />
            </Stack>
          

            

            <Stack id={"main"}>
              <Component {...props} />
            </Stack>

            <Stack id={"footer"}>
              <Footer />
            </Stack>
          </Stack>
        </>
      );
    }
  };
};

export default withLayoutMain;


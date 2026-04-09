import { Stack } from "@mui/material";
import Head from "next/head";
import Footer from "../Footer";
import useDeviceDetect from "../../hooks/useDeviceDetect";
import Top from "../Top";
import Header2 from "../Header2";


const withLayoutBasic = (Component: any) => {
  return (props: any) => {
    const device = useDeviceDetect();
    if (device == "mobile") {
      return (
        <>
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
      );
    } else {
      return (
        <>
          <Head>
            <title>Nestar</title>
          </Head>
          <Stack id="pc-wrap">
            <Stack id={"top"}>
             <Header2 />
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
    };
  };
};

export default withLayoutBasic;

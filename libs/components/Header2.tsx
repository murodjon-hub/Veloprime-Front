import { Logout } from "@mui/icons-material";
import { Box, Stack } from "@mui/material";
import Link from "next/link";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import useDeviceDetect from "../hooks/useDeviceDetect";

const Header2 = () => {
  const device = useDeviceDetect();
  if (device == "mobile") {
    return (
      <Stack className={"navbar"}>
        <Link href={"/"}>
          <div>Home</div>
        </Link>
        <Link href={"/property"}>
          <div>Properties</div>
        </Link>
        <Link href={"/accessories"}>
          <div>Agents</div>
        </Link>
        <Link href={"/community"}>
          <div>Community</div>
        </Link>
        <Link href={"/cs"}>
          <div>CS</div>
        </Link>
      </Stack>
    );
  } else {
    return (
      <Stack className="bike-hero-section">
          <div className="bike-hero-inner">
            <header className="bike-topbar">
              <div className="bike-brand">ZYRO</div>

              <nav className="bike-menu">
                <a href="/">HOME</a>
                <a href="/product">BIKES</a>
                <a href="/accessories">ACCESSORIES</a>
                <a href="/community">BLOGS</a>
                <a href="/cs">CONTACT</a>
              </nav>

              <div className="bike-actions">
                <img src="/img/icons/searchWhite.svg" alt="search" />
                <i className="fas fa-user"></i>
                <i className="fas fa-shopping-cart"></i>
              </div>
            </header>
          </div>
        
      </Stack>
    );
  }
};

export default Header2;

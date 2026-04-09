import React, { useState } from "react";
import {
  Stack,
  Typography,
  Checkbox,
  Button,
  OutlinedInput,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  IconButton,
  InputAdornment,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { propertySquare } from "../../config";

const Filter = () => {
  const [searchText, setSearchText] = useState<string>("");
  const [showMore, setShowMore] = useState<boolean>(false);
  const [propertyPrice, setPropertyPrice] = useState({
    start: 0,
    end: 250000,
  });

  return (
    <Stack className="filter-main">
      <Stack className="find-your-home" mb="40px">
        <Typography className="title-main">Find your Bike</Typography>
        <Stack className="input-box">
          <OutlinedInput
            placeholder="What are you looking for?"
            endAdornment={
              <InputAdornment position="end">
                <RefreshIcon />
              </InputAdornment>
            }
          />
        </Stack>
      </Stack>

      <Stack className="filter-group" mb="30px">
        <Typography className="title-sub">Location</Typography>
        {["SEOUL", "BUSAN", "INCHEON", "DAEGU", "GYEONGJU"].map((loc) => (
          <Stack key={loc} direction="row" alignItems="center" className="checkbox-item">
            <Checkbox size="small" />
            <Typography>{loc}</Typography>
          </Stack>
        ))}
      </Stack>

      <Stack className="filter-group" mb="30px">
        <Typography className="title-sub">Property Type</Typography>
        {["APARTMENT", "VILLA", "HOUSE"].map((type) => (
          <Stack key={type} direction="row" alignItems="center" className="checkbox-item">
            <Checkbox size="small" />
            <Typography>{type}</Typography>
          </Stack>
        ))}
      </Stack>
      <Stack className={"find-your-home"} mb={"30px"}>
        <Typography className={"title"}>Rooms</Typography>
        <Stack className={"button-group"}>
          <Button
            sx={{
              borderRadius: "12px 0 0 12px",
              border: "1px solid #b9b9b9",
            }}
          >
            Any
          </Button>
          <Button
            sx={{
              borderRadius: 0,
              border: "1px solid #b9b9b9",
            }}
          >
            1
          </Button>
          <Button
            sx={{
              borderRadius: 0,
              border: "2px solid #181A20",
            }}
          >
            2
          </Button>
          <Button
            sx={{
              borderRadius: 0,
              border: "1px solid #b9b9b9",
            }}
          >
            3
          </Button>
          <Button
            sx={{
              borderRadius: 0,
              border: "2px solid #181A20",
            }}
          >
            4
          </Button>
          <Button
            sx={{
              borderRadius: "0 12px 12px 0",
              border: "1px solid #b9b9b9",
            }}
          >
            5+
          </Button>
        </Stack>
      </Stack>
      <Stack className={"find-your-home"} mb={"30px"}>
        <Typography className={"title"}>Bedrooms</Typography>
        <Stack className={"button-group"}>
          <Button
            sx={{
              borderRadius: "12px 0 0 12px",
              border: "1px solid #b9b9b9",
            }}
          >
            Any
          </Button>
          <Button
            sx={{
              borderRadius: 0,
              border: "1px solid #b9b9b9",
            }}
          >
            1
          </Button>
          <Button
            sx={{
              borderRadius: 0,
              border: "2px solid #181A20",
            }}
          >
            2
          </Button>
          <Button
            sx={{
              borderRadius: 0,
              border: "1px solid #b9b9b9",
            }}
          >
            3
          </Button>
          <Button
            sx={{
              borderRadius: 0,
              border: "1px solid #b9b9b9",
            }}
          >
            4
          </Button>
          <Button
            sx={{
              borderRadius: "0 12px 12px 0",
              border: "1px solid #b9b9b9",
            }}
          >
            5+
          </Button>
        </Stack>
      </Stack>

      <Stack className="filter-group" mb="30px">
        <Typography className="title-sub">Options</Typography>
        <Stack direction="row" alignItems="center" className="checkbox-item">
          <Checkbox size="small" />
          <Typography>Barter</Typography>
        </Stack>
        <Stack direction="row" alignItems="center" className="checkbox-item">
          <Checkbox size="small" />
          <Typography>Rent</Typography>
        </Stack>
      </Stack>

      <Stack className="filter-group" mb="30px">
        <Typography className="title-sub">Square meter</Typography>
        <Stack direction="row" spacing={2}>
          <FormControl fullWidth size="small">
            <Select defaultValue={0}>
              <MenuItem value={0}>Min 0</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <Select defaultValue={500}>
              <MenuItem value={500}>Max 500</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Stack>

      <Stack className="filter-group">
        <Typography className="title-sub">Price Range</Typography>
        <Stack direction="row" spacing={2}>
          <OutlinedInput size="small" placeholder="$ min" />
          <OutlinedInput size="small" placeholder="$ max" />
        </Stack>
      </Stack>
    </Stack>
  );
};

export default Filter;

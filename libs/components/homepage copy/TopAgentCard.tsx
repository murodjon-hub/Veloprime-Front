import React from "react";
import { Box, Typography, Stack } from "@mui/material";

const TopAgentCard = () => {
  return (
    <Stack className="top-agent-card">
      <Box className="agent-img-box">
        <img src="/img/profile/rasm.jpg" alt="Agent" />
      </Box>
      <Box className="agent-info">
        <Typography className="name">Martin</Typography>
        <Typography className="type">AGENT</Typography>
      </Box>
    </Stack>
  );
};

export default TopAgentCard;

import React, { useState } from "react";
import { Stack, Box, Container, Typography, IconButton, Button } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';


const PopularProperties = ({ initialInput, ...props }: any) => {

  return (
    <Stack className={"popular-properties"}>
       <Container maxWidth="lg" className="featured-bike-section">
      <Typography variant="h1" className="featured-bike-top-text">
        Discover our featured bike crafted for those who ride beyond limits.
      </Typography>

      <Box className="featured-bike-carousel">
        <IconButton className="carousel-arrow arrow-left">
          <ArrowBackIcon />
        </IconButton>

        <Box className="bike-image-container">
          <Typography component="span" className="background-number">
            Niro200
          </Typography>
          <img
            className="bike-image"
            src="../img/4253517958_2224302_3.png"
            alt="Black Speed GT 470"
          />
        </Box>

        <IconButton className="carousel-arrow arrow-right">
          <ArrowForwardIcon />
        </IconButton>
      </Box>

      <Box className="featured-bike-info">
        <Typography variant="h2" className="bike-title">
          Black Speed GT 470
        </Typography>
        <Typography variant="body1" className="bike-description">
          Smooth, stylish, and effortlessly powerful built for everyday adventures
          with comfort, control, and performance in every ride.
        </Typography>
        <Button variant="contained" className="buy-now-btn">
          Buy Now
        </Button>
      </Box>
    </Container>
    </Stack>
  );
};



export default PopularProperties;

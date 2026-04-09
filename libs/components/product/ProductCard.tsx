import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Typography,
} from "@mui/material";
import React from "react";

const PropertyCard = () => {
  interface Bike {
    id: string;
    name: string;
    category: string;
    price: string;
    image: string;
  }
  const bikes: Bike[] = [
    {
      id: "1",
      name: "Trailblazer 4.0 - Forest Green",
      category: "Enduro / Trail",
      price: "$699.00 USD",
      image: "../img/4253517958_2224302_3.png",
    },
    {
      id: "2",
      name: "RidgeX 3.8 - Ocean Blue",
      category: "Road / Race",
      price: "$899.00 USD",
      image: "../img/4253517958_2224302_3.png",
    },
    {
      id: "3",
      name: "Trailblazer 4.0 - Forest Green",
      category: "Enduro / Trail",
      price: "$425.00 USD",
      image: "../img/4253517958_2224302_3.png",
    },
    {
      id: "4",
      name: "Trailblazer 4.0 - Forest Green",
      category: "Enduro / Trail",
      price: "$425.00 USD",
      image: "../img/4253517958_2224302_3.png",
    },
  ];

  return (
    <Box className="bike-grid-section">
      <Box className="bike-grid-header">
        <Typography variant="h4" component="h2" className="bike-grid-title">
          OUR BIKES
        </Typography>
        <Button variant="outlined" className="bike-grid-see-all-button">
          See All →
        </Button>
      </Box>
      <Box className="bike-grid">
        {bikes.map((bike) => (
          <Card key={bike.id} className="bike-card">
            <CardContent className="bike-card-content">
              <Typography
                variant="subtitle1"
                component="h3"
                className="bike-name"
              >
                {bike.name}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                className="bike-category"
              >
                {bike.category}
              </Typography>
            </CardContent>
            <CardMedia
              component="img"
              image={bike.image}
              alt={bike.name}
              className="bike-image"
            />
            <Box className="bike-card-footer">
              <Typography variant="body1" className="bike-price">
                {bike.price}
              </Typography>
              <Button variant="contained" className="bike-buy-button">
                Buy Now
              </Button>
            </Box>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default PropertyCard;

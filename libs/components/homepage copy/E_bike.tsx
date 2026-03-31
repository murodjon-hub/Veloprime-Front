import React from 'react';
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Typography,
  Box,
  Link,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';


interface Product {
  id: number;
  name: string;
  category: string;
  price: string;
  src: string;
  isLarge?: boolean;
}

const products: Product[] = [
  {
    id: 1,
    name: "SprintX 4.0 - Solar Yellow",
    category: "Performance / Road",
    price: "$2,799.00 USD",
    src: "../img/4253517958_2224302_3.png",
    isLarge: true,
  },
  {
    id: 2,
    name: "GlideEdge 4.5 - Emerald Teal",
    category: "Performance / All-Rounder",
    price: "$2,899.00 USD",
    src: "../img/4253517958_2224302_3.png",
  },
  {
    id: 3,
    name: "AeroBolt 5.2 - Olive Green",
    category: "Endurance / Touring",
    price: "$2,699.00 USD",
    src: "../img/4253517958_2224302_3.png",
  },
  {
    id: 4,
    name: "GlideEdge 4.5 - Emerald Teal",
    category: "Performance / All-Rounder",
    price: "$2,899.00 USD",
    src: "../img/4253517958_2224302_3.png",
  },
  {
    id: 6,
    name: "GlideEdge 4.5 - Deep Blue",
    category: "Performance / All-Rounder",
    price: "$2,899.00 USD",
    src: "../img/4253517958_2224302_3.png",
  },
    {
    id: 6,
    name: "GlideEdge 4.5 - Deep Blue",
    category: "Performance / All-Rounder",
    price: "$2,899.00 USD",
    src: "../img/4253517958_2224302_3.png",
  },

  
];

const Advertisement = () => {
  return (
   <Box className="e-bike">
      <Container maxWidth="lg">
        {/* Header Section */}
        <Box className="arrivals-header">
          <Typography variant="h3" component="h2" className="arrivals-title">
            E-BIKE COLLECTION
          </Typography>
          <Link href="#" className="see-all-link" underline="none">
            See All <ArrowForwardIcon sx={{ fontSize: 18, marginLeft: 1 }} />
          </Link>
        </Box>

        {/* Products Grid */}
        <Grid container spacing={3} className="products-grid">
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <Card className="product-card">
                {/* Product Image */}
                <CardMedia
                  component="img"
                  height="280"
                  image={product.src}
                  alt={product.name}
                  className="product-image"
                />

                {/* Product Info */}
                <CardContent className="product-info">
                  <Typography gutterBottom variant="h6" component="div" className="product-name">
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" className="product-category">
                    {product.category}
                  </Typography>
                </CardContent>

                {/* Product Footer */}
                <CardActions className="product-footer">
                  <Typography variant="body1" className="product-price">
                    ${product.price} 
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    className="buy-now-btn"
                    sx={{
                      backgroundColor: '#000',
                      color: '#fff',
                      '&:hover': {
                        backgroundColor: '#333',
                      },
                    }}
                  >
                    Buy Now
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Advertisement;
